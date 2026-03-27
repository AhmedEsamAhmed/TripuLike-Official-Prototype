import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';
import { Button, PriceInput, TextArea } from '../../components/design-system/Inputs';
import { MapPin, Users, Calendar, Clock } from 'lucide-react';

export default function SupplierTripDetails() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user, trips, createOffer } = useApp();
  const [showOfferModal, setShowOfferModal] = useState(false);

  const trip = trips.find((t) => t.id === tripId);
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
          <Button variant="primary" onClick={() => navigate('/supplier')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Trip Request"
        showBack
        onBack={() => navigate(-1)}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Trip Info */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {trip.title || `${trip.city} Trip`}
          </h1>

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
              <h3 className="font-semibold text-gray-900 mb-3">Planned Stops</h3>
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
        </div>

        <Button
          variant="primary"
          onClick={() => setShowOfferModal(true)}
          className="w-full"
        >
          Make an Offer
        </Button>
      </div>

      {showOfferModal && user && (
        <MakeOfferModal
          tripId={tripId!}
          onClose={() => setShowOfferModal(false)}
        />
      )}
    </div>
  );
}

interface MakeOfferModalProps {
  tripId: string;
  onClose: () => void;
}

function MakeOfferModal({ tripId, onClose }: MakeOfferModalProps) {
  const navigate = useNavigate();
  const { user, createOffer } = useApp();
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState('7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    
    if (priceValue > 0 && user) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + parseInt(validDays));

      createOffer({
        tripId,
        supplierId: user.id,
        supplierName: user.name,
        supplierRole: user.role,
        supplierAvatar: user.avatar,
        supplierRating: user.rating,
        supplierReviewCount: user.reviewCount,
        supplierVerified: user.verificationStatus === 'verified',
        price: priceValue,
        notes,
        validUntil: validUntil.toISOString(),
        round: 1,
        status: 'pending',
      });

      onClose();
      navigate('/supplier');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Make an Offer</h2>
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              💡 Tip: Be competitive but fair. Consider travel time, fuel, and your expertise.
            </p>
          </div>

          <PriceInput
            label="Your Offer Price (MYR)"
            value={price}
            onChange={setPrice}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid For (Days)
            </label>
            <select
              value={validDays}
              onChange={(e) => setValidDays(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
            </select>
          </div>

          <TextArea
            label="Notes to Traveler"
            placeholder="Introduce yourself and explain what's included..."
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
            <p>• Platform commission: 17.5%</p>
            <p>• Your payout: RM {price ? (parseFloat(price) * 0.825).toFixed(2) : '0.00'}</p>
          </div>

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
              Send Offer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
