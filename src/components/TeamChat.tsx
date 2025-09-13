import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Video, Phone, MoreHorizontal, Smile, Mic, MicOff, VideoOff, Monitor, Users, Settings, X } from 'lucide-react';
import { useTeam } from '../contexts/TeamContext';
import { useChat } from '../contexts/ChatContext';

interface Message {
  id: number;
  user: string;
  avatar: string;
  time: string;
  message: string;
  type: 'text' | 'file';
  fileName?: string;
}

const TeamChat: React.FC = () => {
  const { teamMembers, getOnlineMembers } = useTeam();
  const { messages: chatMessages, sendMessage } = useChat();
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Convert chat messages to display format
  const messages = chatMessages.map(msg => ({
    id: parseInt(msg.id),
    user: msg.senderName,
    avatar: msg.senderAvatar,
    time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    message: msg.content,
    type: msg.type as 'text' | 'file',
    fileName: msg.fileName
  }));

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup video streams when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      remoteStreams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
    };
  }, [localStream, remoteStreams]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
      
      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponse = {
          id: Date.now().toString(),
          senderId: 'ai',
          senderName: 'AI Assistant',
          senderAvatar: 'AI',
          content: 'Thanks for the message! How can I help you today?',
          timestamp: new Date().toISOString(),
          type: 'text' as const
        };
        
        // Add AI response to localStorage and trigger update
        const currentMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        const updatedMessages = [...currentMessages, aiResponse];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        window.dispatchEvent(new CustomEvent('chatMessagesUpdated', { 
          detail: updatedMessages 
        }));
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const getCameraAccess = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      setLocalStream(stream);
      
      // Wait for the video element to be ready
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true; // Mute to prevent echo
          localVideoRef.current.autoplay = true;
          localVideoRef.current.playsInline = true;
          
          // Add event listeners to ensure video plays
          localVideoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            localVideoRef.current?.play().catch(e => console.log('Play failed:', e));
          };
          
          localVideoRef.current.oncanplay = () => {
            console.log('Video can play');
            localVideoRef.current?.play().catch(e => console.log('Play failed:', e));
          };
          
          // Force play the video
          localVideoRef.current.play().catch(playError => {
            console.log('Autoplay prevented:', playError);
            // Try again after a short delay
            setTimeout(() => {
              localVideoRef.current?.play().catch(e => console.log('Retry play failed:', e));
            }, 100);
          });
        }
      }, 100);
      
      setIsLoading(false);
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Camera access denied or not available';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported in this browser.';
        }
      }
      
      setCameraError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  const startVideoCall = async () => {
    const stream = await getCameraAccess();
    if (stream) {
      setIsVideoCallActive(true);
      setIsVideoMinimized(false);
      // Add a message about starting video call
      sendMessage('Video call started - Camera access granted');
    }
  };

  const endVideoCall = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Stop remote streams
    remoteStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    setRemoteStreams([]);
    
    setIsVideoCallActive(false);
    setIsVideoMinimized(false);
    setIsMuted(false);
    setIsVideoOn(true);
    setIsScreenSharing(false);
    setCameraError(null);
    
    // Add a message about ending video call
    sendMessage('Video call ended');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      // Switch back to camera
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      setIsScreenSharing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Team Chat</h3>
          <p className="text-sm text-gray-500">
            {teamMembers.length} members • {getOnlineMembers().length} online
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={startVideoCall}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Start voice call"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={startVideoCall}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Start video call"
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Messages */}
        <div className={`flex-1 flex flex-col min-h-0 ${isVideoCallActive && !isVideoMinimized ? 'mr-80' : ''}`}>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.user === 'You' ? 'bg-gradient-to-br from-green-500 to-blue-600' :
                  message.user === 'AI Assistant' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                  'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  <span className="text-white text-xs font-medium">{message.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{message.user}</span>
                    <span className="text-xs text-gray-500">{message.time}</span>
                    {message.user === 'AI Assistant' && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">AI</span>
                    )}
                  </div>
                  {message.type === 'text' ? (
                    <div className={`p-3 rounded-lg max-w-md ${
                      message.user === 'You' ? 'bg-blue-500 text-white ml-auto' :
                      message.user === 'AI Assistant' ? 'bg-purple-50 border border-purple-200' :
                      'bg-gray-100'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-900">{message.fileName}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{message.message}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {isTyping && (
              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="ml-2">Someone is typing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Inline Video Call Panel */}
        {isVideoCallActive && (
          <div className={`${isVideoMinimized ? 'w-16' : 'w-80'} border-l border-gray-200 bg-white transition-all duration-300 flex flex-col`}>
            {isVideoMinimized ? (
              // Minimized state
              <div className="p-2">
                <button 
                  onClick={() => setIsVideoMinimized(false)}
                  className="w-full aspect-video bg-gray-900 rounded-lg relative overflow-hidden hover:bg-gray-800 transition-colors"
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="text-white text-xs">Click to expand</div>
                  </div>
                </button>
              </div>
            ) : (
              // Expanded state
              <>
                {/* Video Call Header */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">Video Call</h4>
                    <p className="text-xs text-gray-500">Live</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => setIsVideoMinimized(true)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Minimize"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <button 
                      onClick={endVideoCall}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="End call"
                    >
                      <Phone className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 p-3">
                  {cameraError ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-red-500 text-4xl mb-2">📹</div>
                        <p className="text-sm text-gray-600 mb-3">{cameraError}</p>
                        <button 
                          onClick={getCameraAccess}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Your Video */}
                      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                          onLoadStart={() => console.log('Video load started')}
                          onLoadedData={() => console.log('Video data loaded')}
                          onLoadedMetadata={() => console.log('Video metadata loaded')}
                          onCanPlay={() => console.log('Video can play')}
                          onPlay={() => console.log('Video playing')}
                          onError={(e) => console.error('Video error:', e)}
                        />
                        
                        {/* Play Button Overlay (if video not playing) */}
                        {localStream && (
                          <button
                            onClick={() => {
                              if (localVideoRef.current) {
                                localVideoRef.current.play().catch(e => console.log('Manual play failed:', e));
                              }
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-colors"
                          >
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </button>
                        )}
                        
                        {/* Your Info */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          You
                        </div>
                        
                        {/* Status Indicators */}
                        {isMuted && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                            <MicOff className="w-3 h-3" />
                          </div>
                        )}
                        
                        {!isVideoOn && (
                          <div className="absolute top-2 left-2 bg-gray-600 text-white p-1 rounded-full">
                            <VideoOff className="w-3 h-3" />
                          </div>
                        )}
                        
                        {isScreenSharing && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            Screen
                          </div>
                        )}
                      </div>
                      
                      {/* Debug Info */}
                      {localStream && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs">
                          <div className="text-blue-800 font-medium mb-1">Camera Status:</div>
                          <div className="text-blue-700">
                            Stream: {localStream ? 'Active' : 'Inactive'}<br/>
                            Video Tracks: {localStream.getVideoTracks().length}<br/>
                            Audio Tracks: {localStream.getAudioTracks().length}<br/>
                            Video Enabled: {localStream.getVideoTracks()[0]?.enabled ? 'Yes' : 'No'}
                          </div>
                        </div>
                      )}
                      
                      {/* Remote Participants Placeholder */}
                      <div className="bg-gray-100 rounded-lg p-4 text-center">
                        <Users className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Waiting for team members...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      onClick={toggleMute}
                      className={`p-2 rounded-full transition-colors ${
                        isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    
                    <button 
                      onClick={toggleVideo}
                      className={`p-2 rounded-full transition-colors ${
                        !isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                    
                    <button 
                      onClick={toggleScreenShare}
                      className={`p-2 rounded-full transition-colors ${
                        isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Team Members */}
        <div className="w-64 border-l border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No team members yet</p>
              <p className="text-xs text-gray-400 mt-1">Add members in Team section</p>
            </div>
          ) : (
          <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{member.avatar}</span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                </div>
                <div>
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{member.status}</div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TeamChat;