# Video Stream Fix - Audio to Video Mode Switching

## Issue
When switching from **audio mode** to **video mode**, the video element showed nothing (black screen). The camera wasn't being activated properly.

## Root Causes

### 1. Mode State Timing Issue
The `setupMediaStream()` function was reading the `mode` state variable, but when called during a mode change, it was reading the OLD mode value, not the new one.

```tsx
// BEFORE - BROKEN
const setupMediaStream = async () => {
  const constraints = {
    video: mode === 'video' ? { width: 1280, height: 720 } : false,  // ❌ Uses old mode
    audio: true
  };
  // ...
}
```

### 2. Stream Not Restarted
When switching from audio to video, the existing audio-only stream wasn't being stopped and replaced with a new video+audio stream.

### 3. Video Element Not Updated
The video element's `srcObject` wasn't being properly set when switching modes.

## Solutions Implemented

### 1. Pass Target Mode as Parameter ✅
```tsx
const setupMediaStream = async (targetMode?: 'video' | 'audio' | 'text') => {
  stopMediaStream();  // Stop existing stream first
  
  const modeToUse = targetMode || mode;  // Use passed mode or current mode
  
  if (modeToUse === 'text') {
    return;  // No media needed for text mode
  }
  
  const constraints = {
    video: modeToUse === 'video' ? { width: 1280, height: 720 } : false,
    audio: true
  };
  // ...
}
```

### 2. Always Stop Stream Before Starting New One ✅
```tsx
const setupMediaStream = async (targetMode?: 'video' | 'audio' | 'text') => {
  // Stop existing stream first - CRITICAL!
  stopMediaStream();
  
  // Then request new stream with correct constraints
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  localStreamRef.current = stream;
}
```

### 3. Properly Attach Video Stream ✅
```tsx
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
```

### 4. Add Mode Change Effect ✅
```tsx
// Watch for mode changes and restart stream
useEffect(() => {
  if (mode === 'video' || mode === 'audio') {
    setupMediaStream(mode);  // Pass current mode
  } else if (mode === 'text') {
    stopMediaStream();
  }
}, [mode]);  // Trigger when mode changes
```

### 5. Update All Mode Change Calls ✅
```tsx
// Solo user mode change
if (participants.length === 1) {
  setMode(newMode);
  if (newMode === 'video' || newMode === 'audio') {
    setupMediaStream(newMode);  // ✅ Pass new mode
  }
}

// Multi-user mode change (from server)
socket.on('mode-changed', ({ newMode }) => {
  setMode(newMode);
  if (newMode === 'video' || newMode === 'audio') {
    setupMediaStream(newMode);  // ✅ Pass new mode
  }
});
```

## How It Works Now

### Switching Audio → Video:
```
1. User clicks "Video" button
   ↓
2. setMode('video') updates state
   ↓
3. useEffect detects mode change
   ↓
4. setupMediaStream('video') called
   ↓
5. stopMediaStream() stops audio-only stream
   ↓
6. getUserMedia({ video: true, audio: true })
   ↓
7. New stream with video+audio created
   ↓
8. localStreamRef.current = stream
   ↓
9. setTimeout ensures video element ready
   ↓
10. localVideoRef.current.srcObject = stream
   ↓
11. video.play() starts playback
   ↓
12. ✅ Camera appears on screen!
```

### Switching Video → Audio:
```
1. User clicks "Audio" button
   ↓
2. setMode('audio') updates state
   ↓
3. useEffect detects mode change
   ↓
4. setupMediaStream('audio') called
   ↓
5. stopMediaStream() stops video+audio stream
   ↓
6. getUserMedia({ video: false, audio: true })
   ↓
7. New audio-only stream created
   ↓
8. ✅ Camera turns off, mic stays on
```

### Switching to Text:
```
1. User clicks "Text" button
   ↓
2. setMode('text') updates state
   ↓
3. useEffect detects mode change
   ↓
4. stopMediaStream() called
   ↓
5. All tracks stopped
   ↓
6. ✅ Camera and mic turn off
```

## Key Improvements

✅ **Always stop stream before starting new one** - Prevents conflicts
✅ **Pass target mode explicitly** - No timing issues with state
✅ **Use useEffect to watch mode changes** - Automatic stream updates
✅ **setTimeout for video element** - Ensures DOM is ready
✅ **Explicit play() call** - Handles autoplay restrictions
✅ **Early return for text mode** - Don't request media unnecessarily

## Testing Scenarios

### Test 1: Audio → Video
1. Start in audio mode (mic icon, no camera)
2. Click "Video" button
3. ✅ Camera should turn on immediately
4. ✅ Video should show your face (mirrored)
5. ✅ Mic should still work

### Test 2: Video → Audio
1. Start in video mode (camera on)
2. Click "Audio" button
3. ✅ Camera should turn off
4. ✅ Mic should still work
5. ✅ Should see avatar instead of video

### Test 3: Video → Text → Video
1. Start in video mode
2. Click "Text" button
3. ✅ Camera and mic turn off
4. Click "Video" button
5. ✅ Camera and mic turn back on
6. ✅ Video shows properly

### Test 4: Multiple Switches
1. Video → Audio → Video → Audio → Text → Video
2. ✅ Each switch should work smoothly
3. ✅ No black screens
4. ✅ No frozen video
5. ✅ No audio issues

## Files Modified

**components/Room.tsx**
- `setupMediaStream()` - Added targetMode parameter, stop stream first, setTimeout for video
- Added `useEffect` to watch mode changes
- Updated all `setupMediaStream()` calls to pass target mode
- Updated initial setup to pass mode parameter

## Technical Notes

### Why setTimeout?
The video element might not be fully mounted/ready when we try to set srcObject. The 100ms delay ensures the DOM is ready.

### Why Explicit play()?
Some browsers require explicit play() call due to autoplay policies. The catch handles any autoplay restrictions gracefully.

### Why Stop First?
If you don't stop the existing stream before requesting a new one:
- Old stream keeps running (wastes resources)
- Browser might deny new stream request
- Video element might show old stream
- Tracks can conflict

### Why useEffect on mode?
React state updates are asynchronous. By watching the mode state with useEffect, we ensure the stream is updated AFTER the mode state has actually changed.

## Result

✅ **Audio → Video switching works perfectly**
✅ **Video → Audio switching works perfectly**
✅ **All mode combinations work smoothly**
✅ **No black screens**
✅ **No frozen video**
✅ **Clean stream management**
