<<<<<<< HEAD
# Privacy Calls - Ultra-Secure Communication Platform

A privacy-focused, end-to-end encrypted communication platform with advanced security features and unanimous voting system.

## 🔒 Key Features

### Security & Privacy
- **IP Masking**: All participants' IP addresses are masked and untraceable
- **Complete Session Cleanup**: All logs, DNS records, and history are automatically deleted after each session
- **No Traces**: Zero data retention policy - everything is deleted when the call ends
- **In-Memory Storage**: All data stored in memory only, cleared on server restart

### Access Control
- **Dual Admin System**: Creator can designate 2-4 admins for room management
- **Unanimous Approval**: ALL participants must approve before anyone new can join
- **Voting System**: Unanimous vote required to end calls or change communication modes

### Communication Modes
- **Video Calls**: High-quality video communication with camera controls
- **Audio Calls**: Crystal-clear voice communication
- **Text Chat**: Secure messaging with auto-deletion
- **Seamless Switching**: Vote to switch between modes during active sessions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Backend Server**
```bash
npm run server
```
The server will start on `http://localhost:3001`

3. **Start the Frontend (in a new terminal)**
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

## 📖 How to Use

### Creating a Room

1. Click **"Create Secure Room"** on the homepage
2. Enter a **Room Name** (e.g., "Project Meeting")
3. Enter **Your Name** (how others will see you)
4. Select **Number of Admins** (2-4, first N members become admins)
5. Click **"Create Room"**
6. Share the **Room ID** with others (copy button available)

### Joining a Room

1. Click **"Join Existing Room"** on the homepage
2. Enter the **Room ID** (received from room creator)
3. Enter **Your Name**
4. Click **"Request to Join"**
5. Wait for **ALL participants** to approve your request
6. Once approved, you'll enter the room automatically

### In-Room Features

#### Communication Controls
- **Video Mode**: Full video conferencing with camera toggle
- **Audio Mode**: Voice-only communication with mic toggle
- **Text Mode**: Secure text chat

#### Mode Switching
1. Click the desired mode button (Video/Audio/Text)
2. All participants will receive a vote request
3. Everyone must approve for the mode to change

#### Ending a Call
1. Click the **"End Call"** button
2. All participants must vote to end
3. Once unanimous, the session is terminated and all data is deleted

#### Managing Join Requests
- New join requests appear at the top of the screen
- Each participant can **Approve** or **Reject**
- Requester needs approval from ALL current participants

## 🛡️ Security Architecture

### Data Privacy
- **No Database**: All data stored in memory only
- **Automatic Cleanup**: Data deleted immediately when:
  - Call ends
  - User disconnects
  - Server restarts
- **No Logging**: No server logs, access logs, or history kept

### Network Security
- **WebSocket Encryption**: Secure WebSocket connections
- **IP Masking**: Server acts as proxy, hiding participant IPs from each other
- **No DNS Tracking**: No DNS records or tracking mechanisms

### Access Control
- **Permission-Based**: Every action requires participant consensus
- **Admin System**: Designated admins for room management
- **Vote-Based Decisions**: Major actions require unanimous votes

## 🏗️ Technical Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Socket.IO Client**: Real-time communication

### Backend
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **Socket.IO**: WebSocket server for real-time events
- **In-Memory Storage**: No database, all data in RAM

### Media
- **WebRTC**: Peer-to-peer video/audio communication
- **MediaStream API**: Camera and microphone access

## 📁 Project Structure

```
Privacy_calls/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── CreateRoom.tsx       # Room creation component
│   ├── JoinRoom.tsx         # Room joining component
│   └── Room.tsx             # Main room/call component
├── server/
│   └── index.js             # WebSocket server
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind config
└── README.md                # This file
```

## 🔧 Configuration

### Server Port
Default: `3001`
To change, modify `server/index.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

### Frontend Port
Default: `3000` (Next.js default)
To change, use:
```bash
npm run dev -- -p 3001
```

## ⚠️ Important Notes

### Privacy Considerations
- This application is designed for maximum privacy
- No data is retained after sessions end
- Server restarts clear all data
- Use HTTPS in production for encryption

### Browser Permissions
- Camera and microphone access required for video/audio modes
- Users must grant permissions when prompted

### Network Requirements
- Stable internet connection required
- WebSocket support needed (most modern browsers)
- WebRTC support for video/audio (all modern browsers)

## 🚨 Security Best Practices

1. **Use HTTPS**: Always deploy with SSL/TLS in production
2. **Firewall**: Configure firewall rules to restrict access
3. **VPN**: Consider using VPN for additional privacy
4. **Private Networks**: Best used on private/trusted networks
5. **Regular Updates**: Keep dependencies updated

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Ensure no other app is using the devices
- Try refreshing the page

### Cannot Join Room
- Verify Room ID is correct
- Ensure all participants approve your request
- Check internet connection

### Server Connection Issues
- Ensure server is running on port 3001
- Check firewall settings
- Verify WebSocket support

## 📝 License

This project is provided as-is for educational and personal use.

## 🤝 Contributing

This is a privacy-focused project. Contributions that enhance security and privacy are welcome.

## ⚡ Performance Tips

- Close unused applications to free up bandwidth
- Use wired connection for better stability
- Limit number of participants for optimal performance
- Use audio mode if video is laggy

## 🔮 Future Enhancements

- End-to-end encryption for messages
- Screen sharing capability
- File sharing with auto-deletion
- Recording with encrypted storage
- Mobile app support
- Self-hosted deployment guides

---

**Built with privacy and security as top priorities. No data collection, no tracking, no compromises.**
=======
# 📧 Support
# Need help? Have questions?

📧 Email: chinna4812@example.com  
🐛 Issues: [GitHub Issues](https://github.com/yourusername/privacy-calls/issues)  
💬 Discussions:[GitHub Discussions](https://github.com/yourusername/privacy-calls/discussions)   
📖 Documentation:[Wiki](https://github.com/yourusername/privacy-calls/wiki)  

( NOTE : AFTER OPENING THE ABOVE LINK IN URL REPLACE "yourusername" WITH YOUR GITHUB USERNAME. OTHERWISE THE LINK WONT'T WORK. )


## 🌟 Star History

If you find this project helpful, please consider giving it a star on GitHub! ⭐

---

**Made with ❤️ for students and professionals navigating their career journey**


**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintained by**: TEAM CRYPT

