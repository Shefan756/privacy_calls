'use client';

import { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface CreateRoomProps {
  onRoomCreated: (data: any) => void;
  onBack: () => void;
}

export default function CreateRoom({ onRoomCreated, onBack }: CreateRoomProps) {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!roomName.trim() || !userName.trim()) {
      alert('Please enter both room name and your name');
      return;
    }

    setLoading(true);

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket: Socket = io(SOCKET_URL);

    socket.on('connect', () => {
      socket.emit('create-room', {
        roomName: roomName.trim(),
        userName: userName.trim()
      });
    });

    socket.on('room-created', (data) => {
      onRoomCreated({ ...data, socket, userName: userName.trim() });
    });

    socket.on('error', (error) => {
      alert(error.message);
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center text-blue-300 hover:text-blue-200 mb-4 md:mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          <span className="text-sm md:text-base">Back</span>
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 md:p-8">
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <Shield className="w-10 h-10 md:w-12 md:h-12 text-blue-400" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
            Create Secure Room
          </h2>
          <p className="text-sm md:text-base text-blue-200 text-center mb-6 md:mb-8">
            Set up your private communication space
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-blue-200 mb-2 font-medium">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
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
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {loading ? 'Creating Room...' : 'Create Room'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm">
              <span className="text-green-400 font-semibold">🔒 Secure:</span> All
              participants have equal privileges. Everyone must approve new members. Complete session cleanup on exit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
