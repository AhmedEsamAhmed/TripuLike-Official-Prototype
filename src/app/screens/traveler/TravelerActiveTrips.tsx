import React from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation } from '../../components/design-system/Navigation';
import { StatusBadge } from '../../components/design-system/Badges';
import { Calendar, MapPin } from 'lucide-react';

export default function TravelerActiveTrips() {
  const navigate = useNavigate();
  const { user, bookings } = useApp();

  if (!user) return null;

  const activeOrUpcoming = bookings.filter(
    (booking) => booking.travelerId === user.id && ['booked', 'started'].includes(booking.trip.status)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Active Trip" />

      <div className="max-w-md mx-auto p-4 space-y-3">
        {activeOrUpcoming.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <p className="font-semibold text-gray-900">No active trip right now</p>
          </div>
        ) : (
          activeOrUpcoming.map((booking) => (
            <button
              key={booking.id}
              onClick={() => navigate(`/traveler/active-trip/${booking.id}`)}
              className="w-full bg-white rounded-2xl p-4 border border-gray-200 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{booking.trip.title || booking.trip.city}</h3>
                <StatusBadge status={booking.trip.status} />
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.trip.startDate}</p>
                <p className="flex items-center gap-1"><MapPin className="w-4 h-4" />{booking.trip.city}</p>
              </div>
            </button>
          ))
        )}
      </div>

      <BottomNavigation role="traveler" />
    </div>
  );
}
