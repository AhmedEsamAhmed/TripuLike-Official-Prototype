import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';
import { EscrowIndicator, PaymentSummaryBox } from '../../components/design-system/Badges';
import { Button, Input } from '../../components/design-system/Inputs';
import { Lock, CreditCard } from 'lucide-react';

export default function Booking() {
  const navigate = useNavigate();
  const { tripId, offerId } = useParams();
  const { trips, offers, createBooking } = useApp();
  const [step, setStep] = useState<'summary' | 'payment' | 'processing' | 'success'>('summary');
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('full');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  const trip = trips.find((t) => t.id === tripId);
  const offer = offers.find((o) => o.id === offerId);

  if (!trip || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <Button variant="primary" onClick={() => navigate('/traveler')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const finalPrice = offer.price;
  const depositAmount = finalPrice * 0.5;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      setStep('success');
      createBooking(tripId!, offerId!, paymentType);
      
      setTimeout(() => {
        navigate('/traveler/my-trips');
      }, 2000);
    }, 2000);
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we secure your booking</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Booking Confirmed! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment is secured in escrow. The supplier will contact you shortly.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            <p>✓ Payment secured</p>
            <p>✓ Supplier notified</p>
            <p>✓ Chat enabled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title={step === 'payment' ? 'Payment' : 'Booking Summary'}
        showBack
        onBack={() => step === 'payment' ? setStep('summary') : navigate(-1)}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {step === 'summary' && (
          <>
            {/* Trip Summary */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Trip Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination</span>
                  <span className="font-medium">{trip.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{trip.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates</span>
                  <span className="font-medium">{trip.startDate} - {trip.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Group Size</span>
                  <span className="font-medium">{trip.groupSize} people</span>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Your Supplier</h2>
              <div className="flex items-center gap-3">
                <img
                  src={offer.supplierAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                  alt={offer.supplierName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{offer.supplierName}</p>
                  <p className="text-sm text-gray-600 capitalize">{offer.supplierRole}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">★ {offer.supplierRating}</p>
                  <p className="text-xs text-gray-500">{offer.supplierReviewCount} reviews</p>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Payment Options</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentType('full')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    paymentType === 'full'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Pay Full Amount</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        RM {finalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentType === 'full' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}
                    >
                      {paymentType === 'full' && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentType('deposit')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    paymentType === 'deposit'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Pay 50% Deposit</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        RM {depositAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Balance due before trip starts
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentType === 'deposit' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}
                    >
                      {paymentType === 'deposit' && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Escrow Info */}
            <EscrowIndicator amount={paymentType === 'deposit' ? depositAmount : finalPrice} />

            {/* Cancellation Policy */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">More than 24h before</span>
                  <span className="font-medium text-green-600">100% refund</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">10-24h before</span>
                  <span className="font-medium text-yellow-600">50% refund</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Less than 10h</span>
                  <span className="font-medium text-red-600">No refund</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setStep('payment')}
              className="w-full"
            >
              Proceed to Payment
            </Button>
          </>
        )}

        {step === 'payment' && (
          <>
            <PaymentSummaryBox
              finalPrice={finalPrice}
              depositAmount={paymentType === 'deposit' ? depositAmount : undefined}
            />

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
                <div className="flex items-center gap-2 text-gray-900 mb-4">
                  <Lock className="w-5 h-5" />
                  <h2 className="font-semibold">Secure Payment</h2>
                </div>

                <Input
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                  />
                  <Input
                    label="CVV"
                    placeholder="123"
                    type="password"
                    maxLength={3}
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Your payment information is encrypted and secure. We use industry-standard security.
                  </p>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Pay RM {(paymentType === 'deposit' ? depositAmount : finalPrice).toFixed(2)}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
