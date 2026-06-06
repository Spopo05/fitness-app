import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiSend, 
  FiUser, 
  FiArrowLeft, 
  FiSearch, 
  FiMoreVertical, 
  FiSmile, 
  FiCheckCircle,
  FiTrash2,
  FiMic,
  FiPlay,
  FiPause,
  FiX,
  FiImage,
  FiVideo,
  FiPlus
} from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

const MessageInterface = ({ userRole, backPath }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';

  const getText = (en, fr, ar) => {
    if (isFrench) return fr;
    if (isRTL) return ar;
    return en;
  };

  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setShowAttachmentMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.data.conversations || []);
      setIsLoading(false);

      if (userId) {
        const found = (data.data.conversations || []).find(c => c.userId === userId);
        if (found) {
          setSelectedUser(found);
        } else {
          try {
            const userRes = await api.get(`/users/${userId}`);
            setSelectedUser({ 
              userId, 
              username: userRes.data.data.user.name,
              userEmail: userRes.data.data.user.email,
              userProfilePicture: userRes.data.data.user.profilePicture
            });
          } catch (err) {
            setSelectedUser({ userId, username: userRole === 'coach' ? 'Client' : 'Coach' });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      setIsLoading(false);
    }
  }, [userId, userRole]);

  const fetchMessages = useCallback(async () => {
    if (!selectedUser?.userId) return;
    
    const messagesContainer = document.querySelector('.messages-scroll-container');
    const wasNearBottom = messagesContainer && 
      messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
    
    try {
      const { data } = await api.get(`/messages/conversation/${selectedUser.userId}`);
      setMessages(data.data.messages || []);
      
      if (wasNearBottom) {
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    
    fetchMessages();
    intervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedUser, fetchMessages]);

  useEffect(() => {
    if (messages.length > lastMessageCount && lastMessageCount > 0 && selectedUser) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage?.sender?._id === selectedUser?.userId;
      
      if (!isOwnMessage) {
        scrollToBottom();
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${selectedUser.username}`, {
            body: lastMessage.content?.substring(0, 100),
            icon: selectedUser.userProfilePicture
          });
        }
      }
    }
    setLastMessageCount(messages.length);
  }, [messages]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type;
    const fileSize = file.size;

    if (fileType.startsWith('image/')) {
      if (fileSize > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setFileType('image');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    } else if (fileType.startsWith('video/')) {
      if (fileSize > 50 * 1024 * 1024) {
        toast.error('Video must be less than 50MB');
        return;
      }
      setFileType('video');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    } else {
      toast.error('Unsupported file type');
    }
    setShowAttachmentMenu(false);
  };

  const sendMediaMessage = async () => {
    if (!selectedFile || !selectedUser?.userId) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append('recipientId', selectedUser.userId);
    formData.append(fileType, selectedFile);

    try {
      let endpoint = '';
      if (fileType === 'image') {
        endpoint = '/messages/send-image';
      } else if (fileType === 'video') {
        endpoint = '/messages/send-video';
      }

      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setMessages(prev => [...prev, data.data.message]);
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);
      setUploadProgress(0);
      scrollToBottom();
      
      setConversations(prev => {
        const existing = prev.find(c => c.userId === selectedUser.userId);
        if (existing) {
          return prev.map(conv =>
            conv.userId === selectedUser.userId
              ? { ...conv, lastMessage: fileType === 'image' ? '📷 Image' : '🎥 Video', lastMessageDate: new Date() }
              : conv
          );
        }
        return prev;
      });
    } catch (err) {
      toast.error('Failed to send media');
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedUser?.userId) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-message.webm');
    formData.append('recipientId', selectedUser.userId);
    formData.append('duration', recordingDuration);

    try {
      const { data } = await api.post('/messages/send-voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages(prev => [...prev, data.data.message]);
      setAudioURL(null);
      setAudioBlob(null);
      setRecordingDuration(0);
      scrollToBottom();
      
      setConversations(prev => {
        const existing = prev.find(c => c.userId === selectedUser.userId);
        if (existing) {
          return prev.map(conv =>
            conv.userId === selectedUser.userId
              ? { ...conv, lastMessage: '🎤 Voice message', lastMessageDate: new Date() }
              : conv
          );
        }
        return prev;
      });
    } catch (err) {
      toast.error('Failed to send voice message');
    } finally {
      setIsSending(false);
    }
  };

  const playAudio = (audioUrl) => {
    if (playingAudio) {
      playingAudio.pause();
      setIsPlaying(false);
    }
    const audio = new Audio(audioUrl);
    setPlayingAudio(audio);
    audio.play();
    setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      setPlayingAudio(null);
    };
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser?.userId || isSending) return;

    setIsSending(true);
    try {
      const { data } = await api.post('/messages/send', {
        recipientId: selectedUser.userId,
        content: newMessage,
      });

      setMessages(prev => [...prev, data.data.message]);
      setNewMessage('');
      setShowEmojiPicker(false);
      scrollToBottom();
      
      setConversations(prev => {
        const existing = prev.find(c => c.userId === selectedUser.userId);
        if (existing) {
          return prev.map(conv =>
            conv.userId === selectedUser.userId
              ? { ...conv, lastMessage: newMessage, lastMessageDate: new Date() }
              : conv
          );
        } else {
          return [{ 
            userId: selectedUser.userId, 
            username: selectedUser.username, 
            lastMessage: newMessage, 
            lastMessageDate: new Date(),
            unreadCount: 0,
            userProfilePicture: selectedUser.userProfilePicture
          }, ...prev];
        }
      });
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    if (isMobile) {
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMobile && emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (isMobile && !showEmojiPicker) {
      inputRef.current?.blur();
    }
  };

  const deleteConversation = async () => {
    if (!selectedUser?.userId) return;
    
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/messages/conversation/${selectedUser.userId}`);
        toast.success('Conversation deleted successfully');
        setConversations(prev => prev.filter(c => c.userId !== selectedUser.userId));
        setSelectedUser(null);
        setShowMenu(false);
      } catch (err) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date) => {
    if (!date) return '';
    const msgDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return msgDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || '?';
  };

  const getRandomColor = (id) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500'];
    const index = (id?.length || 0) % colors.length;
    return colors[index];
  };

  const renderMediaMessage = (msg, isOwnMessage) => {
    if (msg.type === 'image') {
      return (
        <div className="max-w-[200px] sm:max-w-[250px]">
          <img 
            src={msg.mediaUrl} 
            alt="Image" 
            className="rounded-lg cursor-pointer max-w-full max-h-48 sm:max-h-64 object-cover"
            onClick={() => window.open(msg.mediaUrl, '_blank')}
          />
        </div>
      );
    } else if (msg.type === 'video') {
      return (
        <video 
          src={msg.mediaUrl} 
          controls 
          className="rounded-lg max-w-full max-h-48 sm:max-h-64"
          preload="metadata"
        />
      );
    } else if (msg.type === 'voice') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => playAudio(msg.mediaUrl)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500"
          >
            {isPlaying && playingAudio?.src === msg.mediaUrl ? (
              <FiPause className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <FiPlay className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
          <span className="text-xs sm:text-sm">Voice message</span>
          {msg.duration > 0 && (
            <span className="text-[10px] sm:text-xs opacity-70">{formatDuration(msg.duration)}</span>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      {/* Main Header */}
      <div className={`bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0 ${
        selectedUser && isMobile ? 'hidden' : 'flex'
      }`}>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => navigate(backPath || (userRole === 'coach' ? '/clients' : '/dashboard'))}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{getText('Messages', 'Messages', 'الرسائل')}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiMoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className={`
          ${selectedUser && isMobile ? 'hidden' : 'flex'} 
          w-full md:w-80 flex-col bg-white border-r border-gray-200
        `}>
          {/* Search Bar */}
          <div className="p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <input
                type="text"
                placeholder={getText('Search...', 'Rechercher...', 'بحث...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {error ? (
              <div className="p-4 text-red-500 text-center text-sm">{error}</div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <FiUser className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <p className="text-center font-medium text-sm sm:text-base">{getText('No conversations', 'Aucune conversation', 'لا توجد محادثات')}</p>
                <p className="text-xs sm:text-sm text-center mt-1">
                  {userRole === 'coach' ? getText('Start messaging clients', 'Messagez vos clients', 'راسل عملاءك') : getText('Start messaging coach', 'Messagez votre coach', 'راسل مدربك')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.userId}
                    onClick={() => setSelectedUser(conv)}
                    className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      selectedUser?.userId === conv.userId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {conv.userProfilePicture ? (
                          <img
                            src={conv.userProfilePicture}
                            alt=""
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getRandomColor(conv.userId)} flex items-center justify-center text-white font-semibold text-sm sm:text-lg`}>
                            {getInitials(conv.username)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{conv.username || 'User'}</h3>
                          <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(conv.lastMessageDate)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                          {conv.lastMessage || getText('No messages', 'Aucun message', 'لا توجد رسائل')}
                        </p>
                      </div>
                      
                      {conv.unreadCount > 0 && (
                        <div className="ml-2 bg-blue-500 text-white text-[10px] sm:text-xs font-medium rounded-full min-w-[18px] h-4 sm:min-w-[20px] sm:h-5 px-1 sm:px-1.5 flex items-center justify-center">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${selectedUser ? 'flex' : 'hidden md:flex'} overflow-hidden`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </button>
                  
                  <div className="relative flex-shrink-0">
                    {selectedUser.userProfilePicture ? (
                      <img
                        src={selectedUser.userProfilePicture}
                        alt=""
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getRandomColor(selectedUser.userId)} flex items-center justify-center text-white font-semibold text-sm sm:text-base`}>
                        {getInitials(selectedUser.username)}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full ring-2 ring-white"></div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedUser.username || 'User'}</h2>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <p className="text-[10px] sm:text-xs text-green-600">{getText('Online', 'En ligne', 'متصل')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative flex-shrink-0" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiMoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
                      <button
                        onClick={deleteConversation}
                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        {getText('Delete', 'Supprimer', 'حذف')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Media Preview */}
              {filePreview && (
                <div className="bg-white border-b border-gray-200 p-2 sm:p-3 flex-shrink-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {fileType === 'image' && (
                      <img src={filePreview} alt="Preview" className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover" />
                    )}
                    {fileType === 'video' && (
                      <video src={filePreview} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{getText('Ready to send', 'Prêt', 'جاهز')}</p>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                          setFileType(null);
                          setUploadProgress(0);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={sendMediaMessage}
                        disabled={isSending}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-500 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        {getText('Send', 'Envoyer', 'إرسال')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Recording UI */}
              {isRecording && (
                <div className="bg-red-50 border-b border-red-200 p-2 sm:p-3 flex-shrink-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm text-red-600 font-medium">
                        {getText('Recording', 'Enregistrement', 'تسجيل')}... {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelRecording}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 rounded-full"
                      >
                        <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={stopRecording}
                        className="p-1.5 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <FiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {audioURL && !isRecording && (
                <div className="bg-gray-50 border-b border-gray-200 p-2 sm:p-3 flex-shrink-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => playAudio(audioURL)}
                        className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                      >
                        {isPlaying ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
                      </button>
                      <span className="text-xs sm:text-sm text-gray-700">
                        {getText('Voice message', 'Message vocal', 'رسالة صوتية')} ({formatDuration(recordingDuration)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelRecording}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 rounded-full"
                      >
                        <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={sendVoiceMessage}
                        disabled={isSending}
                        className="p-1.5 sm:p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50"
                      >
                        <FiSend className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="messages-scroll-container flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10 sm:py-20">
                    <FiUser className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2 sm:mb-3" />
                    <p className="text-center font-medium text-sm sm:text-base">{getText('No messages yet', 'Aucun message', 'لا توجد رسائل')}</p>
                    <p className="text-xs sm:text-sm text-center text-gray-400">{getText('Send first message!', 'Envoyez votre premier message !', 'أرسل رسالتك الأولى!')}</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwnMessage = msg.sender?._id !== selectedUser.userId;
                    
                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          {msg.type === 'text' && (
                            <div
                              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl ${
                                isOwnMessage
                                  ? 'bg-blue-500 text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                              }`}
                            >
                              <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          )}
                          
                          {(msg.type === 'image' || msg.type === 'video' || msg.type === 'voice') && (
                            renderMediaMessage(msg, isOwnMessage)
                          )}
                          
                          <div className={`flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-gray-400 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            {isOwnMessage && msg.read && (
                              <FiCheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 flex-shrink-0 safe-bottom">
                <div className="p-2 sm:p-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Attachment Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      
                      {showAttachmentMenu && (
                        <div className="absolute bottom-10 sm:bottom-12 left-0 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 py-1.5 sm:py-2 w-32 sm:w-40 z-50">
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setShowAttachmentMenu(false);
                            }}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <FiImage className="h-3 w-3 sm:h-4 sm:w-4" />
                            {getText('Image', 'Image', 'صورة')}
                          </button>
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setShowAttachmentMenu(false);
                            }}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <FiVideo className="h-3 w-3 sm:h-4 sm:w-4" />
                            {getText('Video', 'Vidéo', 'فيديو')}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Voice Recording Button */}
                    <button
                      onClick={startRecording}
                      className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiMic className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    
                    {/* Emoji Button */}
                    <div className="relative">
                      <button
                        onClick={toggleEmojiPicker}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiSmile className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      
                      {showEmojiPicker && !isMobile && (
                        <div className="absolute bottom-10 sm:bottom-12 left-0 z-50">
                          <EmojiPicker onEmojiClick={onEmojiClick} style={{ width: '280px', height: '350px' }} />
                        </div>
                      )}
                    </div>
                    
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 border-0 bg-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      placeholder={getText('Type a message...', 'Écrivez...', 'اكتب رسالة...')}
                      disabled={isSending}
                    />
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <FiSend className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                />
                
                {showEmojiPicker && isMobile && (
                  <div className="border-t border-gray-200">
                    <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{getText('Emojis', 'Émojis', 'إيموجي')}</span>
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-500 text-white rounded-lg text-xs sm:text-sm"
                      >
                        {getText('Done', 'Terminé', 'تم')}
                      </button>
                    </div>
                    <EmojiPicker onEmojiClick={onEmojiClick} width="100%" height={300} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center px-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FiUser className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">{getText('Select a conversation', 'Sélectionnez', 'اختر محادثة')}</h3>
                <p className="text-xs sm:text-sm text-gray-400">{getText('Choose a contact to start messaging', 'Choisissez un contact', 'اختر جهة اتصال')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInterface;