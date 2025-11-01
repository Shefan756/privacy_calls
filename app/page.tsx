'use client';

import { useState, useEffect } from 'react';
import { Shield, Video, Phone, MessageSquare } from 'lucide-react';
import CreateRoom from '@/components/CreateRoom';
import JoinRoom from '@/components/JoinRoom';
import Room from '@/components/Room';

export default function Home() {
  const [view, setView] = useState<'home' | 'create' | 'join' | 'room'>('home');
  const [roomData, setRoomData] = useState<any>(null);
  const [joinRoomId, setJoinRoomId] = useState<string>('');

  useEffect(() => {
    // Check if there's a join parameter in the URL
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('join');
    if (roomId) {
      setJoinRoomId(roomId);
      setView('join');
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleRoomCreated = (data: any) => {
    setRoomData(data);
    setView('room');
  };

  const handleRoomJoined = (data: any) => {
    setRoomData(data);
    setView('room');
  };

  const handleLeaveRoom = () => {
    setRoomData(null);
    setView('home');
  };

  if (view === 'room' && roomData) {
    return <Room roomData={roomData} onLeave={handleLeaveRoom} />;
  }

  if (view === 'create') {
    return <CreateRoom onRoomCreated={handleRoomCreated} onBack={() => setView('home')} />;
  }

  if (view === 'join') {
    return <JoinRoom onRoomJoined={handleRoomJoined} onBack={() => setView('home')} initialRoomId={joinRoomId} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 md:p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 md:w-16 md:h-16 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">Privacy Calls</h1>
          <p className="text-lg md:text-xl text-blue-200">Ultra-Secure Communication Platform</p>
          <p className="text-xs md:text-sm text-blue-300 mt-2">End-to-end encrypted • No traces • Complete privacy</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 text-center">
            <Video className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Video Calls</h3>
            <p className="text-blue-200 text-sm">High-quality video with complete anonymity</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 text-center">
            <Phone className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Audio Calls</h3>
            <p className="text-blue-200 text-sm">Crystal clear voice communication</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 text-center">
            <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Text Chat</h3>
            <p className="text-blue-200 text-sm">Secure messaging with auto-deletion</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setView('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Create Secure Room
          </button>
          <button
            onClick={() => setView('join')}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg border border-blue-500/30"
          >
            Join Existing Room
          </button>
        </div>

        {/* Security Features */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4 text-center">Security Features</h3>
          <ul className="grid md:grid-cols-2 gap-3 text-blue-200 text-sm">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>IP address masking for all participants</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Unanimous approval for new members</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Voting system for all major actions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Complete session cleanup on exit</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>No logs, no traces, no history</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span>Equal privileges for all participants</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
