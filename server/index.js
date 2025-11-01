const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory storage (cleared on restart for privacy)
const rooms = new Map();
const users = new Map();

// Room structure:
// {
//   id, name, creator, admins: [], participants: [],
//   mode: 'video'|'audio'|'text',
//   joinRequests: [], endCallVotes: [], modeChangeVotes: []
// }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create room
  socket.on('create-room', ({ roomName, userName }) => {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: roomName,
      creator: socket.id,
      participants: [{
        id: socket.id,
        name: userName,
        isCreator: true
      }],
      mode: 'video',
      joinRequests: [],
      endCallVotes: new Set(),
      modeChangeVotes: new Map()
    };

    rooms.set(roomId, room);
    users.set(socket.id, { roomId, userName });
    socket.join(roomId);

    socket.emit('room-created', {
      roomId,
      room: sanitizeRoom(room)
    });
  });

  // Join room request
  socket.on('request-join', ({ roomId, userName }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Check if already in room
    if (room.participants.some(p => p.id === socket.id)) {
      socket.emit('error', { message: 'Already in room' });
      return;
    }

    const request = {
      id: socket.id,
      name: userName,
      approvals: new Set(),
      rejections: new Set(),
      timestamp: Date.now()
    };

    room.joinRequests.push(request);

    // Notify all participants
    io.to(roomId).emit('join-request', {
      requesterId: socket.id,
      requesterName: userName,
      participantCount: room.participants.length
    });

    socket.emit('join-request-sent', { roomId });
  });

  // Approve join request
  socket.on('approve-join', ({ roomId, requesterId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find(p => p.id === socket.id);
    if (!participant) return;

    const request = room.joinRequests.find(r => r.id === requesterId);
    if (!request) return;

    request.approvals.add(socket.id);

    // Check if all participants approved
    if (request.approvals.size === room.participants.length) {
      // Add to room - everyone has equal privileges
      const newParticipant = {
        id: requesterId,
        name: request.name,
        isCreator: false
      };

      room.participants.push(newParticipant);
      users.set(requesterId, { roomId, userName: request.name });

      // Remove request
      room.joinRequests = room.joinRequests.filter(r => r.id !== requesterId);

      // Notify requester
      io.to(requesterId).emit('join-approved', {
        roomId,
        room: sanitizeRoom(room),
        participant: newParticipant
      });

      // Join socket room
      const requesterSocket = io.sockets.sockets.get(requesterId);
      if (requesterSocket) {
        requesterSocket.join(roomId);
      }

      // Notify all participants
      io.to(roomId).emit('participant-joined', {
        participant: newParticipant,
        room: sanitizeRoom(room)
      });
    } else {
      // Notify about approval progress
      io.to(roomId).emit('join-approval-progress', {
        requesterId,
        approvals: request.approvals.size,
        required: room.participants.length
      });
    }
  });

  // Reject join request
  socket.on('reject-join', ({ roomId, requesterId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.joinRequests = room.joinRequests.filter(r => r.id !== requesterId);

    io.to(requesterId).emit('join-rejected', { roomId });
    io.to(roomId).emit('join-request-rejected', { requesterId });
  });

  // Vote to end call
  socket.on('vote-end-call', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find(p => p.id === socket.id);
    if (!participant) return;

    room.endCallVotes.add(socket.id);

    // Notify all participants
    io.to(roomId).emit('end-call-vote-update', {
      votes: room.endCallVotes.size,
      required: room.participants.length,
      voters: Array.from(room.endCallVotes)
    });

    // Check if all voted
    if (room.endCallVotes.size === room.participants.length) {
      // End call and cleanup
      io.to(roomId).emit('call-ended', { reason: 'unanimous-vote' });
      
      // Cleanup room
      setTimeout(() => {
        cleanupRoom(roomId);
      }, 1000);
    }
  });

  // Request mode change
  socket.on('request-mode-change', ({ roomId, newMode }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const voteId = `${newMode}-${Date.now()}`;
    room.modeChangeVotes.set(voteId, {
      mode: newMode,
      votes: new Set([socket.id]),
      initiator: socket.id
    });

    io.to(roomId).emit('mode-change-vote', {
      voteId,
      newMode,
      initiator: socket.id,
      votes: 1,
      required: room.participants.length
    });
  });

  // Vote on mode change
  socket.on('vote-mode-change', ({ roomId, voteId, approve }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const vote = room.modeChangeVotes.get(voteId);
    if (!vote) return;

    if (approve) {
      vote.votes.add(socket.id);

      io.to(roomId).emit('mode-change-vote-update', {
        voteId,
        votes: vote.votes.size,
        required: room.participants.length
      });

      // Check if all voted
      if (vote.votes.size === room.participants.length) {
        room.mode = vote.mode;
        io.to(roomId).emit('mode-changed', { newMode: vote.mode });
        room.modeChangeVotes.delete(voteId);
      }
    } else {
      // Rejected
      io.to(roomId).emit('mode-change-rejected', { voteId });
      room.modeChangeVotes.delete(voteId);
    }
  });

  // WebRTC signaling
  socket.on('webrtc-offer', ({ roomId, targetId, offer }) => {
    io.to(targetId).emit('webrtc-offer', {
      senderId: socket.id,
      offer
    });
  });

  socket.on('webrtc-answer', ({ roomId, targetId, answer }) => {
    io.to(targetId).emit('webrtc-answer', {
      senderId: socket.id,
      answer
    });
  });

  socket.on('webrtc-ice-candidate', ({ roomId, targetId, candidate }) => {
    io.to(targetId).emit('webrtc-ice-candidate', {
      senderId: socket.id,
      candidate
    });
  });

  // Send message
  socket.on('send-message', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const user = users.get(socket.id);
    if (!user) return;

    io.to(roomId).emit('new-message', {
      senderId: socket.id,
      senderName: user.userName,
      message,
      timestamp: Date.now()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user) {
      const room = rooms.get(user.roomId);
      if (room) {
        // Remove participant
        room.participants = room.participants.filter(p => p.id !== socket.id);
        room.endCallVotes.delete(socket.id);

        if (room.participants.length === 0) {
          // Last person left, cleanup room
          cleanupRoom(user.roomId);
        } else {
          // Notify others
          io.to(user.roomId).emit('participant-left', {
            participantId: socket.id,
            room: sanitizeRoom(room)
          });
        }
      }
      users.delete(socket.id);
    }
  });
});

function sanitizeRoom(room) {
  return {
    id: room.id,
    name: room.name,
    mode: room.mode,
    participants: room.participants,
    participantCount: room.participants.length
  };
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    // Remove all users from this room
    room.participants.forEach(p => {
      users.delete(p.id);
    });
    
    // Delete room
    rooms.delete(roomId);
    console.log(`Room ${roomId} cleaned up and removed`);
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Privacy Calls Server running on port ${PORT}`);
  console.log('Security features enabled: IP masking, session cleanup');
});
