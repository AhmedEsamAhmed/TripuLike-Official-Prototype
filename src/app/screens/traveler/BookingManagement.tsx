import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation } from '../../components/design-system/Navigation';
import { StatusBadge } from '../../components/design-system/Badges';
import { Calendar, DollarSign, MapPin, Users } from 'lucide-react';
import { Booking, Offer, Trip } from '../../types';

export default function BookingManagement() {
  const navigate = useNavigate();
  const { user, trips, offers, bookings, acceptOffer, counterOffer, declineOffer } = useApp();
  const [activeTab, setActiveTab] = useState<'requests' | 'offers' | 'active'>('requests');

  if (!user) return null;

  const myRequests = useMemo(
    () => trips.filter((trip: Trip) => trip.createdBy === user.id && !trip.isPreDesigned),
    [trips, user.id]
  );

  const requestIds = new Set(myRequests.map((trip: Trip) => trip.id));
  const receivedOffers = offers
    .filter((offer: Offer) => requestIds.has(offer.tripId) && offer.status !== 'declined')
    .sort((a: Offer, b: Offer) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const myBookings = bookings
    .filter((booking: Booking) => booking.travelerId === user.id)
    .sort((a: Booking, b: Booking) => +new Date(b.bookingDate) - +new Date(a.bookingDate));

  const handleAccept = (offerId: string, tripId: string) => {
    acceptOffer(offerId);
    navigate(`/traveler/booking/${tripId}/${offerId}`);
  };

  const handleNegotiate = (offerId: string, currentPrice: number) => {
    const nextPrice = Math.max(50, currentPrice - 20);
    counterOffer(offerId, nextPrice, 'Can you improve your price a little?');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Booking Management" />

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              activeTab === 'requests' ? 'bg-blue-600 text-white' : 'text-gray-700'
            }`}
          >
            Requests
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              activeTab === 'offers' ? 'bg-blue-600 text-white' : 'text-gray-700'
            }`}
          >
            Offers
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              activeTab === 'active' ? 'bg-blue-600 text-white' : 'text-gray-700'
            }`}
          >
            Active
          </button>
        </div>

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">No requests posted yet</p>
                <button
                  onClick={() => navigate('/traveler')}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Explore destinations
                </button>
              </div>
            ) : (
              myRequests.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => navigate(`/traveler/trip/${trip.id}`)}
                  className="w-full bg-white rounded-2xl p-4 border border-gray-200 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{trip.title || `${trip.city} Request`}</h3>
                    <StatusBadge status={trip.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{trip.city}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{trip.groupSize}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{trip.offerCount || 0} offers</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-3">
            {receivedOffers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="font-semibold text-gray-900">No offers yet</p>
                <p className="text-sm text-gray-600 mt-1">Suppliers will respond to your request soon.</p>
              </div>
            ) : (
              receivedOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{offer.supplierName}</p>
                      <p className="text-xs text-gray-600 capitalize">{offer.supplierRole} • Round {offer.round}/3</p>
                    </div>
                    <p className="text-xl font-bold text-blue-600">RM {offer.price}</p>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{offer.notes}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(offer.id, offer.tripId)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleNegotiate(offer.id, offer.price)}
                      disabled={offer.round >= 3}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm disabled:bg-gray-300"
                    >
                      Negotiate
                    </button>
                    <button
                      onClick={() => declineOffer(offer.id)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-3">
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="font-semibold text-gray-900">No active booking yet</p>
              </div>
            ) : (
              myBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{booking.trip.title || booking.trip.city}</h3>
                    <StatusBadge status={booking.trip.status} />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <p className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.trip.startDate}</p>
                    <p>Payment: {booking.fullPayment ? 'Full Paid' : 'Deposit Paid'}</p>
                    <p>Escrow: RM {booking.escrowHeld.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/traveler/active-trip/${booking.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm"
                    >
                      Open Live Trip
                    </button>
                    <button
                      onClick={() => navigate(`/traveler/trip/${booking.tripId}`)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm"
                    >
                      View Plan
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNavigation role="traveler" />
    </div>
  );
}
