import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation } from '../../components/design-system/Navigation';
import { StatusBadge } from '../../components/design-system/Badges';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

type SupplierTab = 'confirmed' | 'upcoming' | 'active' | 'completed';

export default function SupplierBookings() {
  const navigate = useNavigate();
  const { user, bookings } = useApp();
  const [activeTab, setActiveTab] = useState<SupplierTab>('confirmed');

  if (!user) return null;

  const supplierBookings = bookings.filter((booking) => booking.supplierId === user.id);
  const confirmedBookings = supplierBookings.filter(
    (booking) => !booking.bookingStatus || booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'paid'
  );
  const activeBookings = supplierBookings.filter((booking) => booking.bookingStatus === 'active');
  const upcomingBookings = supplierBookings.filter(
    (booking) => booking.bookingStatus === 'paid' || booking.bookingStatus === 'confirmed'
  );
  const completedBookings = supplierBookings.filter((booking) => booking.bookingStatus === 'completed');

  const getCurrentData = () => {
    switch (activeTab) {
      case 'confirmed':
        return confirmedBookings;
      case 'upcoming':
        return upcomingBookings;
      case 'active':
        return activeBookings;
      case 'completed':
        return completedBookings;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="mobile-shell bg-gray-50 pb-20">
      <Header title="My Bookings" showBack onBack={() => navigate('/supplier')} />

      <div className="max-w-md mx-auto w-full p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Supplier Roadmap</h2>
          <p className="text-sm text-gray-600">Only confirmed bookings are shown in operational timeline.</p>
        </div>

        <div className="bg-white rounded-2xl p-1 shadow-sm overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {[
              { key: 'confirmed', label: 'Confirmed', count: confirmedBookings.length },
              { key: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
              { key: 'active', label: 'Active', count: activeBookings.length },
              { key: 'completed', label: 'Completed', count: completedBookings.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as SupplierTab)}
                className={`h-12 px-4 text-base rounded-xl font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {currentData.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No {activeTab} bookings</h3>
            <p className="text-gray-600 text-sm">Your {activeTab} bookings will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">#{booking.id}</p>
                    <h3 className="font-bold text-gray-900">{booking.trip?.title || 'Trip Booking'}</h3>
                  </div>
                  <StatusBadge status={booking.bookingStatus || 'confirmed'} />
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>
                      {booking.trip?.city}, {booking.trip?.country || 'Global'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Traveler ID: {booking.travelerId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>
                      Booked: {booking.finalPrice} | Paid out: {booking.supplierPayout}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-blue-50 p-3">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Timeline</p>
                  <div className="space-y-1 text-xs text-blue-800">
                    <p>1. Booked</p>
                    <p>2. Paid</p>
                    <p>3. Upcoming Trip</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
