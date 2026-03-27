import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import { Bell, Check, Trash2, CheckCircle2, AlertCircle, Info, DollarSign, Star, MessageCircle, Users } from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const { user, notifications, markNotificationAsRead } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!user) {
    navigate('/');
    return null;
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notificationId: string, link?: string) => {
    markNotificationAsRead(notificationId);
    if (link) {
      navigate(link);
    }
  };

  const markAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) {
        markNotificationAsRead(n.id);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Notifications"
        showBack
        onBack={() => navigate(-1)}
        showMenu
        onMenuClick={() => setSidebarOpen(true)}
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Mark all read
            </button>
          ) : undefined
        }
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user.role}
        userName={user.name}
        userAvatar={user.avatar}
        userRating={user.rating}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors relative ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification.id, notification.link)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No notifications</p>
            <p className="text-sm text-gray-400">
              {filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here'}
            </p>
          </div>
        )}
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}

function NotificationCard({
  notification,
  onClick,
}: {
  notification: any;
  onClick: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'new_offer':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'offer_accepted':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'offer_declined':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'counter_offer':
        return <DollarSign className="w-5 h-5 text-orange-600" />;
      case 'booking_confirmed':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case 'trip_starting_soon':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'trip_started':
        return <Info className="w-5 h-5 text-green-600" />;
      case 'trip_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'payment_received':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'new_review':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'new_message':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'tripmate_request':
      case 'tripmate_joined':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'verification_approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'verification_rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeAgo = () => {
    const now = new Date();
    const notificationTime = new Date(notification.createdAt);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        notification.read
          ? 'bg-white border-gray-200 hover:border-gray-300'
          : 'bg-blue-50 border-blue-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <p className="text-xs text-gray-500">{getTimeAgo()}</p>
        </div>
        {!notification.read && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    </button>
  );
}
