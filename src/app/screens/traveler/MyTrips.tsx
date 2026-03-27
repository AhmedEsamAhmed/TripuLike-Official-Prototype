import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation } from '../../components/design-system/Navigation';
import { StatusBadge } from '../../components/design-system/Badges';
import { TripCard } from '../../components/design-system/Cards';
import { Button } from '../../components/design-system/Inputs';

export default function MyTrips() {
  const navigate = useNavigate();
  const { user, myTrips, bookings, cancelBooking } = useApp();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed' | 'cancelled'>('upcoming');

  if (!user) return null;

  const upcomingTrips = myTrips.filter(t => t.status === 'booked');
  const activeTrips = myTrips.filter(t => t.status === 'started');
  const completedTrips = myTrips.filter(t => t.status === 'completed' || t.status === 'reviewed');
  const cancelledTrips = myTrips.filter(t => t.status === 'cancelled');

  const currentTrips =
    activeTab === 'upcoming'
      ? upcomingTrips
      : activeTab === 'active'
      ? activeTrips
      : activeTab === 'completed'
      ? completedTrips
      : cancelledTrips;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="My Trips" />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'cancelled'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Trips List */}
        {currentTrips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'upcoming' && '📅'}
              {activeTab === 'active' && '🚗'}
              {activeTab === 'completed' && '✅'}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              No {activeTab} trips
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' && 'Your booked trips will appear here'}
              {activeTab === 'active' && 'Start a trip to see it here'}
              {activeTab === 'completed' && 'Your trip history will appear here'}
              {activeTab === 'cancelled' && 'Cancelled bookings appear here'}
            </p>
            {activeTab === 'upcoming' && (
              <Button
                variant="primary"
                onClick={() => navigate('/traveler')}
              >
                Explore Trips
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentTrips.map((trip) => {
              const booking = bookings.find(b => b.tripId === trip.id);
              const serviceTypes = trip.requiredServices?.length
                ? trip.requiredServices.map((service) => service.type)
                : (trip.servicesNeeded || []);
              const serviceLabels = trip.requiredServices?.length
                ? trip.requiredServices.map((service) =>
                    service.type === 'translator' &&
                    (service.translatorDetails?.fromLanguage || service.details?.fromLanguage) &&
                    (service.translatorDetails?.toLanguage || service.details?.toLanguage)
                      ? `translator (${service.translatorDetails?.fromLanguage || service.details?.fromLanguage} -> ${service.translatorDetails?.toLanguage || service.details?.toLanguage})`
                      : service.type
                  )
                : (trip.servicesNeeded || []);
              
              return (
                <div key={trip.id} className="space-y-2">
                  <TripCard
                    trip={trip}
                    onClick={() => {
                      if (trip.status === 'started' && booking) {
                        navigate(`/traveler/active-trip/${booking.id}`);
                      } else if (trip.status === 'completed') {
                        navigate(`/traveler/review/${trip.id}/${booking?.id}`);
                      } else {
                        navigate(`/traveler/trip/${trip.id}`);
                      }
                    }}
                  />
                  
                  {trip.status === 'booked' && booking && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/traveler/active-trip/${booking.id}`)}
                        className="w-full"
                      >
                        Open Plan
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => cancelBooking(booking.id)}
                        className="w-full"
                      >
                        Cancel Trip
                      </Button>
                    </div>
                  )}

                  {booking && (
                    <div className="bg-white rounded-xl border border-gray-200 p-3 text-sm text-gray-600">
                      <p>Payment: {booking.fullPayment ? 'Full payment completed' : 'Deposit paid'}</p>
                      <p>Booked services: {serviceLabels.join(', ')}</p>
                      <p>
                        Tracking mode:{' '}
                        {serviceTypes.includes('driver') || serviceTypes.includes('activity_provider')
                          ? 'Live route tracking enabled'
                          : 'Schedule-only follow-up'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation role="traveler" />
    </div>
  );
}
