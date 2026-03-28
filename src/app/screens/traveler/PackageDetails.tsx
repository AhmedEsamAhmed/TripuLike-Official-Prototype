import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import PackageCard from '../../components/design-system/PackageCard';
import { Package } from '../../types';
import { Calendar, Users } from 'lucide-react';

export default function PackageDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, notifications, addToCart, tripPlan, createTripPlan, updateTripPlan } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  
  // Get package from route state or navigate away
  const pkg = location.state?.package as Package | undefined;
  
  if (!user || !pkg) {
    navigate('/traveler/home');
    return null;
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const availableSpots = Math.max(0, pkg.groupSizeMax - ((pkg.bookings || 0) % Math.max(pkg.groupSizeMax, 1)));
  const canBookNow = Boolean(travelDate) && travelers > 0 && travelers <= availableSpots;

  const handleBookNow = () => {
    try {
      if (!canBookNow) {
        alert('Please select a valid date and number of travelers within available spots.');
        return;
      }

      addToCart(pkg.id, travelers, travelDate);
      alert('Supplier package reserved in cart. Continue to booking management to finalize.');
      navigate('/traveler/booking-management');
    } catch (error) {
      alert('Error: ' + (error as any).message);
    }
  };

  const handleAddToTripPlan = () => {
    try {
      addToCart(pkg.id, 1);

      if (!tripPlan || tripPlan.city !== pkg.city) {
        createTripPlan(pkg.city);
      }

      updateTripPlan({
        requestTitle: `Package Assist: ${pkg.title}`,
        city: pkg.city,
        country: pkg.country,
        selectedPackages: [pkg],
      });

      navigate('/traveler/trip-plan?step=3');
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

          <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Book Supplier Trip</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                Supplier Published
              </span>
            </div>

            <div className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" /> Select travel date
              </p>
              <p className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" /> {availableSpots} spots available
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                min={1}
                max={Math.max(1, availableSpots)}
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleBookNow}
                disabled={!canBookNow}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Book Immediately
              </button>
              <button
                onClick={handleAddToTripPlan}
                className="w-full py-3 rounded-lg border border-blue-600 text-blue-700 font-bold hover:bg-blue-50"
              >
                Add to Plan / Request
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
