import React from 'react';
import { Link, useLocation } from 'react-router';
import { Home, MessageCircle, User, Calendar, Menu, Bell, Briefcase, Route } from 'lucide-react';
import { UserRole } from '../../types';

interface BottomNavigationProps {
  role: UserRole;
}

export function BottomNavigation({ role }: BottomNavigationProps) {
  const location = useLocation();

  const travelerNavItems = [
    { path: '/traveler', icon: Home, label: 'Home' },
    { path: '/traveler/booking-management', icon: Briefcase, label: 'Bookings' },
    { path: '/traveler/active-trip', icon: Route, label: 'Active' },
    { path: '/traveler/profile', icon: User, label: 'Profile' },
  ];

  const supplierNavItems = [
    { path: '/supplier', icon: Home, label: 'Home' },
    { path: '/supplier/operations', icon: Briefcase, label: 'Operations' },
    ...(role === 'translator' ? [] : [{ path: '/supplier/go-trip', icon: Route, label: 'Go Trip' }]),
    { path: '/supplier/profile', icon: User, label: 'Profile' },
  ];

  const navItems = role === 'traveler' ? travelerNavItems : supplierNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

export function Header({ title, showBack, onBack, action, showMenu, onMenuClick, showNotifications, notificationCount }: HeaderProps) {
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier');
  const isTraveler = location.pathname.startsWith('/traveler');
  const role: UserRole = isSupplier ? 'driver' : 'traveler';

  return (
    <header className="sticky top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
      <div className="max-w-md mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {showMenu && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          {title && (
            title === 'TripuLike' ? (
              <h1 className="text-xl font-bold">
                Trip<span className="text-orange-500">u</span>Like
              </h1>
            ) : (
              <h1 className="text-xl font-bold">{title}</h1>
            )
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showNotifications && (isTraveler || isSupplier) && (
            <Link
              to={`${role === 'traveler' ? '/traveler' : '/supplier'}/notifications`}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificationCount && notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>
          )}
          {action && <div>{action}</div>}
        </div>
      </div>
    </header>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  userName: string;
  userAvatar?: string;
  userRating?: number;
}

export function Sidebar({ isOpen, onClose, role, userName, userAvatar, userRating }: SidebarProps) {
  const travelerItems = [
    { section: 'Community', items: [
      { path: '/traveler/stories', label: 'Travel Stories', icon: '📸', badge: 'New' },
    ]},
    { section: 'My Account', items: [
      { path: '/traveler/my-trips', label: 'My Trips', icon: '✈️' },
      { path: '/traveler/chats', label: 'Messages', icon: '💬' },
    ]},
  ];

  const supplierItems = [
    { section: 'Network', items: [
      { path: '/supplier/network', label: 'Supplier Network', icon: '🤝', badge: 'Pro' },
      { path: '/supplier/management', label: 'Management', icon: '🧩' },
    ]},
    { section: 'Business', items: [
      { path: '/supplier/packages', label: 'My Packages', icon: '📦' },
      { path: '/supplier/availability', label: 'Availability', icon: '📅' },
      ...(role === 'translator' ? [] : [{ path: '/supplier/go-trip', label: 'Go Trip', icon: '🛣️' }]),
      { path: '/supplier/chats', label: 'Messages', icon: '💬' },
    ]},
  ];

  const sections = role === 'traveler' ? travelerItems : supplierItems;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-xl animate-slide-in-left">
        <div className="h-full flex flex-col">
          {/* Profile Section */}
          <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={userAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                alt={userName}
                className="w-16 h-16 rounded-full border-2 border-white object-cover"
              />
              <div className="text-white flex-1">
                <h2 className="font-semibold text-lg">{userName}</h2>
                <p className="text-sm opacity-90 capitalize">{role}</p>
                {userRating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-300">⭐</span>
                    <span className="text-sm font-semibold">{userRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <Link
                to={role === 'traveler' ? '/traveler/profile' : '/supplier/profile'}
                onClick={onClose}
                className="text-white text-sm hover:underline"
              >
                View Profile →
              </Link>
            </div>
          </div>

          {/* Menu Sections */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium text-gray-700 group-hover:text-gray-900 flex-1">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div className="text-center mb-2">
              <p className="text-xs text-gray-500">TripuLike v1.0</p>
            </div>
            <Link
              to="/logout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span className="font-semibold">Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}