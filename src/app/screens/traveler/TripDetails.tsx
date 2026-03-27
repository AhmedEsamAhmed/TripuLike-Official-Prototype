import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';
import { StatusBadge } from '../../components/design-system/Badges';
import { OfferCard } from '../../components/design-system/Cards';
import { Button, PriceInput, TextArea } from '../../components/design-system/Inputs';
import { MapPin, Users, Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react';

export default function TripDetails() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { trips, offers, acceptOffer, declineOffer, cancelTrip } = useApp();
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const trip = trips.find((t) => t.id === tripId);
  const tripOffers = offers.filter((o) => o.tripId === tripId);
  const serviceTags = trip?.requiredServices?.length
    ? trip.requiredServices.map((service) =>
        service.type === 'translator' &&
        (service.translatorDetails?.fromLanguage || service.details?.fromLanguage) &&
        (service.translatorDetails?.toLanguage || service.details?.toLanguage)
          ? `${service.type}: ${service.translatorDetails?.fromLanguage || service.details?.fromLanguage} -> ${service.translatorDetails?.toLanguage || service.details?.toLanguage}`
          : service.type
      )
    : (trip?.servicesNeeded || []);

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <Button variant="primary" onClick={() => navigate('/traveler')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleAcceptOffer = (offerId: string) => {
    acceptOffer(offerId);
    navigate(`/traveler/booking/${tripId}/${offerId}`);
  };

  const handleDeclineOffer = (offerId: string) => {
    declineOffer(offerId);
  };

  const handleCounterOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
    setShowCounterModal(true);
  };

  const handleCancelTrip = () => {
    if (cancelTrip && tripId) {
      cancelTrip(tripId);
      navigate('/traveler/my-trips');
    }
  };

  const canCancelTrip = trip.status === 'open' || trip.status === 'negotiating' || trip.status === 'draft';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Trip Details"
        showBack
        onBack={() => navigate(-1)}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Trip Info */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          {trip.featuredImage && (
            <img
              src={trip.featuredImage}
              alt={trip.title || trip.city}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
          )}

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {trip.title || `${trip.city} Trip`}
            </h1>
            <StatusBadge status={trip.status} />
          </div>

          {trip.description && (
            <p className="text-gray-600 mb-4">{trip.description}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{trip.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Dates</p>
                <p className="font-medium">
                  {trip.startDate} - {trip.endDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{trip.duration} days</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Group Size</p>
                <p className="font-medium">{trip.groupSize} people</p>
              </div>
            </div>
          </div>

          {trip.stops.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Stops</h3>
              <div className="space-y-2">
                {trip.stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{stop.name}</p>
                      <p className="text-sm text-gray-500">{stop.duration} minutes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {serviceTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Services Needed</h3>
              <div className="flex flex-wrap gap-2">
                {serviceTags.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize"
                  >
                    {service.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {trip.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
              <p className="text-gray-600">{trip.notes}</p>
            </div>
          )}

          {/* Cancel Trip Button */}
          {canCancelTrip && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Cancel Trip
              </button>
            </div>
          )}
        </div>

        {/* Offers Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Offers ({tripOffers.length})
          </h2>

          {tripOffers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="text-5xl mb-3">📬</div>
              <h3 className="font-semibold text-gray-900 mb-2">No offers yet</h3>
              <p className="text-gray-600 text-sm">
                Verified suppliers will send you offers within 24 hours
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tripOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  showRoundCounter
                  onAccept={() => handleAcceptOffer(offer.id)}
                  onDecline={() => handleDeclineOffer(offer.id)}
                  onCounter={() => handleCounterOffer(offer.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Counter Offer Modal */}
      {showCounterModal && selectedOfferId && (
        <CounterOfferModal
          offerId={selectedOfferId}
          onClose={() => {
            setShowCounterModal(false);
            setSelectedOfferId(null);
          }}
        />
      )}

      {/* Cancel Trip Modal */}
      {showCancelModal && (
        <CancelTripModal
          tripId={tripId!}
          onConfirm={handleCancelTrip}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}

interface CounterOfferModalProps {
  offerId: string;
  onClose: () => void;
}

function CounterOfferModal({ offerId, onClose }: CounterOfferModalProps) {
  const { offers, counterOffer } = useApp();
  const offer = offers.find((o) => o.id === offerId);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  if (!offer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    if (priceValue > 0) {
      counterOffer(offerId, priceValue, notes);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Counter Offer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-2">Current Offer</p>
            <p className="text-3xl font-bold text-gray-900">RM {offer.price.toFixed(2)}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              Round {offer.round} of 3 • {3 - offer.round} counter{3 - offer.round > 1 ? 's' : ''} remaining
            </p>
          </div>

          <PriceInput
            label="Your Counter Offer"
            value={price}
            onChange={setPrice}
          />

          <TextArea
            label="Notes to Supplier"
            placeholder="Explain your counter offer..."
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={!price || parseFloat(price) <= 0}
            >
              Send Counter Offer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CancelTripModalProps {
  tripId: string;
  onConfirm: () => void;
  onClose: () => void;
}

function CancelTripModal({ tripId, onConfirm, onClose }: CancelTripModalProps) {
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const reasonOptions = [
    'Change of plans',
    'Found a better option',
    'Budget constraints',
    'Schedule conflict',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason && confirmed) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-red-600">Cancel Trip</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Are you sure?</p>
              <p className="text-sm text-red-700">
                Cancelling this trip will notify all suppliers and clear your booking.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Why are you cancelling?
            </label>
            <div className="space-y-2">
              {reasonOptions.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    reason === opt
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={opt}
                    checked={reason === opt}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-900">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {reason === 'Other' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Please explain
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Help us improve..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                rows={3}
              />
            </div>
          )}

          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-1"
            />
            <span className="text-sm text-gray-700">
              I understand that cancelling will notify suppliers and this trip and all associated offers will be cancelled.
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Keep Trip
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={!reason || !confirmed}
            >
              Cancel Trip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
