'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Users,
  Copy,
  Check,
  Send,
  UserCheck,
  UserX,
  ThumbsUp,
  ThumbsDown,
  X,
  Link,
  Phone,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { Socket } from 'socket.io-client';

interface RoomProps {
  roomData: any;
  onLeave: () => void;
}

interface Participant {
  id: string;
  name: string;
  isCreator: boolean;
}

interface Message {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

interface JoinRequest {
  requesterId: string;
  requesterName: string;
  participantCount: number;
}

export default function Room({ roomData, onLeave }: RoomProps) {
  const [socket] = useState<Socket>(roomData.socket);
  const [room, setRoom] = useState(roomData.room);
  const [mode, setMode] = useState<'video' | 'audio' | 'text'>(roomData.room.mode);
  const [participants, setParticipants] = useState<Participant[]>(roomData.room.participants);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [endCallVotes, setEndCallVotes] = useState<Set<string>>(new Set());
  const [modeChangeVote, setModeChangeVote] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showEndCallVote, setShowEndCallVote] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Setup media stream for video/audio
    if (mode === 'video' || mode === 'audio') {
      setupMediaStream(mode);
    }

    // Socket event listeners
    socket.on('participant-joined', ({ participant, room: updatedRoom }) => {
      setParticipants(updatedRoom.participants);
      setRoom(updatedRoom);
      addSystemMessage(`${participant.name} joined the room`);
    });

    socket.on('participant-left', ({ participantId, room: updatedRoom }) => {
      const leftParticipant = participants.find(p => p.id === participantId);
      if (leftParticipant) {
        addSystemMessage(`${leftParticipant.name} left the room`);
      }
      setParticipants(updatedRoom.participants);
      setRoom(updatedRoom);
    });

    socket.on('join-request', (request: JoinRequest) => {
      setJoinRequests(prev => [...prev, request]);
    });

    socket.on('join-approval-progress', ({ requesterId, approvals, required }) => {
      // Update UI to show progress
    });

    socket.on('join-request-rejected', ({ requesterId }) => {
      setJoinRequests(prev => prev.filter(r => r.requesterId !== requesterId));
    });

    socket.on('end-call-vote-update', ({ votes, required, voters }) => {
      setEndCallVotes(new Set(voters));
      // Show notification about vote progress
      if (votes < required) {
        addSystemMessage(`End call vote: ${votes}/${required} participants voted`);
      }
    });

    socket.on('call-ended', ({ reason }) => {
      alert('Call ended by unanimous vote');
      cleanup();
      onLeave();
    });

    socket.on('mode-change-vote', ({ voteId, newMode, initiator, votes, required }) => {
      // Don't show vote UI to the initiator - they already voted
      if (initiator !== socket.id) {
        setModeChangeVote({ voteId, newMode, initiator, votes, required });
      } else {
        addSystemMessage(`Waiting for others to approve ${newMode} mode...`);
      }
    });

    socket.on('mode-change-vote-update', ({ voteId, votes, required }) => {
      if (modeChangeVote && modeChangeVote.voteId === voteId) {
        setModeChangeVote({ ...modeChangeVote, votes, required });
      }
      addSystemMessage(`Mode change vote: ${votes}/${required} participants voted`);
    });

    socket.on('mode-changed', ({ newMode }) => {
      setMode(newMode);
      setModeChangeVote(null);
      addSystemMessage(`Mode changed to ${newMode}`);
      
      if (newMode === 'video' || newMode === 'audio') {
        setupMediaStream(newMode);
      } else {
        stopMediaStream();
      }
    });

    socket.on('mode-change-rejected', () => {
      setModeChangeVote(null);
      addSystemMessage('Mode change rejected');
    });

    socket.on('new-message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle mode changes - restart media stream with correct constraints
  useEffect(() => {
    if (mode === 'video' || mode === 'audio') {
      setupMediaStream(mode);
    } else if (mode === 'text') {
      stopMediaStream();
    }
  }, [mode]);

  const setupMediaStream = async (targetMode?: 'video' | 'audio' | 'text') => {
    // Stop existing stream first
    stopMediaStream();
    
    const modeToUse = targetMode || mode;
    
    // Don't request media for text mode
    if (modeToUse === 'text') {
      return;
    }
    
    try {
      const constraints = {
        video: modeToUse === 'video' ? { width: 1280, height: 720 } : false,
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      // Set video source if in video mode
      if (modeToUse === 'video') {
        // Use setTimeout to ensure video element is ready
        setTimeout(() => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(e => console.log('Play error:', e));
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone');
    }
  };

  const stopMediaStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  const cleanup = () => {
    stopMediaStream();
    socket.disconnect();
  };

  const addSystemMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        senderId: 'system',
        senderName: 'System',
        message: text,
        timestamp: Date.now()
      }
    ]);
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyJoinLink = () => {
    const joinLink = `${window.location.origin}?join=${room.id}`;
    navigator.clipboard.writeText(joinLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleApproveJoin = (requesterId: string) => {
    socket.emit('approve-join', { roomId: room.id, requesterId });
    setJoinRequests(prev => prev.filter(r => r.requesterId !== requesterId));
  };

  const handleRejectJoin = (requesterId: string) => {
    socket.emit('reject-join', { roomId: room.id, requesterId });
    setJoinRequests(prev => prev.filter(r => r.requesterId !== requesterId));
  };

  const handleVoteEndCall = () => {
    // If alone in room, end immediately
    if (participants.length === 1) {
      cleanup();
      onLeave();
      return;
    }
    setShowEndCallVote(true);
  };

  const confirmEndCall = () => {
    socket.emit('vote-end-call', { roomId: room.id });
    setShowEndCallVote(false);
  };

  const cancelEndCall = () => {
    setShowEndCallVote(false);
  };

  const handleRequestModeChange = (newMode: 'video' | 'audio' | 'text') => {
    if (newMode === mode) {
      addSystemMessage(`Already in ${mode} mode`);
      return;
    }
    
    // If alone in room, change mode immediately
    if (participants.length === 1) {
      setMode(newMode);
      addSystemMessage(`Mode changed to ${newMode}`);
      
      if (newMode === 'video' || newMode === 'audio') {
        setupMediaStream(newMode);
      } else {
        stopMediaStream();
      }
      return;
    }
    
    socket.emit('request-mode-change', { roomId: room.id, newMode });
    addSystemMessage(`Requesting to switch to ${newMode} mode...`);
  };

  const handleVoteModeChange = (approve: boolean) => {
    if (!modeChangeVote) return;
    socket.emit('vote-mode-change', {
      roomId: room.id,
      voteId: modeChangeVote.voteId,
      approve
    });
    if (!approve) {
      setModeChangeVote(null);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    socket.emit('send-message', {
      roomId: room.id,
      message: messageInput.trim()
    });
    
    setMessageInput('');
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-blue-500/30 p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="w-full md:w-auto">
            <h1 className="text-lg md:text-2xl font-bold text-white truncate">{room.name}</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-1">
              <div className="flex items-center gap-2">
                <code className="text-xs md:text-sm text-blue-300 bg-slate-700/50 px-2 py-1 rounded">
                  ID: {room.id.substring(0, 6)}...
                </code>
                <button
                  onClick={handleCopyRoomId}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Copy Room ID"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleCopyJoinLink}
                className="flex items-center gap-2 bg-blue-600/50 hover:bg-blue-600 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded transition-colors"
                title="Copy Join Link"
              >
                <Link className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{linkCopied ? 'Link Copied!' : 'Copy Join Link'}</span>
                <span className="sm:hidden">{linkCopied ? 'Copied!' : 'Link'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex-1 md:flex-none justify-center"
            >
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">{participants.length}</span>
            </button>

            <button
              onClick={handleVoteEndCall}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors flex-1 md:flex-none justify-center"
            >
              <PhoneOff className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base hidden sm:inline">End Call</span>
              <span className="text-sm md:text-base sm:hidden">End</span>
            </button>
          </div>
        </div>
      </div>

      {/* End Call Confirmation Modal */}
      {showEndCallVote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-red-500/30 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">End Call Vote</h3>
            </div>
            <p className="text-blue-200 mb-6">
              Do you want to vote to end this call? All participants must agree to end the call.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmEndCall}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Vote to End Call
              </button>
              <button
                onClick={cancelEndCall}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Requests */}
      {joinRequests.length > 0 && (
        <div className="bg-yellow-900/30 border-b border-yellow-500/30 p-4">
          <div className="max-w-7xl mx-auto">
            {joinRequests.map(request => (
              <div
                key={request.requesterId}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 mb-2"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-white font-semibold">{request.requesterName}</p>
                    <p className="text-blue-200 text-sm">wants to join the room</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveJoin(request.requesterId)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectJoin(request.requesterId)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Change Vote */}
      {modeChangeVote && (
        <div className="bg-blue-900/30 border-b border-blue-500/30 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-white font-semibold">Mode Change Request</p>
                  <p className="text-blue-200 text-sm">
                    Switch to {modeChangeVote.newMode} mode ({modeChangeVote.votes}/{modeChangeVote.required} votes)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVoteModeChange(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVoteModeChange(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Call Votes */}
      {endCallVotes.size > 0 && (
        <div className="bg-red-900/30 border-b border-red-500/30 p-3">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-white">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              End call votes: {endCallVotes.size}/{participants.length}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video/Audio Area */}
        <div className="flex-1 p-4">
          {mode === 'text' ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-24 h-24 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Text Mode</h2>
                <p className="text-blue-200">Use the chat panel to communicate</p>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <div className={`video-grid video-grid-${Math.min(participants.length, 6)}`}>
                <div className="relative bg-slate-800 rounded-lg overflow-hidden">
                  {mode === 'video' ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-3xl font-bold text-white">
                            {roomData.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white font-semibold">{roomData.userName}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 px-3 py-1 rounded">
                    <p className="text-white text-sm">{roomData.userName} (You)</p>
                  </div>
                  {!videoEnabled && mode === 'video' && (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                      <VideoOff className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showMessages && (
          <div className="w-96 bg-slate-800/50 backdrop-blur-sm border-l border-blue-500/30 flex flex-col">
            <div className="p-4 border-b border-blue-500/30 flex items-center justify-between">
              <h3 className="text-white font-semibold">Chat</h3>
              <button
                onClick={() => setShowMessages(false)}
                className="text-blue-300 hover:text-blue-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${
                    msg.senderId === 'system'
                      ? 'text-center text-blue-300 text-sm italic'
                      : 'bg-slate-700/50 rounded-lg p-3'
                  }`}
                >
                  {msg.senderId !== 'system' && (
                    <>
                      <p className="text-blue-300 text-sm font-semibold">{msg.senderName}</p>
                      <p className="text-white mt-1">{msg.message}</p>
                      <p className="text-blue-400 text-xs mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </>
                  )}
                  {msg.senderId === 'system' && msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-blue-500/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-l border-blue-500/30 flex flex-col">
            <div className="p-4 border-b border-blue-500/30 flex items-center justify-between">
              <h3 className="text-white font-semibold">Participants</h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-blue-300 hover:text-blue-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-semibold">{participant.name}</p>
                    <div className="flex gap-2 mt-1">
                      {participant.isCreator && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">
                          Creator
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-t border-blue-500/30 p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex gap-2 flex-1 sm:flex-none">
            <button
              onClick={() => handleRequestModeChange('video')}
              className={`flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none ${
                mode === 'video'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
              }`}
            >
              <Video className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-base">Video</span>
            </button>
            <button
              onClick={() => handleRequestModeChange('audio')}
              className={`flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none ${
                mode === 'audio'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
              }`}
            >
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-base">Audio</span>
            </button>
            <button
              onClick={() => handleRequestModeChange('text')}
              className={`flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none ${
                mode === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-blue-300 hover:bg-slate-600'
              }`}
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-base">Text</span>
            </button>
          </div>

          <div className="flex gap-2 justify-center">
            {mode === 'video' && (
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-lg transition-colors ${
                  videoEnabled
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            )}
            {(mode === 'video' || mode === 'audio') && (
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-lg transition-colors ${
                  audioEnabled
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
