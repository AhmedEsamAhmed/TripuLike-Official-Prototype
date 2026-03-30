import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Plus,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import { ServiceType, TripServiceRequirement } from '../../types';

const serviceOptions: Array<{ type: ServiceType; label: string; icon: string }> = [
  { type: 'driver', label: 'Driver', icon: '🚗' },
  { type: 'guide', label: 'Tour Guide', icon: '🗺️' },
  { type: 'translator', label: 'Translator', icon: '🌐' },
  { type: 'activity_provider', label: 'Activity Operator', icon: '🌊' },
];

// Dummy data for guides
const PLACE_SUGGESTIONS = [
  'Petronas Twin Towers',
  'Batu Caves',
  'Jalan Alor Food Street',
  'KL Tower',
  'National Mosque',
  'Bukit Bintang',
  'Chinatown',
  'Menara Kuala Lumpur',
];

// Dummy data for activities
const ACTIVITY_TYPES_MAP: Record<string, string[]> = {
  water: ['Scuba Diving', 'Snorkeling', 'Jet Ski', 'Island Hopping', 'Kayaking'],
  outdoor: ['Hiking', 'ATV Ride', 'Zipline', 'Camping', 'Rock Climbing'],
  indoor: ['Cooking Class', 'Art Workshop', 'VR Experience', 'Museum Tour', 'Pottery'],
  wellness: ['Spa', 'Yoga Retreat', 'Meditation', 'Thai Massage', 'Wellness Center'],
  family: ['Theme Park', 'Zoo Visit', 'Aquarium', 'Go-Kart Racing', 'Bowling'],
};

export default function TripPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripPlan, removeActivityFromPlan, publishTripRequest, updateTripPlan, countries, cart, getCartTotal, removeFromCart } = useApp();
  const requestedStep = Number(new URLSearchParams(location.search).get('step'));
  const initialStep = requestedStep === 2 || requestedStep === 3 ? (requestedStep as 2 | 3) : 1;
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [showSuccess, setShowSuccess] = useState(false);

  const [requestTitle, setRequestTitle] = useState(tripPlan?.requestTitle || '');
  const [country, setCountry] = useState(tripPlan?.country || countries[0]?.name || 'Malaysia');
  const [city, setCity] = useState(tripPlan?.city || 'Kuala Lumpur');
  const [tripDate, setTripDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [estimatedDurationHours, setEstimatedDurationHours] = useState('4');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'deposit'>('deposit');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [referenceDocs, setReferenceDocs] = useState<string[]>([]);

  const autoSuggestedServices = useMemo(
    () =>
      tripPlan?.selectedActivities?.length
        ? Array.from(new Set(tripPlan.selectedActivities.flatMap((item) => item.servicesNeeded)))
        : [],
    [tripPlan]
  );
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(
    tripPlan?.selectedServices?.length ? tripPlan.selectedServices : autoSuggestedServices
  );

  const selectedService = selectedServices[0];

  // DRIVER STATE
  const [driverTripType, setDriverTripType] = useState<'hourly' | 'half_day' | 'full_day' | 'airport'>('half_day');
  const [driverPickup, setDriverPickup] = useState('');
  const [driverDropoff, setDriverDropoff] = useState('');
  const [driverStops, setDriverStops] = useState<Array<{
    name: string;
    type: 'attraction' | 'restaurant' | 'shopping' | 'custom';
    estimatedDuration: '30_mins' | '1_hour' | '2_hours' | 'flexible';
  }>>([]);
  const [driverPassengers, setDriverPassengers] = useState(2);
  const [driverLuggage, setDriverLuggage] = useState<'none' | 'light' | 'medium' | 'heavy'>('light');
  const [driverVehicleType, setDriverVehicleType] = useState<'economy' | 'suv' | 'luxury' | 'van'>('economy');
  const [driverSpecialNotes, setDriverSpecialNotes] = useState('');

  // GUIDE STATE
  const [guidePickup, setGuidePickup] = useState('');
  const [guideDropoff, setGuideDropoff] = useState('');
  const [guideDuration, setGuideDuration] = useState<'half_day' | 'full_day' | 'custom'>('half_day');
  const [guideDurationHours, setGuideDurationHours] = useState('');
  const [guidePlaces, setGuidePlaces] = useState<Array<{ name: string; type: 'suggestion' | 'custom' }>>([]);
  const [guideTourType, setGuideTourType] = useState<'cultural' | 'food' | 'adventure' | 'nature' | 'city_highlights' | 'custom'>('cultural');
  const [guideGroupSize, setGuideGroupSize] = useState(2);
  const [guideLanguage, setGuideLanguage] = useState('English');
  const [guideExperienceStyle, setGuideExperienceStyle] = useState<'relaxed' | 'balanced' | 'fast_paced'>('balanced');
  const [guideNotes, setGuideNotes] = useState('');

  // ACTIVITY STATE
  const [activityCategory, setActivityCategory] = useState<'water' | 'outdoor' | 'indoor' | 'wellness' | 'family'>('water');
  const [activityName, setActivityName] = useState('');
  const [activityLocation, setActivityLocation] = useState('');
  const [activitySkillLevel, setActivitySkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [activityMinGroupSize, setActivityMinGroupSize] = useState(1);
  const [activityMaxGroupSize, setActivityMaxGroupSize] = useState(10);
  const [activityDuration, setActivityDuration] = useState<'1-2h' | 'half_day' | 'full_day'>('1-2h');
  const [activityEquipment, setActivityEquipment] = useState<'yes' | 'no' | 'partial'>('yes');
  const [activitySafetyRequirements, setActivitySafetyRequirements] = useState('');
  const [activityNotes, setActivityNotes] = useState('');

  // TRANSLATOR STATE
  const [translatorFromLanguage, setTranslatorFromLanguage] = useState(
    tripPlan?.translatorRequirement?.fromLanguage || 'English'
  );
  const [translatorToLanguage, setTranslatorToLanguage] = useState(
    tripPlan?.translatorRequirement?.toLanguage || 'Mandarin'
  );
  const [translatorContext, setTranslatorContext] = useState<'tourism' | 'business' | 'shopping' | 'medical' | 'event' | 'other'>('tourism');
  const [translatorDurationHours, setTranslatorDurationHours] = useState('4');
  const [translatorGroupType, setTranslatorGroupType] = useState<'solo' | 'family' | 'business'>('family');

  if (!tripPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No trip plan found</h2>
          <p className="text-gray-600 mb-6">Start from home to create a new trip plan.</p>
          <button
            onClick={() => navigate('/traveler')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const totalDuration = tripPlan.selectedActivities.reduce((sum, act) => sum + act.duration, 0);
  const totalCost = tripPlan.selectedActivities.reduce((sum, act) => sum + act.estimatedPrice, 0);
  const packageTotal = getCartTotal();
  const today = new Date().toISOString().split('T')[0];

  const selectServiceType = (service: ServiceType) => {
    setSelectedServices([service]);
  };

  const updateDriverStop = (index: number, field: string, value: any) => {
    setDriverStops((prev) =>
      prev.map((stop, idx) => (idx === index ? { ...stop, [field]: value } : stop))
    );
  };

  const addDriverStop = () => setDriverStops((prev) => [...prev, { location: '', duration: undefined, notes: '' }]);
  const removeDriverStop = (index: number) => setDriverStops((prev) => prev.filter((_, idx) => idx !== index));

  const updateGuidePlace = (index: number, field: string, value: any) => {
    setGuidePlaces((prev) =>
      prev.map((place, idx) => (idx === index ? { ...place, [field]: value } : place))
    );
  };

  const addGuidePlace = () => setGuidePlaces((prev) => [...prev, { name: '', duration: undefined, priority: 'high' }]);
  const removeGuidePlace = (index: number) => setGuidePlaces((prev) => prev.filter((_, idx) => idx !== index));

  const buildRequiredServices = (): TripServiceRequirement[] => {
    return selectedServices.map((service) => {
      const base = {
        type: service,
        serviceDate: tripDate,
        startTime,
        estimatedDurationHours: Number(estimatedDurationHours) || undefined,
        location: city,
        groupSize: numberOfPeople,
        notes,
      } as TripServiceRequirement;

      if (service === 'driver') {
        return {
          ...base,
          driverDetails: {
            tripType: driverTripType,
            pickupLocation: driverPickup,
            dropoffLocation: driverDropoff,
            stops: driverStops,
            startTime,
            passengers: driverPassengers,
            vehicleType: driverVehicleType,
            luggage: driverLuggage,
            specialNotes: driverSpecialNotes || undefined,
          },
        };
      }

      if (service === 'translator') {
        return {
          ...base,
          translatorDetails: {
            fromLanguage: translatorFromLanguage,
            toLanguage: translatorToLanguage,
            context: translatorContext,
            durationHours: Number(translatorDurationHours) || Number(estimatedDurationHours) || 1,
            groupType: translatorGroupType,
          },
          details: {
            fromLanguage: translatorFromLanguage,
            toLanguage: translatorToLanguage,
          },
        };
      }

      if (service === 'guide') {
        return {
          ...base,
          guideDetails: {
            pickupLocation: guidePickup || undefined,
            dropoffLocation: guideDropoff || undefined,
            duration: guideDuration,
            durationHours: guideDuration === 'custom' ? Number(guideDurationHours) || undefined : undefined,
            places: guidePlaces,
            tourType: guideTourType,
            groupSize: guideGroupSize,
            language: guideLanguage,
            experienceStyle: guideExperienceStyle,
            notes: guideNotes || undefined,
          },
        };
      }

      if (service === 'activity_provider') {
        return {
          ...base,
          activityDetails: {
            activityCategory,
            activityName,
            location: activityLocation,
            skillLevel: activitySkillLevel,
            minGroupSize: activityMinGroupSize,
            maxGroupSize: activityMaxGroupSize,
            duration: activityDuration,
            equipmentIncluded: activityEquipment,
            safetyRequirements: activitySafetyRequirements || undefined,
            notes: activityNotes || undefined,
          },
        };
      }

      return base;
    });
  };

  const validateForPublish = (): string | null => {
    if (!requestTitle.trim()) return 'Trip title is required.';
    if (selectedServices.length === 0) return 'Select one supplier type.';
    if (selectedServices.length > 1) return 'Only one supplier type is allowed per request.';
    if (!tripDate) return 'Date is required.';
    if (!budget || Number(budget) <= 0) return 'Enter a valid budget.';
    if (!paymentConfirmed) return 'Confirm payment authorization to continue.';

    if (selectedServices.includes('driver')) {
      if (!driverPickup.trim() || !driverDropoff.trim()) {
        return 'Driver request needs pickup and drop-off locations.';
      }
    }

    if (selectedServices.includes('translator')) {
      if (!translatorFromLanguage || !translatorToLanguage) {
        return 'Translator request needs from and to language.';
      }
    }

    if (selectedServices.includes('guide')) {
      if (guidePlaces.length === 0) {
        return 'Guide request needs at least one place to visit.';
      }
    }

    if (selectedServices.includes('activity_provider')) {
      if (!activityName || !activityLocation.trim()) {
        return 'Activity request needs activity name and location.';
      }
    }

    return null;
  };

  const handlePublishRequest = () => {
    const validationError = validateForPublish();
    if (validationError) {
      alert(validationError);
      return;
    }

    const requiredServices = buildRequiredServices();
    const docsNote = referenceDocs.length > 0 ? `Reference Docs: ${referenceDocs.join(', ')}` : '';

    const updatedPlan = {
      ...tripPlan,
      requestTitle: requestTitle.trim(),
      country,
      city,
      tripDate,
      estimatedBudget: Number(budget),
      selectedServices,
      requiredServices,
      translatorRequirement: selectedServices.includes('translator')
        ? {
            fromLanguage: translatorFromLanguage,
            toLanguage: translatorToLanguage,
          }
        : undefined,
      pickupLocation: selectedServices.includes('driver') ? driverPickup : undefined,
      dropoffLocation: selectedServices.includes('driver') ? driverDropoff : undefined,
      notes: [notes, docsNote].filter(Boolean).join(' | '),
    };

    updateTripPlan({
      requestTitle: requestTitle.trim(),
      country,
      city,
      selectedServices,
      requiredServices,
      translatorRequirement: selectedServices.includes('translator')
        ? {
            fromLanguage: translatorFromLanguage,
            toLanguage: translatorToLanguage,
          }
        : undefined,
    });

    const tripId = publishTripRequest(updatedPlan, numberOfPeople, [notes, docsNote].filter(Boolean).join(' | '));
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/traveler/booking-management', { state: { newTripId: tripId } });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-900">Create Request</h1>
            <p className="text-sm text-gray-600">Step {step} of 3</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
          <h2 className="font-bold text-lg mb-3">Trip Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Destination</span><span>{city}</span></div>
            <div className="flex justify-between"><span>Activities</span><span>{tripPlan.selectedActivities.length}</span></div>
            <div className="flex justify-between"><span>Activities Cost</span><span>RM {totalCost}</span></div>
            <div className="flex justify-between"><span>Total Duration</span><span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span></div>
          </div>
        </div>

        {tripPlan.selectedActivities.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Selected Activities</h3>
              <button
                onClick={() => navigate(`/traveler/discover/${city.toLowerCase().replace(' ', '-')}`)}
                className="text-sm text-blue-600 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {tripPlan.selectedActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activity.name}</p>
                    <p className="text-xs text-gray-600">{activity.duration} min • RM {activity.estimatedPrice}</p>
                  </div>
                  <button onClick={() => removeActivityFromPlan(activity.id)} className="p-1 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-900">1. Trip Identity</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Trip Title</label>
              <input
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder="Example: Family Adventure in Bali"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg"
                >
                  {countries.map((item) => (
                    <option key={item.code} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 pt-2">Supplier Type Needed</h4>
            <div className="grid grid-cols-2 gap-2">
              {serviceOptions.map((service) => (
                <button
                  key={service.type}
                  type="button"
                  onClick={() => selectServiceType(service.type)}
                  className={`border rounded-lg px-3 py-3 flex items-center gap-2 text-left ${
                    selectedService === service.type ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <span>{service.icon}</span>
                  <span className="text-sm font-semibold text-gray-900">{service.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Next page will show only the form for your selected supplier type.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {selectedService === 'translator' && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900">Translator Request</h3>
                <div className="grid grid-cols-2 gap-2">
                  <select value={translatorFromLanguage} onChange={(e) => setTranslatorFromLanguage(e.target.value)} className="px-3 py-3 border border-gray-300 rounded-lg">
                    {['English', 'Mandarin', 'Arabic', 'Malay', 'Japanese', 'Korean'].map((lang) => (<option key={lang} value={lang}>{lang}</option>))}
                  </select>
                  <select value={translatorToLanguage} onChange={(e) => setTranslatorToLanguage(e.target.value)} className="px-3 py-3 border border-gray-300 rounded-lg">
                    {['English', 'Mandarin', 'Arabic', 'Malay', 'Japanese', 'Korean'].map((lang) => (<option key={lang} value={lang}>{lang}</option>))}
                  </select>
                </div>
                <select value={translatorContext} onChange={(e) => setTranslatorContext(e.target.value as 'tourism' | 'business' | 'shopping' | 'medical' | 'event' | 'other')} className="w-full px-3 py-3 border border-gray-300 rounded-lg">
                  <option value="tourism">Tourism / Sightseeing</option>
                  <option value="business">Business Meeting</option>
                  <option value="shopping">Shopping Assistance</option>
                  <option value="medical">Medical</option>
                  <option value="event">Event / Conference</option>
                  <option value="other">Other</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={1} value={translatorDurationHours} onChange={(e) => setTranslatorDurationHours(e.target.value)} placeholder="Duration (hours)" className="px-3 py-3 border border-gray-300 rounded-lg" />
                  <select value={translatorGroupType} onChange={(e) => setTranslatorGroupType(e.target.value as 'solo' | 'family' | 'business')} className="px-3 py-3 border border-gray-300 rounded-lg">
                    <option value="solo">Solo</option>
                    <option value="family">Family</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
            )}

            {selectedService === 'driver' && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">🚗 Plan Your Driver Trip</h3>
                  <p className="text-sm text-gray-600">Planning your route & trip experience</p>
                </div>

                {/* Section 1: Pickup & Drop-off */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                  <input
                    type="text"
                    value={driverPickup}
                    onChange={(e) => setDriverPickup(e.target.value)}
                    placeholder="e.g., KL Sentral Station"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <label className="block text-sm font-medium text-gray-700 mt-3">Drop-off Location</label>
                  <input
                    type="text"
                    value={driverDropoff}
                    onChange={(e) => setDriverDropoff(e.target.value)}
                    placeholder="e.g., Your Hotel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Section 2: Trip Type */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <label className="block text-sm font-medium text-gray-700">Trip Type</label>
                  <select
                    value={driverTripType}
                    onChange={(e) => setDriverTripType(e.target.value as 'hourly' | 'half_day' | 'full_day' | 'airport')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="hourly">Hourly (2–3 hours)</option>
                    <option value="half_day">Half Day (4–6 hours)</option>
                    <option value="full_day">Full Day (8–10 hours)</option>
                    <option value="airport">Airport Transfer</option>
                  </select>
                </div>

                {/* Section 3: Multi-Stop Builder */}
                <div className="space-y-3 border-t border-gray-200 pt-3">
                  <label className="block text-sm font-medium text-gray-700">Add Your Stops (Optional but Recommended)</label>
                  <div className="space-y-2">
                    {driverStops.map((stop, index) => (
                      <div key={`driver-stop-${index}`} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">{index + 1}</span>
                          <input
                            type="text"
                            value={stop.name}
                            onChange={(e) =>
                              setDriverStops((prev) =>
                                prev.map((s, i) => (i === index ? { ...s, name: e.target.value } : s))
                              )
                            }
                            placeholder="Stop name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          {driverStops.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setDriverStops((prev) => prev.filter((_, i) => i !== index))}
                              className="p-2 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={stop.type}
                            onChange={(e) =>
                              setDriverStops((prev) =>
                                prev.map((s, i) => (i === index ? { ...s, type: e.target.value as any } : s))
                              )
                            }
                            className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="attraction">Attraction</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="shopping">Shopping</option>
                            <option value="custom">Custom</option>
                          </select>
                          <select
                            value={stop.estimatedDuration}
                            onChange={(e) =>
                              setDriverStops((prev) =>
                                prev.map((s, i) => (i === index ? { ...s, estimatedDuration: e.target.value as any } : s))
                              )
                            }
                            className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="30_mins">30 mins</option>
                            <option value="1_hour">1 hour</option>
                            <option value="2_hours">2 hours</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDriverStops((prev) => [...prev, { name: '', type: 'attraction', estimatedDuration: '1_hour' }])}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-blue-600 font-semibold hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" /> Add Stop
                  </button>
                </div>

                {/* Section 4: Number of Passengers */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <label className="block text-sm font-medium text-gray-700">Number of Passengers</label>
                  <input
                    type="number"
                    min={1}
                    value={driverPassengers}
                    onChange={(e) => setDriverPassengers(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Section 5: Luggage Info */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Luggage</label>
                  <select
                    value={driverLuggage}
                    onChange={(e) => setDriverLuggage(e.target.value as 'none' | 'light' | 'medium' | 'heavy')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="none">None</option>
                    <option value="light">Light (1–2 bags)</option>
                    <option value="medium">Medium (3–5 bags)</option>
                    <option value="heavy">Heavy (5+ bags)</option>
                  </select>
                </div>

                {/* Section 6: Vehicle Preference */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Vehicle Preference</label>
                  <select
                    value={driverVehicleType}
                    onChange={(e) => setDriverVehicleType(e.target.value as 'economy' | 'suv' | 'luxury' | 'van')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="economy">Economy</option>
                    <option value="suv">SUV</option>
                    <option value="luxury">Luxury</option>
                    <option value="van">Van</option>
                  </select>
                </div>

                {/* Section 7: Special Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Special Notes</label>
                  <textarea
                    value={driverSpecialNotes}
                    onChange={(e) => setDriverSpecialNotes(e.target.value)}
                    rows={2}
                    placeholder="Any special requests (child seat, wheelchair access, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                </div>
              </div>
            )}

            {selectedService === 'guide' && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">🗺️ Plan Your Guided Experience</h3>
                  <p className="text-sm text-gray-600">Your guide will help plan, organize, and lead your trip. This may include transport coordination.</p>
                </div>

                {/* Section 1: Pickup & Drop-off */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Pickup Location (Optional)</label>
                  <input
                    type="text"
                    value={guidePickup}
                    onChange={(e) => setGuidePickup(e.target.value)}
                    placeholder="Hotel or meeting point"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <label className="block text-sm font-medium text-gray-700 mt-3">Drop-off Location (Optional)</label>
                  <input
                    type="text"
                    value={guideDropoff}
                    onChange={(e) => setGuideDropoff(e.target.value)}
                    placeholder="Return location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Section 2: Tour Type */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <label className="block text-sm font-medium text-gray-700">Tour Type</label>
                  <select
                    value={guideTourType}
                    onChange={(e) => setGuideTourType(e.target.value as 'cultural' | 'food' | 'adventure' | 'nature' | 'city_highlights' | 'custom')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="cultural">Cultural / Historical</option>
                    <option value="food">Food</option>
                    <option value="adventure">Adventure</option>
                    <option value="nature">Nature</option>
                    <option value="city_highlights">City Highlights</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Section 3: Places to Visit with Suggestions */}
                <div className="space-y-3 border-t border-gray-200 pt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Places to Visit</label>
                    <p className="text-xs text-gray-600 mb-2">Popular suggestions or add your own:</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {PLACE_SUGGESTIONS.map((place) => (
                        <button
                          key={place}
                          type="button"
                          onClick={() => {
                            if (!guidePlaces.find((p) => p.name === place)) {
                              setGuidePlaces((prev) => [...prev, { name: place, type: 'suggestion' }]);
                            }
                          }}
                          className="px-2 py-2 border border-blue-300 rounded-lg text-xs text-blue-700 hover:bg-blue-50"
                        >
                          + {place}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {guidePlaces.map((place, index) => (
                      <div key={`guide-place-${index}`} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg font-bold text-blue-600">{index + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{place.name}</p>
                            <p className="text-xs text-gray-600">{place.type === 'suggestion' ? 'Suggested' : 'Custom'}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGuidePlaces((prev) => prev.filter((_, i) => i !== index))}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Or type a custom place..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        setGuidePlaces((prev) => [...prev, { name: (e.target as HTMLInputElement).value, type: 'custom' }]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Section 4: Duration */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <select
                    value={guideDuration}
                    onChange={(e) => setGuideDuration(e.target.value as 'half_day' | 'full_day' | 'custom')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="half_day">Half Day</option>
                    <option value="full_day">Full Day</option>
                    <option value="custom">Custom hours</option>
                  </select>
                  {guideDuration === 'custom' && (
                    <input
                      type="number"
                      min={1}
                      value={guideDurationHours}
                      onChange={(e) => setGuideDurationHours(e.target.value)}
                      placeholder="Hours"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  )}
                </div>

                {/* Section 5: Group Size */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Group Size</label>
                  <input
                    type="number"
                    min={1}
                    value={guideGroupSize}
                    onChange={(e) => setGuideGroupSize(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Section 6: Language */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
                  <select
                    value={guideLanguage}
                    onChange={(e) => setGuideLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {['English', 'Arabic', 'Mandarin', 'Malay', 'Others'].map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section 7: Experience Style */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Experience Style</label>
                  <select
                    value={guideExperienceStyle}
                    onChange={(e) => setGuideExperienceStyle(e.target.value as 'relaxed' | 'balanced' | 'fast_paced')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="relaxed">Relaxed</option>
                    <option value="balanced">Balanced</option>
                    <option value="fast_paced">Fast-paced</option>
                  </select>
                </div>

                {/* Section 8: Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={guideNotes}
                    onChange={(e) => setGuideNotes(e.target.value)}
                    rows={2}
                    placeholder="Tell your guide your expectations..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                </div>
              </div>
            )}

            {selectedService === 'activity_provider' && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">🌊 Choose Your Activity Experience</h3>
                  <p className="text-sm text-gray-600">Highly structured → enables marketplace scaling</p>
                </div>

                {/* Section 1: Activity Type (PRIMARY FILTER) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Activity Type</label>
                  <select
                    value={activityCategory}
                    onChange={(e) => {
                      setActivityCategory(e.target.value as 'water' | 'outdoor' | 'indoor' | 'wellness' | 'family');
                      setActivityName('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="water">Water Activities</option>
                    <option value="outdoor">Outdoor Adventures</option>
                    <option value="indoor">Indoor Activities</option>
                    <option value="wellness">Wellness & Relaxation</option>
                    <option value="family">Family Activities</option>
                  </select>
                </div>

                {/* Section 2: Activity Name (DYNAMIC BASED ON TYPE) */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <label className="block text-sm font-medium text-gray-700">Activity Name</label>
                  <select
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select an activity...</option>
                    {ACTIVITY_TYPES_MAP[activityCategory].map((activity) => (
                      <option key={activity} value={activity}>
                        {activity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section 3: Location */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={activityLocation}
                    onChange={(e) => setActivityLocation(e.target.value)}
                    placeholder="e.g., Langkawi, Bali Beach"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Section 4: Skill Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Skill Level</label>
                  <select
                    value={activitySkillLevel}
                    onChange={(e) => setActivitySkillLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Section 5: Group Size (Min / Max) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Min Group Size</label>
                    <input
                      type="number"
                      min={1}
                      value={activityMinGroupSize}
                      onChange={(e) => setActivityMinGroupSize(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Max Group Size</label>
                    <input
                      type="number"
                      min={1}
                      value={activityMaxGroupSize}
                      onChange={(e) => setActivityMaxGroupSize(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Section 6: Duration */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <select
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(e.target.value as '1-2h' | 'half_day' | 'full_day')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="1-2h">1-2 hours</option>
                    <option value="half_day">Half-day</option>
                    <option value="full_day">Full-day</option>
                  </select>
                </div>

                {/* Section 7: Equipment Needed */}
                <div className="space-y-2 border-t border-gray-200 pt-3">
                  <label className="block text-sm font-medium text-gray-700">Equipment Included</label>
                  <select
                    value={activityEquipment}
                    onChange={(e) => setActivityEquipment(e.target.value as 'yes' | 'no' | 'partial')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="yes">Yes, included</option>
                    <option value="no">Not included</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>

                {/* Section 8: Safety Requirements */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Safety Requirements</label>
                  <textarea
                    value={activitySafetyRequirements}
                    onChange={(e) => setActivitySafetyRequirements(e.target.value)}
                    rows={2}
                    placeholder="Medical conditions, certifications needed..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                </div>

                {/* Section 9: Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={activityNotes}
                    onChange={(e) => setActivityNotes(e.target.value)}
                    rows={2}
                    placeholder="Additional information..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-900">3. Review & Publish</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p><span className="font-semibold">Trip Title:</span> {requestTitle || 'Not set'}</p>
              <p><span className="font-semibold">Country:</span> {country}</p>
              <p><span className="font-semibold">City:</span> {city}</p>
              <p><span className="font-semibold">Date:</span> {tripDate || 'Not set'}</p>
              <p><span className="font-semibold">Time:</span> {startTime}</p>
              <p><span className="font-semibold">People:</span> {numberOfPeople}</p>
              <p><span className="font-semibold">Services:</span> {selectedServices.map((item) => item.replace('_', ' ')).join(', ') || 'None'}</p>
            </div>

            {(tripPlan.selectedPackages?.length || cart.length > 0) && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900 mb-2">Selected Trips / Packages</p>
                <div className="space-y-1 text-sm text-gray-700">
                  {(tripPlan.selectedPackages || []).map((pkg) => (
                    <div key={`selected-pkg-${pkg.id}`} className="flex items-center justify-between gap-2 bg-white rounded px-2 py-1 border border-gray-200">
                      <p>- {pkg.title} ({pkg.city})</p>
                      <button
                        type="button"
                        onClick={() =>
                          updateTripPlan({
                            selectedPackages: (tripPlan.selectedPackages || []).filter((item) => item.id !== pkg.id),
                          })
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {cart.map((item) => (
                    <div key={`cart-item-${item.id}`} className="flex items-center justify-between gap-2 bg-white rounded px-2 py-1 border border-gray-200">
                      <p>- {item.package.title} x {item.quantity}{item.selectedDate ? ` on ${item.selectedDate}` : ''}</p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference Documents (optional)</label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const names = Array.from(e.target.files || []).map((file) => file.name);
                  setReferenceDocs(names);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              {referenceDocs.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">Attached: {referenceDocs.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Date</label>
              <input
                type="date"
                value={tripDate}
                min={today}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                <input
                  type="number"
                  min={1}
                  value={estimatedDurationHours}
                  onChange={(e) => setEstimatedDurationHours(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of People</label>
              <input
                type="number"
                min={1}
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value, 10) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" /> Budget (RM)
              </label>
              <input
                type="number"
                min={1}
                step={10}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Payment Option</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'full' | 'deposit')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="deposit">Deposit now (secure supplier offers)</option>
                <option value="full">Full payment authorization</option>
              </select>
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  className="mt-1"
                />
                I confirm this payment authorization so my request can be posted to matching suppliers.
              </label>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              Estimated total: RM {totalCost + packageTotal + (Number(budget) || 0)}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="max-w-md mx-auto flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handlePublishRequest}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Publish Request
            </button>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Posted</h3>
            <p className="text-gray-600">Suppliers will receive your structured request shortly.</p>
          </div>
        </div>
      )}
    </div>
  );
}
