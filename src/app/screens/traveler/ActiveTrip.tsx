import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';
import { EmergencyAlert } from '../../components/design-system/Badges';
import { Button } from '../../components/design-system/Inputs';
import { MapPin, Phone, MessageCircle, AlertCircle, Navigation, Clock, CheckCircle, Play, Square } from 'lucide-react';
import { StopTrackingInfo } from '../../types';

export default function ActiveTrip() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { bookings, startTrip, completeTrip, addNotification, user } = useApp();
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [eta, setEta] = useState('15 min');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [stopTimers, setStopTimers] = useState<{ [key: number]: number }>({});
  const [stopStatus, setStopStatus] = useState<{ [key: number]: 'pending' | 'arrived' | 'dropped_off' | 'in_progress' | 'completed' }>({});

  const booking = bookings.find((b) => b.id === bookingId);

  useEffect(() => {
    // Simulate ETA countdown
    const interval = setInterval(() => {
      const times = ['15 min', '12 min', '10 min', '8 min', '5 min', '3 min', 'Arriving...'];
      setEta(prev => {
        const currentIndex = times.indexOf(prev);
        return times[Math.min(currentIndex + 1, times.length - 1)];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Timer for each stop after drop-off
  useEffect(() => {
    const timers: { [key: number]: NodeJS.Timeout } = {};
    
    Object.keys(stopStatus).forEach((stopIdxStr) => {
      const stopIdx = parseInt(stopIdxStr);
      if (stopStatus[stopIdx] === 'dropped_off' || stopStatus[stopIdx] === 'in_progress') {
        timers[stopIdx] = setInterval(() => {
          setStopTimers((prev) => ({
            ...prev,
            [stopIdx]: (prev[stopIdx] || 0) + 1,
          }));
        }, 1000);
      }
    });

    return () => {
      Object.values(timers).forEach((timer) => clearInterval(timer));
    };
  }, [stopStatus]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <Button variant="primary" onClick={() => navigate('/traveler/my-trips')}>
            Go to My Trips
          </Button>
        </div>
      </div>
    );
  }

  const handleStartTrip = () => {
    startTrip(bookingId!);
    setTripStarted(true);
    // Initialize stop status
    const initialStatus: typeof stopStatus = {};
    booking.trip.stops.forEach((_, idx) => {
      initialStatus[idx] = 'pending';
    });
    setStopStatus(initialStatus);
  };

  const handleCompleteTrip = () => {
    completeTrip(bookingId!);
    navigate(`/traveler/review/${booking.tripId}/${bookingId}`);
  };

  const handleArriveAtStop = (stopIdx: number) => {
    setStopStatus((prev) => ({
      ...prev,
      [stopIdx]: 'arrived',
    }));
  };

  const handleDropOff = (stopIdx: number) => {
    setStopStatus((prev) => ({
      ...prev,
      [stopIdx]: 'dropped_off',
    }));
    // Start timer for this stop
    setStopTimers((prev) => ({
      ...prev,
      [stopIdx]: 0,
    }));
  };

  const handlePickUp = (stopIdx: number) => {
    setStopStatus((prev) => ({
      ...prev,
      [stopIdx]: 'completed',
    }));
    // Move to next stop if available
    if (stopIdx + 1 < booking.trip.stops.length) {
      setCurrentStopIndex(stopIdx + 1);
      setStopStatus((prev) => ({
        ...prev,
        [stopIdx + 1]: 'arrived',
      }));
    }
  };

  const handleNextStop = (stopIdx: number) => {
    if (stopIdx + 1 < booking.trip.stops.length) {
      setCurrentStopIndex(stopIdx + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const trip = booking.trip;
  const currentStop = trip.stops[currentStopIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title={tripStarted ? 'Trip in Progress' : 'Trip Details'}
        showBack
        onBack={() => navigate('/traveler/my-trips')}
      />

      <div className="max-w-md mx-auto">
        {/* Map Placeholder */}
        <div className="relative h-96 bg-gray-300">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
            alt="Map"
            className="w-full h-full object-cover"
          />
          
          {/* Live tracking indicator */}
          {tripStarted && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-gray-900">Live Tracking Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Navigation className="w-4 h-4" />
                    <span>ETA: {eta}</span>
                  </div>
                  <span className="text-blue-600 font-medium">At {currentStop?.name || trip.stops[0]?.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Current Location Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg animate-pulse" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Emergency Alert Banner */}
          {emergencyTriggered && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-1">Emergency Alert Active</h3>
                  <p className="text-sm text-red-700 mb-2">
                    Support team has been notified. Help is on the way.
                  </p>
                  <p className="text-xs text-red-600">
                    ID: EMG-{Date.now().toString().slice(-6)} • {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Supplier Info Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Your Supplier</h3>
            
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                alt="Supplier"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">Ahmad Hassan</p>
                <p className="text-sm text-gray-600">Licensed Driver</p>
                <p className="text-sm text-gray-500">Toyota Alphard 2023</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-yellow-500">
                  <span>★</span>
                  <span className="font-semibold text-gray-900">4.8</span>
                </div>
                <p className="text-xs text-gray-500">143 trips</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                <Phone className="w-5 h-5" />
                Call
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Chat
              </button>
            </div>
          </div>

          {/* Trip Timeline - Stops with timing */}
          {tripStarted && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">📍 Trip Timeline</h3>
              <div className="space-y-3">
                {trip.stops.map((stop, index) => {
                  const status = stopStatus[index] || 'pending';
                  const timeSpent = stopTimers[index] || 0;
                  const suggestedDuration = stop.duration;
                  const isOvertime = timeSpent > suggestedDuration * 60;
                  
                  return (
                    <div
                      key={stop.id}
                      className={`border-2 rounded-xl p-4 transition-all ${
                        status === 'completed'
                          ? 'border-green-300 bg-green-50'
                          : status === 'dropped_off' || status === 'in_progress'
                          ? 'border-blue-400 bg-blue-50'
                          : status === 'arrived'
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold ${
                          status === 'completed'
                            ? 'bg-green-600'
                            : status === 'dropped_off' || status === 'in_progress'
                            ? 'bg-blue-600'
                            : status === 'arrived'
                            ? 'bg-yellow-600'
                            : 'bg-gray-400'
                        }`}>
                          {status === 'completed' ? '✓' : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{stop.name}</p>
                          <p className="text-sm text-gray-600">Suggested: {suggestedDuration} min</p>
                        </div>
                        {(status === 'dropped_off' || status === 'in_progress') && (
                          <div className={`text-sm font-semibold ${isOvertime ? 'text-red-600' : 'text-blue-600'}`}>
                            {formatTime(timeSpent)}
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                          status === 'completed'
                            ? 'bg-green-200 text-green-800'
                            : status === 'dropped_off' || status === 'in_progress'
                            ? 'bg-blue-200 text-blue-800'
                            : status === 'arrived'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {status === 'dropped_off' ? 'Dropped Off - Time Tracking Active' :
                           status === 'in_progress' ? 'In Progress' :
                           status === 'arrived' ? 'Arrival Confirmed' :
                           status === 'completed' ? 'Completed' :
                           'Pending'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      {tripStarted && (
                        <div className="space-y-2">
                          {status === 'pending' && index === currentStopIndex && (
                            <button
                              onClick={() => handleArriveAtStop(index)}
                              className="w-full px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <MapPin className="w-4 h-4" />
                              Mark Arrival
                            </button>
                          )}

                          {status === 'arrived' && (
                            <button
                              onClick={() => handleDropOff(index)}
                              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Square className="w-4 h-4" />
                              Drop Off (Start Timer)
                            </button>
                          )}

                          {(status === 'dropped_off' || status === 'in_progress') && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handlePickUp(index)}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <Play className="w-4 h-4" />
                                Pick Up
                              </button>
                              <button
                                onClick={() => handleNextStop(index)}
                                className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                              >
                                Skip
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trip Info */}
          {!tripStarted && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Trip Information</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Destination</p>
                  <p className="font-medium text-gray-900">{trip.city}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today's Stops</p>
                  <div className="space-y-2">
                    {trip.stops.map((stop, index) => (
                      <div key={stop.id} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-gray-200 text-gray-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{stop.name}</p>
                          <p className="text-sm text-gray-500">{stop.duration} min suggested</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!tripStarted ? (
            <Button
              variant="primary"
              onClick={handleStartTrip}
              className="w-full"
            >
              🎬 Start Trip & Tracking
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCompleteTrip}
              className="w-full"
            >
              ✓ Complete Trip
            </Button>
          )}

          {/* Emergency Button */}
          <button
            onClick={() => setShowEmergency(true)}
            disabled={emergencyTriggered}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-lg transition-all ${
              emergencyTriggered
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <AlertCircle className="w-6 h-6" />
            {emergencyTriggered ? 'Emergency Alert Active' : 'Emergency'}
          </button>

          {tripStarted && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
              <p>✓ Your location is being tracked</p>
              <p>✓ Trip progress logged in real-time</p>
              <p>✓ 24/7 support available</p>
              <p>✓ All drop-off/pick-up events recorded</p>
            </div>
          )}
        </div>
      </div>

      {showEmergency && (
        <EmergencyAlert
          onClose={() => setShowEmergency(false)}
          onConfirm={() => {
            setEmergencyTriggered(true);
            setShowEmergency(false);

            const locationSnapshot = {
              lat: currentStop?.location?.lat || trip.stops[0]?.location?.lat || 0,
              lng: currentStop?.location?.lng || trip.stops[0]?.location?.lng || 0,
            };

            addNotification({
              userId: 'admin-ops',
              type: 'trip_started',
              title: 'SOS Alert Triggered',
              message: `Emergency alert for booking ${booking.id} at (${locationSnapshot.lat}, ${locationSnapshot.lng}).`,
              link: `/traveler/active-trip/${booking.id}`,
              read: false,
            });

            addNotification({
              userId: user?.id || booking.travelerId,
              type: 'trip_started',
              title: 'Support Team Notified',
              message: 'Your SOS alert has been sent with your latest GPS location. A support agent will contact you.',
              link: `/traveler/chats`,
              read: false,
            });
          }}
        />
      )}
    </div>
  );
}
