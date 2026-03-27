import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import PackageCard from '../../components/design-system/PackageCard';
import { Package } from '../../types';

export default function PackageDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, notifications, addToCart } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get package from route state or navigate away
  const pkg = location.state?.package as Package | undefined;
  
  if (!user || !pkg) {
    navigate('/traveler/home');
    return null;
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleBookNow = () => {
    try {
      addToCart(pkg.id, 1);
      navigate('/traveler/checkout', { state: { packageId: pkg.id } });
    } catch (error) {
      alert('Error: ' + (error as any).message);
    }
  };

  const handleAddToTripPlan = () => {
    try {
      addToCart(pkg.id, 1);
      navigate('/traveler/trip-plan');
    } catch (error) {
      alert('Error: ' + (error as any).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Package Details"
        showBack
        onBack={() => navigate('/traveler/home')}
        showMenu
        onMenuClick={() => setSidebarOpen(true)}
        showNotifications
        notificationCount={unreadNotifications}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user.role}
        userName={user.name}
        userAvatar={user.avatar}
        userRating={user.rating}
      />

      <div className="max-w-2xl mx-auto">
        <div className="p-4">
          <PackageCard pkg={pkg} variant="expanded" />
        </div>
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
