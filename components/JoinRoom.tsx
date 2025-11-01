'use client';

import { useState } from 'react';
import { ArrowLeft, Shield, Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface JoinRoomProps {
  onRoomJoined: (data: any) => void;
  onBack: () => void;
  initialRoomId?: string;
}

export default function JoinRoom({ onRoomJoined, onBack, initialRoomId = '' }: JoinRoomProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleJoin = () => {
    if (!roomId.trim() || !userName.trim()) {
      alert('Please enter both room ID and your name');
      return;
    }

    setLoading(true);

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket: Socket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('request-join', {
        roomId: roomId.trim(),
        userName: userName.trim()
      });
    });

    newSocket.on('join-request-sent', () => {
      setLoading(false);
      setWaiting(true);
    });

    newSocket.on('join-approved', (data) => {
      onRoomJoined({ ...data, socket: newSocket, userName: userName.trim() });
    });

    newSocket.on('join-rejected', () => {
      alert('Your join request was rejected');
      setWaiting(false);
      setLoading(false);
      newSocket.disconnect();
    });

    newSocket.on('error', (error) => {
      alert(error.message);
      setLoading(false);
      setWaiting(false);
      newSocket.disconnect();
    });
  };

  const handleCancel = () => {
    if (socket) {
      socket.disconnect();
    }
    setWaiting(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center text-blue-300 hover:text-blue-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-blue-400" />
          </div>

          {waiting ? (
            <div className="text-center">
              <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Waiting for Approval
              </h2>
              <p className="text-blue-200 mb-6">
                All participants must approve your request to join
              </p>
              <button
                onClick={handleCancel}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Cancel Request
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                Join Secure Room
              </h2>
              <p className="text-blue-200 text-center mb-8">
                Enter room details to request access
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-blue-200 mb-2 font-medium">
                    Room ID
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter room ID"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 mb-2 font-medium">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                >
                  {loading ? 'Requesting...' : 'Request to Join'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <span className="text-yellow-400 font-semibold">⚠️ Note:</span> All
                  current participants must approve your request before you can join.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
