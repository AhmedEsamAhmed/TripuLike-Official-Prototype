import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation } from '../../components/design-system/Navigation';
import { StatusBadge } from '../../components/design-system/Badges';
import { MapPin, Users, DollarSign, Calendar, Check } from 'lucide-react';
import { ServiceType, Trip, TripServiceRequirement } from '../../types';

export default function SupplierOperations() {
  const navigate = useNavigate();
  const { user, trips, offers, bookings, acceptOffer, counterOffer } = useApp();
  const isTranslator = user?.role === 'translator';
  const [activeTab, setActiveTab] = useState<'requests' | 'offers' | 'active'>('requests');

  if (!user || user.role === 'traveler') {
    navigate('/');
    return null;
  }

  const supplierOperatingArea = user.operatingLocation || user.location || 'Kuala Lumpur';

  const getServiceTypes = (trip: Trip): ServiceType[] =>
    trip.requiredServices?.length
      ? trip.requiredServices.map((service) => service.type)
      : trip.servicesNeeded || [];

  const getTranslatorRequirement = (requiredServices: TripServiceRequirement[]) => {
    const translatorService = requiredServices.find((service) => service.type === 'translator');
    return translatorService?.translatorDetails || translatorService?.details;
  };

  const canServeByRole = (requiredServices: TripServiceRequirement[]) => {
    const serviceTypes = requiredServices.map((service) => service.type);

    if (user.role === 'driver') return serviceTypes.includes('driver');
    if (user.role === 'guide') return serviceTypes.includes('guide');
    if (user.role === 'activity_operator') {
      if (!serviceTypes.includes('activity_provider')) return false;

      const activityRequirement = requiredServices.find((service) => service.type === 'activity_provider')?.activityDetails;
      if (!activityRequirement) return true;

      const requestedType = activityRequirement.activityCategory;
      return (user.activityTypes || []).includes(requestedType);
    }
    if (user.role === 'translator') {
      const translatorRequirement = getTranslatorRequirement(requiredServices);
      if (!translatorRequirement) return false;

      return (user.languages || []).some(
        (lang) =>
          lang.from === translatorRequirement.fromLanguage &&
          lang.to === translatorRequirement.toLanguage
      );
    }

    return false;
  };

  const getMatchingReason = (trip: Trip) => {
    if (user.role !== 'translator') {
      return `You match this request by role (${user.role.replace('_', ' ')}) and location.`;
    }

    const translatorRequirement = getTranslatorRequirement(trip.requiredServices || []);
    if (translatorRequirement?.fromLanguage && translatorRequirement?.toLanguage) {
      return `You match this request (${translatorRequirement.fromLanguage} -> ${translatorRequirement.toLanguage}).`;
    }

    return 'You match this translator request.';
  };

  const requestTrips = useMemo(
    () =>
      trips.filter(
        (trip) =>
          !trip.isPreDesigned &&
          ['open', 'negotiating', 'price_locked'].includes(trip.status) &&
          trip.city.toLowerCase().includes(supplierOperatingArea.split(',')[0].trim().toLowerCase()) &&
          canServeByRole(trip.requiredServices || [])
      ),
    [trips, supplierOperatingArea, user.role, user.languages]
  );

  const myOffers = useMemo(
    () => offers.filter((offer) => offer.supplierId === user.id),
    [offers, user.id]
  );

  const activeTrips = useMemo(
    () => bookings.filter((booking) => booking.supplierId === user.id),
    [bookings, user.id]
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Operations" showBack onBack={() => navigate('/supplier')} />

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5" />
            <h3 className="font-bold">Operating Area: {supplierOperatingArea}</h3>
          </div>
          <div className="mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 capitalize">
              Role: {user.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm opacity-90">Showing matching requests by your role and location</p>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{requestTrips.length}</p>
              <p className="text-xs opacity-90">Requests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{myOffers.length}</p>
              <p className="text-xs opacity-90">Offers</p>
            </div>
            {!isTranslator ? (
              <div className="text-center">
                <p className="text-2xl font-bold">{activeTrips.length}</p>
                <p className="text-xs opacity-90">Active</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold">{requestTrips.filter((trip) => trip.status === 'open').length}</p>
                <p className="text-xs opacity-90">Open</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
          {[
            { value: 'requests', label: 'Available Requests' },
            { value: 'offers', label: 'My Offers' },
            ...(!isTranslator ? [{ value: 'active', label: 'Active' }] : []),
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as 'requests' | 'offers' | 'active')}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors ${
                activeTab === tab.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requestTrips.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="font-semibold text-gray-900">No matching requests currently</p>
              </div>
            )}
            {requestTrips.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{request.title || `${request.city} Request`}</h3>
                    <p className="text-sm text-gray-600">Trip ID: {request.id}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {request.offerCount || 0} offers
                  </span>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{request.startDate}</span>
                    <span className="text-gray-600">• {request.duration} day(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">Pickup: {request.stops[0]?.name || 'Custom pickup'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{request.groupSize} people</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      Budget: RM {request.estimatedPriceRange?.min || 0} - {request.estimatedPriceRange?.max || 0}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {getServiceTypes(request).map((service) => (
                    <span key={service} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {service.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                  {getMatchingReason(request)}
                </div>

                <button
                  onClick={() => navigate(`/supplier/trip/${request.id}`)}
                  className="w-full px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  Submit Offer
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-4">
            {myOffers.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="font-semibold text-gray-900">No offers submitted yet</p>
              </div>
            )}
            {myOffers.map((offer) => {
              const trip = trips.find((item) => item.id === offer.tripId);
              const isNegotiation = offer.status === 'pending' && offer.round > 1;
              return (
                <div key={offer.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{trip?.title || `${trip?.city || 'Trip'} Request`}</h3>
                      <p className="text-sm text-gray-600">Round {offer.round}/3</p>
                    </div>
                    <p className="text-xl font-bold text-blue-600">RM {offer.price}</p>
                  </div>

                  {trip?.estimatedPriceRange && (
                    <p className="text-sm text-gray-600 mb-3">
                      Budget: RM {trip.estimatedPriceRange.min} - {trip.estimatedPriceRange.max}
                    </p>
                  )}

                  {isNegotiation ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptOffer(offer.id)}
                        className="flex-1 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => counterOffer(offer.id, Math.max(50, offer.price - 15), 'Can offer a small reduction')}
                        className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Negotiate
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/supplier/trip/${offer.tripId}`)}
                      className="w-full px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      View Offer
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isTranslator && activeTab === 'active' && (
          <div className="space-y-4">
            {activeTrips.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="font-semibold text-gray-900">No accepted trips yet</p>
              </div>
            )}
            {activeTrips.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{booking.trip.title || booking.trip.city}</h3>
                    <p className="text-sm text-gray-600">Booking {booking.id}</p>
                  </div>
                  <StatusBadge status={booking.trip.status} />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold">RM {booking.finalPrice}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Payout</span>
                    <span className="font-semibold text-blue-600">RM {booking.supplierPayout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment</span>
                    <span>{booking.fullPayment ? 'Full paid' : 'Deposit secured'}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/supplier/active-trip/${booking.id}`)}
                  className="w-full px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Open Full Trip Roadmap
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
