import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';
import { Button } from '../../components/design-system/Inputs';
import { StatusBadge } from '../../components/design-system/Badges';
import { Clock, MapPin, Phone, AlertCircle, Check, Navigation } from 'lucide-react';

export default function SupplierActiveTrip() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { user } = useApp();
  const [tripStarted, setTripStarted] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  if (!user) return null;

  // Mock booking data
  const booking = {
    id: 'b1',
    bookingId: 'TM-2045',
    customerName: 'Sarah Lee',
    customerPhone: '+60 12-345 6789',
    emergencyContact: '+60 12-987 6543',
    tripName: 'Kuala Lumpur City Tour',
    date: '18 March 2026',
    totalAmount: 350,
    depositPaid: 250,
    remainingBalance: 100,
    specialNotes: 'Customer prefers English guide. Has elderly parents traveling along.',
    paymentStatus: 'Deposit Paid',
    schedule: [
      { time: '08:00', location: 'Pick up at KLCC', duration: '10 min', notes: 'Customer staying at Traders Hotel' },
      { time: '08:30', location: 'Batu Caves', duration: '90 min', notes: 'Allow time for stair climbing' },
      { time: '11:00', location: 'Central Market', duration: '45 min', notes: 'Shopping time' },
      { time: '13:00', location: 'Lunch at Jalan Alor', duration: '60 min', notes: 'Halal restaurant preferred' },
      { time: '15:00', location: 'Petronas Towers', duration: '60 min', notes: 'Photo stops' },
      { time: '18:00', location: 'Drop off at KLCC', duration: '10 min', notes: 'Back to hotel' },
    ],
  };

  const handleStartTrip = () => {
    setTripStarted(true);
  };

  const handleEndTrip = () => {
    navigate('/supplier/operations');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header
        title="Active Trip"
        showBack
        onBack={() => navigate('/supplier/operations')}
      />

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Trip Status Banner */}
        <div className={`rounded-2xl p-5 ${tripStarted ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tripStarted ? 'bg-green-600' : 'bg-blue-600'}`}>
              {tripStarted ? (
                <Navigation className="w-6 h-6 text-white" />
              ) : (
                <Clock className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className={`font-bold text-lg ${tripStarted ? 'text-green-900' : 'text-blue-900'}`}>
                {tripStarted ? '🔴 Trip in Progress' : 'Customer Confirmed'}
              </h2>
              <p className={`text-sm ${tripStarted ? 'text-green-700' : 'text-blue-700'}`}>
                {tripStarted ? 'Live tracking active' : 'Ready to start trip'}
              </p>
            </div>
          </div>

          {!tripStarted && (
            <Button
              onClick={handleStartTrip}
              variant="primary"
              className="w-full"
            >
              ▶ Start Trip
            </Button>
          )}
        </div>

        {/* Trip Summary */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Trip Summary</h3>
            <StatusBadge status="confirmed" />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="font-semibold text-gray-900">{booking.bookingId}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{booking.customerName}</p>
                  <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Emergency Contact</p>
              <div className="flex items-center gap-2 mt-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="font-semibold text-gray-900">{booking.emergencyContact}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-gray-900">RM {booking.totalAmount}</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Deposit Paid</p>
                <p className="font-semibold text-green-600">RM {booking.depositPaid}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Remaining Balance</p>
                <p className="font-semibold text-orange-600">RM {booking.remainingBalance}</p>
              </div>
            </div>

            {booking.specialNotes && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Special Notes</p>
                <p className="text-sm text-gray-900">{booking.specialNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Schedule Timeline */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Detailed Schedule</h3>
          
          <div className="space-y-4">
            {booking.schedule.map((stop, index) => (
              <div key={index} className="flex gap-3">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tripStarted && index === currentStopIndex 
                      ? 'bg-green-600' 
                      : tripStarted && index < currentStopIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}>
                    {tripStarted && index < currentStopIndex ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  {index < booking.schedule.length - 1 && (
                    <div className={`w-0.5 h-12 ${
                      tripStarted && index < currentStopIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>

                {/* Stop details */}
                <div className={`flex-1 pb-4 ${tripStarted && index === currentStopIndex ? 'bg-green-50 -ml-2 pl-2 pr-2 rounded-lg' : ''}`}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-bold text-gray-900">{stop.time}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                      {stop.duration}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <p className="font-semibold text-gray-900">{stop.location}</p>
                  </div>
                  {stop.notes && (
                    <p className="text-sm text-gray-600 ml-6">{stop.notes}</p>
                  )}
                  {tripStarted && index === currentStopIndex && (
                    <button
                      onClick={() => setCurrentStopIndex(Math.min(currentStopIndex + 1, booking.schedule.length - 1))}
                      className="ml-6 mt-2 text-sm font-medium text-green-600 hover:text-green-700"
                    >
                      ✓ Complete Stop
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Tracking */}
        {tripStarted && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Live Tracking</h3>
            </div>

            {/* Mock map */}
            <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50" />
              <div className="relative text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Navigation className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">Live tracking active</p>
                <p className="text-xs text-gray-600">Current location updating</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <p><strong>Current Stop:</strong> {booking.schedule[currentStopIndex].location}</p>
              </div>
            </div>
          </div>
        )}

        {/* End Trip Button */}
        {tripStarted && (
          <Button
            onClick={handleEndTrip}
            variant="primary"
            className="w-full bg-red-600 hover:bg-red-700"
          >
            ⏹ End Trip
          </Button>
        )}

        {/* Emergency Button */}
        <button className="w-full px-6 py-3 bg-red-50 text-red-700 border-2 border-red-200 rounded-2xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Emergency Support
        </button>
      </div>
    </div>
  );
}
