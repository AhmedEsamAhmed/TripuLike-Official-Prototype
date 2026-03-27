import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';
import { CreditCard, Wallet, CheckCircle, Shield, Info, AlertTriangle } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { user, bookings } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'deposit'>('deposit');
  const [paymentType, setPaymentType] = useState<'card' | 'ewallet' | 'bank'>('card');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const booking = bookings.find((b) => b.id === bookingId);

  if (!user || !booking) {
    navigate('/');
    return null;
  }

  const depositAmount = booking.depositAmount;
  const fullAmount = booking.finalPrice;
  const amountToPay = paymentMethod === 'full' ? fullAmount : depositAmount;
  const remainingAmount = fullAmount - depositAmount;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setProcessing(false);
    setCompleted(true);

    // Redirect after success
    setTimeout(() => {
      navigate(user.role === 'traveler' ? '/traveler/my-trips' : '/supplier/bookings');
    }, 2000);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your {paymentMethod === 'full' ? 'full payment' : 'deposit'} of RM {amountToPay.toFixed(2)} has been processed.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✓ Booking confirmed</p>
            <p>✓ Supplier notified</p>
            <p>✓ Receipt sent to email</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Payment"
        showBack
        onBack={() => navigate(-1)}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Trip Summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Trip Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trip</span>
              <span className="font-semibold text-gray-900">
                {booking.trip.title || `${booking.trip.city} Trip`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="font-semibold text-gray-900">{booking.trip.duration} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Start Date</span>
              <span className="font-semibold text-gray-900">
                {new Date(booking.trip.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Total Price</span>
              <span className="text-xl font-bold text-gray-900">RM {fullAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Payment Option</h3>
          
          <div className="space-y-3">
            {/* Deposit Option */}
            <button
              onClick={() => setPaymentMethod('deposit')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'deposit'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      checked={paymentMethod === 'deposit'}
                      onChange={() => setPaymentMethod('deposit')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <h4 className="font-semibold text-gray-900">Pay Deposit (50%)</h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Pay RM {depositAmount.toFixed(2)} now, RM {remainingAmount.toFixed(2)} before trip starts
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">RM {depositAmount.toFixed(2)}</p>
                </div>
              </div>
            </button>

            {/* Full Payment Option */}
            <button
              onClick={() => setPaymentMethod('full')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'full'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      checked={paymentMethod === 'full'}
                      onChange={() => setPaymentMethod('full')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <h4 className="font-semibold text-gray-900">Pay Full Amount</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Complete payment now, no further action needed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">RM {fullAmount.toFixed(2)}</p>
                </div>
              </div>
            </button>
          </div>

          {/* Info about deposit */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200 flex gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              {paymentMethod === 'deposit'
                ? 'The remaining amount must be paid at least 24 hours before your trip starts.'
                : 'Full payment ensures your booking is completely secured with no further action required.'}
            </p>
          </div>
        </div>

        {/* Payment Type Selection */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>
          
          <div className="space-y-2">
            {/* Credit/Debit Card */}
            <button
              onClick={() => setPaymentType('card')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentType === 'card'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-6 h-6 text-gray-600" />
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">Credit / Debit Card</h4>
                <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
              </div>
              {paymentType === 'card' && <CheckCircle className="w-5 h-5 text-blue-600" />}
            </button>

            {/* E-Wallet */}
            <button
              onClick={() => setPaymentType('ewallet')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentType === 'ewallet'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Wallet className="w-6 h-6 text-gray-600" />
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">E-Wallet</h4>
                <p className="text-xs text-gray-500">GrabPay, Touch 'n Go, Boost</p>
              </div>
              {paymentType === 'ewallet' && <CheckCircle className="w-5 h-5 text-blue-600" />}
            </button>

            {/* Online Banking */}
            <button
              onClick={() => setPaymentType('bank')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentType === 'bank'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">Online Banking</h4>
                <p className="text-xs text-gray-500">FPX - All Malaysian banks</p>
              </div>
              {paymentType === 'bank' && <CheckCircle className="w-5 h-5 text-blue-600" />}
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="flex gap-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Secure Escrow Payment</h4>
              <p className="text-sm text-green-800">
                Your payment is held securely and only released to the supplier after your trip is completed.
                Full refund available if cancelled more than 24 hours before start.
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">Cancellation Policy</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">
                <span className="font-semibold">More than 24h before:</span> {booking.cancellationPolicy.moreThan24h}% refund
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">
                <span className="font-semibold">10-24h before:</span> {booking.cancellationPolicy.between10And24h}% refund
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">
                <span className="font-semibold">Less than 10h before:</span> {booking.cancellationPolicy.lessThan10h}% refund
              </p>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Trip Price</span>
              <span className="text-gray-900">RM {fullAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee (17.5%)</span>
              <span className="text-gray-900">Included</span>
            </div>
            {paymentMethod === 'deposit' && (
              <div className="flex justify-between text-blue-600">
                <span>Paying Now (50%)</span>
                <span className="font-semibold">RM {depositAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-900">Total to Pay Now</span>
              <span className="text-xl font-bold text-gray-900">RM {amountToPay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Pay RM ${amountToPay.toFixed(2)}`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By proceeding, you agree to TripuLike's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
