import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import { Calendar, Clock, Plus, Check, X } from 'lucide-react';

export default function SupplierAvailability() {
  const navigate = useNavigate();
  const { user, availability, updateAvailability } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  if (!user || user.role === 'traveler') {
    navigate('/');
    return null;
  }

  const mockTimeSlots = [
    { time: '08:00 - 10:00', available: true },
    { time: '10:00 - 12:00', available: true },
    { time: '12:00 - 14:00', available: false },
    { time: '14:00 - 16:00', available: true },
    { time: '16:00 - 18:00', available: true },
    { time: '18:00 - 20:00', available: false },
  ];

  const unreadNotifications = 3;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Availability"
        showBack
        onBack={() => navigate('/supplier/management')}
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

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">📅 Manage Availability</h2>
          <p className="opacity-90">Set your working hours and block busy dates</p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Select Date</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Time Slots</h3>
            <button className="text-sm text-blue-600 hover:underline font-semibold">
              Quick Set
            </button>
          </div>

          <div className="space-y-2">
            {mockTimeSlots.map((slot, idx) => (
              <button
                key={idx}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  slot.available
                    ? 'border-green-200 bg-green-50 hover:border-green-300'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${slot.available ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${slot.available ? 'text-gray-900' : 'text-gray-500'}`}>
                    {slot.time}
                  </span>
                </div>
                {slot.available ? (
                  <span className="flex items-center gap-1 text-sm text-green-700 font-semibold">
                    <Check className="w-4 h-4" />
                    Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-500 font-semibold">
                    <X className="w-4 h-4" />
                    Blocked
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
            Mark All Available
          </button>
          <button className="py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors">
            Mark All Blocked
          </button>
        </div>

        {/* Max Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Maximum Bookings Per Day</h3>
          <input
            type="number"
            defaultValue={3}
            min={1}
            max={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">
            Set the maximum number of trips you can handle per day
          </p>
        </div>

        {/* Save Button */}
        <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors">
          Save Availability
        </button>
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
