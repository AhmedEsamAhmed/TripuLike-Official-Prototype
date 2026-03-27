import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation } from '../../components/design-system/Navigation';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';

export default function Chats() {
  const navigate = useNavigate();
  const { user, chats, chatMessages, sendChatMessage } = useApp();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');

  if (!user) return null;

  const userChats = useMemo(
    () => chats.filter((chat) => chat.bookingId && chat.participants.includes(user.id)),
    [chats, user.id]
  );

  const selectedChat = userChats.find((chat) => chat.id === selectedChatId) || userChats[0] || null;

  const selectedMessages = useMemo(() => {
    if (!selectedChat?.bookingId) return [];
    return chatMessages
      .filter((message) => message.bookingId === selectedChat.bookingId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [chatMessages, selectedChat?.bookingId]);

  const otherParticipantId = selectedChat?.participants.find((participant) => participant !== user.id);
  const chatTitle =
    (otherParticipantId && selectedChat?.participantNames?.[otherParticipantId]) ||
    'Trip Conversation';

  const handleSend = () => {
    if (!selectedChat?.bookingId || !draftMessage.trim()) return;
    sendChatMessage(selectedChat.bookingId, draftMessage);
    setDraftMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Chats" />

      <div className="max-w-md mx-auto p-4">
        {userChats.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600 text-sm">
              Chats open automatically after booking confirmation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {!selectedChatId && (
              <div className="space-y-2">
                {userChats.map((chat) => {
                  const partnerId = chat.participants.find((participant) => participant !== user.id);
                  const partnerName = (partnerId && chat.participantNames?.[partnerId]) || 'Trip Chat';

                  return (
                    <div
                      key={chat.id}
                      className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedChatId(chat.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{partnerName}</h3>
                          <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{chat.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedChat && selectedChatId && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedChatId(null)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <div>
                    <p className="font-semibold text-gray-900">{chatTitle}</p>
                    <p className="text-xs text-gray-500">Booking ID: {selectedChat.bookingId}</p>
                  </div>
                </div>

                <div className="p-3 h-80 overflow-y-auto bg-gray-50 space-y-2">
                  {selectedMessages.map((message) => {
                    if (message.isSystem) {
                      return (
                        <div key={message.id} className="text-center">
                          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
                            {message.message}
                          </span>
                        </div>
                      );
                    }

                    const isMine = message.senderId === user.id;
                    return (
                      <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${
                            isMine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`mt-1 text-[10px] ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t border-gray-200 flex gap-2">
                  <input
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                  <button
                    onClick={handleSend}
                    className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
