import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';
import { Button, TextArea } from '../../components/design-system/Inputs';
import { Star } from 'lucide-react';

export default function ReviewTrip() {
  const navigate = useNavigate();
  const { tripId, bookingId } = useParams();
  const { user, submitReview } = useApp();
  
  const [serviceRating, setServiceRating] = useState(0);
  const [safetyRating, setSafetyRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (serviceRating && safetyRating && communicationRating && comment && tripId && bookingId) {
      submitReview({
        tripId,
        bookingId,
        reviewerId: user?.id || '',
        reviewedUserId: 'supplier-id',
        serviceRating,
        safetyRating,
        communicationRating,
        comment,
      });

      setSubmitted(true);

      setTimeout(() => {
        navigate('/traveler/my-trips');
      }, 2000);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Thank You! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your review helps others make informed decisions and helps suppliers improve their service.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p>✓ Review submitted</p>
            <p>✓ Supplier payout released</p>
            <p>✓ Trip completed</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Rate Your Experience"
        showBack
        onBack={() => navigate('/traveler/my-trips')}
      />

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">⭐</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              How was your trip?
            </h2>
            <p className="text-gray-600">
              Your feedback helps improve the TripMate community
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Rating */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Service Quality</h3>
              <p className="text-sm text-gray-600">
                How satisfied were you with the overall service?
              </p>
            </div>
            <RatingInput value={serviceRating} onChange={setServiceRating} />
          </div>

          {/* Safety Rating */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Safety</h3>
              <p className="text-sm text-gray-600">
                Did you feel safe throughout the trip?
              </p>
            </div>
            <RatingInput value={safetyRating} onChange={setSafetyRating} />
          </div>

          {/* Communication Rating */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Communication</h3>
              <p className="text-sm text-gray-600">
                How was the communication with your supplier?
              </p>
            </div>
            <RatingInput value={communicationRating} onChange={setCommunicationRating} />
          </div>

          {/* Comment */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <TextArea
              label="Tell us more (Required)"
              placeholder="Share your experience to help other travelers..."
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!serviceRating || !safetyRating || !communicationRating || !comment}
          >
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-10 h-10 ${
              rating <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
