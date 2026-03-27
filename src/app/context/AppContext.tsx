import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  User,
  Trip,
  Offer,
  Booking,
  Review,
  SocialPost,
  SupplierNetworkPost,
  Chat,
  ChatMessage,
  AppState,
  TripStatus,
  UserRole,
  Notification,
  Availability,
  Activity,
  TripPlan,
  ServiceType,
  TripServiceRequirement,
  ServiceRequest,
  Country,
  City,
  Package,
  CartItem,
  BookingStatus,
} from '../types';

interface AppContextType extends AppState {
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  createTrip: (trip: Omit<Trip, 'id' | 'createdBy' | 'status'>) => string;
  updateTripStatus: (tripId: string, status: TripStatus) => void;
  createOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => void;
  acceptOffer: (offerId: string) => void;
  declineOffer: (offerId: string) => void;
  counterOffer: (originalOfferId: string, newPrice: number, notes: string) => void;
  createBooking: (tripId: string, offerId: string, paymentMethod: 'full' | 'deposit') => void;
  startTrip: (bookingId: string) => void;
  completeTrip: (bookingId: string) => void;
  submitReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  createSocialPost: (post: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'isLiked'>) => void;
  createNetworkPost: (post: Omit<SupplierNetworkPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'isLiked'>) => void;
  cancelBooking: (bookingId: string) => void;
  cancelTrip: (tripId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  togglePostLike: (postId: string, isNetwork: boolean) => void;
  togglePostBookmark: (postId: string, isNetwork: boolean) => void;
  updateAvailability: (availability: Availability) => void;
  addActivityToPlan: (activity: Activity) => void;
  removeActivityFromPlan: (activityId: string) => void;
  createTripPlan: (city: string) => void;
  updateTripPlan: (updates: Partial<TripPlan>) => void;
  publishTripRequest: (tripPlan: TripPlan, numberOfPeople: number, notes: string) => string;
  clearTripPlan: () => void;
  sendChatMessage: (bookingId: string, message: string) => void;
  // New methods for marketplace features
  searchPackages: (query: string) => Package[];
  searchActivities: (query: string) => Activity[];
  createPackage: (packageData: Omit<Package, 'id' | 'createdAt'>) => void;
  addToCart: (packageId: string, quantity: number, date?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  setCityFilter: (city: string) => void;
  setSearchQuery: (query: string) => void;
  getSupplierPackages: (supplierId: string) => Package[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Comprehensive Mock Data for TripuLike

const mapServicesToRequirements = (services: ServiceType[]): TripServiceRequirement[] =>
  services.map((type) => ({ type }));

const roleToServiceType = (role: UserRole): ServiceType | null => {
  if (role === 'driver') return 'driver';
  if (role === 'guide') return 'guide';
  if (role === 'translator') return 'translator';
  if (role === 'activity_operator') return 'activity_provider';
  return null;
};

const roundPrice = (value: number) => Number(value.toFixed(2));

const getPricingGuidance = (requirement: TripServiceRequirement): {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
} => {
  if (requirement.type === 'driver') {
    const tripType = requirement.driverDetails?.tripType || 'half_day';
    const hours = requirement.estimatedDurationHours || 4;

    if (tripType === 'hourly') {
      const minPrice = 10 * hours;
      const maxPrice = 25 * hours;
      return { minPrice, maxPrice, suggestedPrice: roundPrice((minPrice + maxPrice) / 2) };
    }
    if (tripType === 'half_day') return { minPrice: 40, maxPrice: 80, suggestedPrice: 60 };
    if (tripType === 'full_day') return { minPrice: 80, maxPrice: 150, suggestedPrice: 115 };

    const airportBase = 55 + Math.min((requirement.driverDetails?.stops?.length || 0) * 10, 30);
    return { minPrice: 45, maxPrice: 120, suggestedPrice: airportBase };
  }

  if (requirement.type === 'guide') {
    const duration = requirement.guideDetails?.duration || 'half_day';
    if (duration === 'half_day') return { minPrice: 60, maxPrice: 120, suggestedPrice: 90 };
    if (duration === 'full_day') return { minPrice: 120, maxPrice: 250, suggestedPrice: 180 };
    const hours = requirement.guideDetails?.durationHours || 4;
    const minPrice = 20 * hours;
    const maxPrice = 35 * hours;
    return { minPrice, maxPrice, suggestedPrice: roundPrice((minPrice + maxPrice) / 2) };
  }

  if (requirement.type === 'translator') {
    const hours = requirement.translatorDetails?.durationHours || requirement.estimatedDurationHours || 3;
    const minPrice = 15 * hours;
    const maxPrice = 40 * hours;
    return { minPrice, maxPrice, suggestedPrice: roundPrice((minPrice + maxPrice) / 2) };
  }

  const activityName = (requirement.activityDetails?.activityName || '').toLowerCase();
  if (activityName.includes('diving') || activityName.includes('scuba')) {
    return { minPrice: 80, maxPrice: 200, suggestedPrice: 140 };
  }
  return { minPrice: 30, maxPrice: 100, suggestedPrice: 65 };
};

const withPricingGuidance = (requirement: TripServiceRequirement): TripServiceRequirement => {
  const pricing = getPricingGuidance(requirement);
  return {
    ...requirement,
    suggestedPrice: pricing.suggestedPrice,
    minPrice: pricing.minPrice,
    maxPrice: pricing.maxPrice,
  };
};

const calculateMatchScore = (
  supplier: User,
  request: TripServiceRequirement,
  tripCity: string,
  targetBudget: number
): number => {
  let score = 0;

  const supplierCity = (supplier.operatingLocation || supplier.location || '').toLowerCase().trim();
  const requestCity = tripCity.toLowerCase().trim();

  const cityMatch = supplierCity === requestCity;
  if (cityMatch) score += 40;

  const serviceType = roleToServiceType(supplier.role);
  const serviceMatch = serviceType === request.type;
  if (serviceMatch) score += 30;

  score += Math.min(supplier.rating * 3, 15);
  score += Math.min(supplier.reviewCount / 10, 10);

  const suggested = request.suggestedPrice || ((request.minPrice || 0) + (request.maxPrice || 0)) / 2;
  if (suggested > 0 && targetBudget > 0) {
    const deltaRatio = Math.abs(suggested - targetBudget) / targetBudget;
    const priceFit = Math.max(0, 5 * (1 - deltaRatio));
    score += priceFit;
  }

  return Number(score.toFixed(2));
};

// Global Destination System Seed Data (Part 3)
const countryCitySeeds = [
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', cities: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Johor Bahru', 'Malacca', 'Ipoh', 'Kuching', 'Kota Kinabalu', 'Cameron Highlands', 'Putrajaya'] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Ayutthaya', 'Koh Samui', 'Hua Hin', 'Chiang Rai', 'Kanchanaburi'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', cities: ['Bali', 'Jakarta', 'Yogyakarta', 'Bandung', 'Lombok', 'Surabaya', 'Medan', 'Labuan Bajo', 'Seminyak', 'Ubud'] },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo', 'Nara', 'Hiroshima', 'Fukuoka', 'Nagoya', 'Hakone', 'Yokohama'] },
  { code: 'FR', name: 'France', flag: '🇫🇷', cities: ['Paris', 'Nice', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Strasbourg', 'Cannes', 'Annecy', 'Lille'] },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', cities: ['Rome', 'Florence', 'Venice', 'Milan', 'Naples', 'Turin', 'Bologna', 'Verona', 'Palermo', 'Pisa'] },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', cities: ['Barcelona', 'Madrid', 'Seville', 'Valencia', 'Granada', 'Malaga', 'Bilbao', 'Ibiza', 'Toledo', 'Cordoba'] },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain', 'Khor Fakkan', 'Jebel Ali'] },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', cities: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa', 'Cappadocia', 'Fethiye', 'Bodrum', 'Konya', 'Trabzon'] },
  { code: 'US', name: 'USA', flag: '🇺🇸', cities: ['New York', 'Los Angeles', 'San Francisco', 'Miami', 'Chicago', 'Las Vegas', 'Seattle', 'Boston', 'Orlando', 'San Diego'] },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', cities: ['Cancun', 'Mexico City', 'Guadalajara', 'Monterrey', 'Tulum', 'Playa del Carmen', 'Merida', 'Puerto Vallarta', 'Oaxaca', 'Los Cabos'] },
] as const;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const buildCityId = (countryCode: string, cityName: string) => `${countryCode.toLowerCase()}-${slugify(cityName)}`;

const mockCountries: Country[] = countryCitySeeds.map((country) => ({
  code: country.code,
  name: country.name,
  flag: country.flag,
  cities: country.cities.map((cityName) => buildCityId(country.code, cityName)),
}));

const cityHighlightsByCountry: Record<string, string[]> = {
  MY: ['Street food', 'Iconic skyline', 'Cultural districts'],
  TH: ['Night markets', 'Temples', 'Island hopping'],
  ID: ['Volcanic landscapes', 'Beach escapes', 'Temple heritage'],
  JP: ['Tradition meets modernity', 'Seasonal festivals', 'Food tours'],
  FR: ['Historic architecture', 'Cafe culture', 'Art museums'],
  IT: ['Ancient ruins', 'Regional cuisine', 'Renaissance landmarks'],
  ES: ['Gaudi architecture', 'Tapas routes', 'Sunset plazas'],
  AE: ['Luxury experiences', 'Desert adventures', 'Waterfront districts'],
  TR: ['Grand bazaars', 'Ottoman history', 'Coastal getaways'],
  US: ['City icons', 'National culture', 'Entertainment hubs'],
  MX: ['Mayan heritage', 'Beach resorts', 'Colorful old towns'],
};

const countryBasePoints: Record<string, { lat: number; lng: number }> = {
  MY: { lat: 3.139, lng: 101.6869 },
  TH: { lat: 13.7563, lng: 100.5018 },
  ID: { lat: -8.3405, lng: 115.092 },
  JP: { lat: 35.6762, lng: 139.6503 },
  FR: { lat: 48.8566, lng: 2.3522 },
  IT: { lat: 41.9028, lng: 12.4964 },
  ES: { lat: 41.3874, lng: 2.1686 },
  AE: { lat: 25.2048, lng: 55.2708 },
  TR: { lat: 41.0082, lng: 28.9784 },
  US: { lat: 40.7128, lng: -74.006 },
  MX: { lat: 21.1619, lng: -86.8515 },
};

const mockCities: City[] = countryCitySeeds.flatMap((country, countryIdx) =>
  country.cities.map((cityName, cityIdx) => {
    const basePoint = countryBasePoints[country.code] || countryBasePoints.MY;
    const ring = cityIdx - 4;
    const point = {
      lat: Number((basePoint.lat + ring * 0.07 + countryIdx * 0.01).toFixed(4)),
      lng: Number((basePoint.lng + ring * 0.07 + countryIdx * 0.01).toFixed(4)),
    };

    return {
      id: buildCityId(country.code, cityName),
      name: cityName,
      country: country.name,
      countryCode: country.code,
      latitude: point.lat,
      longitude: point.lng,
      description: `${cityName} in ${country.name} with curated experiences from local suppliers.`,
      activities: Array.from({ length: 10 }, (_, idx) => `act-${buildCityId(country.code, cityName)}-${idx + 1}`),
      packages: [],
      highlights: cityHighlightsByCountry[country.code],
    };
  })
);

const GLOBAL_CITIES = [
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869 },
  { city: 'Penang', country: 'Malaysia', lat: 5.4164, lng: 100.3327 },
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { city: 'Phuket', country: 'Thailand', lat: 7.9519, lng: 98.3381 },
  { city: 'Bali', country: 'Indonesia', lat: -8.3405, lng: 115.092 },
  { city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { city: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Nice', country: 'France', lat: 43.7102, lng: 7.262 },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { city: 'Florence', country: 'Italy', lat: 43.7696, lng: 11.2558 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3874, lng: 2.1686 },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { city: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lng: 54.3773 },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  { city: 'Ankara', country: 'Turkey', lat: 39.9334, lng: 32.8597 },
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'Cancun', country: 'Mexico', lat: 21.1619, lng: -86.8515 },
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
];

const getCityPoint = (city: string, offset = 0, countryCode?: string) => {
  const cityMatch = GLOBAL_CITIES.find((entry) => entry.city === city);
  const countryMatch = countryCode ? countryBasePoints[countryCode] : undefined;
  const base = cityMatch || countryMatch || GLOBAL_CITIES[0];
  const ring = (offset % 10) - 5;

  return {
    lat: Number((base.lat + ring * 0.07).toFixed(4)),
    lng: Number((base.lng + ring * 0.07).toFixed(4)),
  };
};

const serviceRequestToRequirement = (request: ServiceRequest): TripServiceRequirement => {
  const normalizedType: ServiceType =
    request.serviceType === 'activity_operator' ? 'activity_provider' : request.serviceType;

  if (normalizedType === 'translator') {
    const details = request.details as {
      from?: string;
      to?: string;
      context?: 'tourism' | 'business' | 'shopping' | 'medical' | 'event' | 'other';
      durationHours?: number;
      groupType?: 'solo' | 'family' | 'business';
    };

    return {
      type: 'translator',
      translatorDetails: {
        fromLanguage: details.from || 'English',
        toLanguage: details.to || 'Mandarin',
        context: details.context || 'tourism',
        durationHours: details.durationHours || 4,
        groupType: details.groupType || 'family',
      },
      details: {
        fromLanguage: details.from || 'English',
        toLanguage: details.to || 'Mandarin',
      },
    };
  }

  if (normalizedType === 'driver') {
    const details = request.details as {
      pickup?: string;
      dropoff?: string;
      tripType?: 'hourly' | 'half_day' | 'full_day' | 'airport';
      stops?: Array<{ name: string; type?: 'attraction' | 'restaurant' | 'shopping' | 'custom'; duration?: string }>;
      passengers?: number;
      luggage?: 'none' | 'light' | 'medium' | 'heavy';
      vehicle?: 'economy' | 'suv' | 'luxury' | 'van';
      notes?: string;
    };

    return {
      type: 'driver',
      driverDetails: {
        tripType: details.tripType || 'half_day',
        pickupLocation: details.pickup || '',
        dropoffLocation: details.dropoff || '',
        stops:
          details.stops?.map((stop) => ({
            name: stop.name,
            type: stop.type || 'custom',
            estimatedDuration: stop.duration === '30 mins' ? '30_mins' : stop.duration === '2 hours' ? '2_hours' : stop.duration === 'Flexible' ? 'flexible' : '1_hour',
          })) || [],
        startTime: '09:00',
        passengers: details.passengers || 2,
        vehicleType: details.vehicle || 'economy',
        luggage: details.luggage || 'light',
        specialNotes: details.notes,
      },
    };
  }

  if (normalizedType === 'guide') {
    const details = request.details as {
      pickup?: string;
      dropoff?: string;
      places?: string[];
      duration?: 'half_day' | 'full_day' | 'custom';
      durationHours?: number;
      groupSize?: number;
      language?: string;
      style?: 'relaxed' | 'balanced' | 'fast_paced';
      tourType?: 'cultural' | 'food' | 'adventure' | 'nature' | 'city_highlights' | 'custom';
      notes?: string;
    };

    return {
      type: 'guide',
      guideDetails: {
        pickupLocation: details.pickup,
        dropoffLocation: details.dropoff,
        duration: details.duration || 'full_day',
        durationHours: details.durationHours,
        places: (details.places || []).map((place) => ({ name: place, type: 'suggestion' })),
        tourType: details.tourType || 'cultural',
        groupSize: details.groupSize || 2,
        language: details.language || 'English',
        experienceStyle: details.style || 'balanced',
        notes: details.notes,
      },
    };
  }

  const details = request.details as {
    type?: 'water' | 'outdoor' | 'indoor' | 'wellness' | 'family';
    activity?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    minGroupSize?: number;
    maxGroupSize?: number;
    location?: string;
    duration?: '1-2h' | 'half_day' | 'full_day';
    equipment?: 'yes' | 'no' | 'partial';
    safety?: string;
    notes?: string;
  };

  return {
    type: 'activity_provider',
    activityDetails: {
      activityCategory: details.type || 'outdoor',
      activityName: details.activity || 'Guided Experience',
      location: details.location || '',
      skillLevel: details.level || 'beginner',
      minGroupSize: details.minGroupSize || 1,
      maxGroupSize: details.maxGroupSize || 6,
      duration: details.duration || 'half_day',
      equipmentIncluded: details.equipment || 'yes',
      safetyRequirements: details.safety,
      notes: details.notes,
    },
  };
};

const tripSeed: Array<{
  id: string;
  title: string;
  city: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  notes: string;
  status: TripStatus;
  createdBy: string;
  createdByRole: UserRole;
  isPreDesigned: boolean;
  isNegotiable: boolean;
  fixedPrice?: number;
  estimatedPriceRange?: { min: number; max: number };
  serviceRequests: ServiceRequest[];
}> = [
  {
    id: 't1',
    title: 'KL Cultural Highlights Day Tour',
    city: 'Kuala Lumpur',
    startDate: '2026-04-02',
    endDate: '2026-04-02',
    groupSize: 4,
    notes: 'Driver + guide for first-time visitors.',
    status: 'open',
    createdBy: 'u1',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 260, max: 420 },
    serviceRequests: [
      {
        serviceType: 'driver',
        details: {
          pickup: 'KLCC',
          dropoff: 'Bukit Bintang',
          tripType: 'full_day',
          stops: [
            { name: 'Petronas Twin Towers', type: 'attraction', duration: '1 hour' },
            { name: 'Batu Caves', type: 'attraction', duration: '2 hours' },
          ],
          passengers: 4,
          luggage: 'light',
          vehicle: 'suv',
        },
      },
      {
        serviceType: 'guide',
        details: {
          places: ['Petronas Twin Towers', 'Merdeka Square'],
          duration: 'full_day',
          groupSize: 4,
          language: 'English',
          style: 'relaxed',
          tourType: 'city_highlights',
        },
      },
    ],
  },
  {
    id: 't2',
    title: 'Bangkok Family Food & City Route',
    city: 'Bangkok',
    startDate: '2026-04-05',
    endDate: '2026-04-05',
    groupSize: 5,
    notes: 'Need a van and kid-friendly food stops.',
    status: 'negotiating',
    createdBy: 'u3',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 180, max: 320 },
    serviceRequests: [
      {
        serviceType: 'driver',
        details: {
          pickup: 'Suvarnabhumi Airport',
          dropoff: 'Siam Square Hotel',
          tripType: 'half_day',
          stops: [
            { name: 'Grand Palace', type: 'attraction', duration: '1 hour' },
            { name: 'Yaowarat Road', type: 'restaurant', duration: '1 hour' },
          ],
          passengers: 5,
          luggage: 'medium',
          vehicle: 'van',
        },
      },
    ],
  },
  {
    id: 't3',
    title: 'Bali Scuba + Island Mobility Package',
    city: 'Bali',
    startDate: '2026-04-08',
    endDate: '2026-04-08',
    groupSize: 2,
    notes: 'Beginner scuba and private transport.',
    status: 'open',
    createdBy: 'u5',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 320, max: 520 },
    serviceRequests: [
      {
        serviceType: 'activity_operator',
        details: {
          type: 'water',
          activity: 'Scuba Diving',
          level: 'beginner',
          minGroupSize: 2,
          maxGroupSize: 4,
          location: 'Nusa Dua',
          duration: 'half_day',
          equipment: 'yes',
          safety: 'Need beginner briefing',
        },
      },
      {
        serviceType: 'driver',
        details: {
          pickup: 'Seminyak Hotel',
          dropoff: 'Seminyak Hotel',
          tripType: 'full_day',
          stops: [{ name: 'Nusa Dua Harbor', type: 'attraction', duration: 'Flexible' }],
          passengers: 2,
          luggage: 'none',
          vehicle: 'economy',
        },
      },
    ],
  },
  {
    id: 't4',
    title: 'Tokyo Night Walk with Interpreter',
    city: 'Tokyo',
    startDate: '2026-04-11',
    endDate: '2026-04-11',
    groupSize: 3,
    notes: 'Need English-Japanese support for local markets.',
    status: 'open',
    createdBy: 'u6',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 200, max: 360 },
    serviceRequests: [
      {
        serviceType: 'guide',
        details: {
          places: ['Shibuya Crossing', 'Golden Gai'],
          duration: 'half_day',
          groupSize: 3,
          language: 'English',
          style: 'fast_paced',
          tourType: 'city_highlights',
        },
      },
      {
        serviceType: 'translator',
        details: { from: 'English', to: 'Japanese', durationHours: 3, context: 'tourism', groupType: 'family' },
      },
    ],
  },
  {
    id: 't5',
    title: 'Paris Museum & Culinary Route',
    city: 'Paris',
    startDate: '2026-04-15',
    endDate: '2026-04-16',
    groupSize: 2,
    notes: 'Two-day guide-focused itinerary.',
    status: 'booked',
    createdBy: 'u7',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 450, max: 780 },
    serviceRequests: [
      {
        serviceType: 'guide',
        details: {
          places: ['Louvre Museum', 'Montmartre', 'Le Marais'],
          duration: 'full_day',
          groupSize: 2,
          language: 'English',
          style: 'balanced',
          tourType: 'cultural',
        },
      },
    ],
  },
  {
    id: 't6',
    title: 'Rome Historic Core with Driver',
    city: 'Rome',
    startDate: '2026-04-18',
    endDate: '2026-04-18',
    groupSize: 6,
    notes: 'Family group, mixed mobility needs.',
    status: 'open',
    createdBy: 'u8',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 300, max: 500 },
    serviceRequests: [
      {
        serviceType: 'driver',
        details: {
          pickup: 'Roma Termini',
          dropoff: 'Hotel Eden',
          tripType: 'full_day',
          stops: [
            { name: 'Colosseum', type: 'attraction', duration: '2 hours' },
            { name: 'Trevi Fountain', type: 'attraction', duration: '30 mins' },
          ],
          passengers: 6,
          luggage: 'medium',
          vehicle: 'van',
        },
      },
      {
        serviceType: 'guide',
        details: {
          places: ['Colosseum', 'Roman Forum'],
          duration: 'full_day',
          groupSize: 6,
          language: 'English',
          style: 'balanced',
          tourType: 'cultural',
        },
      },
    ],
  },
  {
    id: 't7',
    title: 'Barcelona Budget City Highlights',
    city: 'Barcelona',
    startDate: '2026-04-20',
    endDate: '2026-04-20',
    groupSize: 2,
    notes: 'Budget trip under $100 for services.',
    status: 'open',
    createdBy: 'u9',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 50, max: 100 },
    serviceRequests: [
      {
        serviceType: 'guide',
        details: {
          places: ['La Rambla', 'Gothic Quarter'],
          duration: 'half_day',
          groupSize: 2,
          language: 'English',
          style: 'relaxed',
          tourType: 'city_highlights',
        },
      },
    ],
  },
  {
    id: 't8',
    title: 'Dubai Luxury Multi-Service Escape',
    city: 'Dubai',
    startDate: '2026-04-22',
    endDate: '2026-04-23',
    groupSize: 3,
    notes: 'Luxury itinerary with private suppliers.',
    status: 'negotiating',
    createdBy: 'u10',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 1000, max: 1800 },
    serviceRequests: [
      {
        serviceType: 'driver',
        details: {
          pickup: 'Dubai International Airport',
          dropoff: 'Burj Al Arab',
          tripType: 'full_day',
          stops: [
            { name: 'Dubai Mall', type: 'shopping', duration: '2 hours' },
            { name: 'Palm Jumeirah', type: 'attraction', duration: '1 hour' },
          ],
          passengers: 3,
          luggage: 'heavy',
          vehicle: 'luxury',
        },
      },
      {
        serviceType: 'guide',
        details: {
          places: ['Burj Khalifa', 'Old Dubai', 'Palm Jumeirah'],
          duration: 'full_day',
          groupSize: 3,
          language: 'English',
          style: 'relaxed',
          tourType: 'city_highlights',
        },
      },
      {
        serviceType: 'activity_operator',
        details: {
          type: 'outdoor',
          activity: 'Desert Safari',
          level: 'beginner',
          minGroupSize: 2,
          maxGroupSize: 6,
          location: 'Dubai Desert Conservation Reserve',
          duration: 'half_day',
          equipment: 'yes',
        },
      },
    ],
  },
  {
    id: 't9',
    title: 'Istanbul Bazaar Translation Day',
    city: 'Istanbul',
    startDate: '2026-04-25',
    endDate: '2026-04-25',
    groupSize: 1,
    notes: 'Solo traveler looking for translation support.',
    status: 'open',
    createdBy: 'u11',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 120, max: 240 },
    serviceRequests: [
      { serviceType: 'translator', details: { from: 'Arabic', to: 'English', durationHours: 3, context: 'shopping', groupType: 'solo' } },
    ],
  },
  {
    id: 't10',
    title: 'NYC Corporate Delegation Route',
    city: 'New York',
    startDate: '2026-04-27',
    endDate: '2026-04-27',
    groupSize: 12,
    notes: 'Large group requiring van logistics and guide.',
    status: 'negotiating',
    createdBy: 'u12',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 780, max: 1200 },
    serviceRequests: [
      {
        serviceType: 'driver',
        details: {
          pickup: 'JFK Airport',
          dropoff: 'Times Square Hotel',
          tripType: 'full_day',
          stops: [
            { name: 'Wall Street', type: 'attraction', duration: '1 hour' },
            { name: 'Central Park', type: 'attraction', duration: '1 hour' },
          ],
          passengers: 12,
          luggage: 'heavy',
          vehicle: 'van',
        },
      },
      {
        serviceType: 'guide',
        details: {
          places: ['Statue of Liberty Ferry', 'Times Square'],
          duration: 'full_day',
          groupSize: 12,
          language: 'English',
          style: 'fast_paced',
          tourType: 'city_highlights',
        },
      },
    ],
  },
  {
    id: 't11',
    title: 'Los Angeles Last-Minute Beach Day',
    city: 'Los Angeles',
    startDate: '2026-03-28',
    endDate: '2026-03-28',
    groupSize: 3,
    notes: 'Last-minute same-week booking needed.',
    status: 'started',
    createdBy: 'u1',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 220, max: 390 },
    serviceRequests: [
      {
        serviceType: 'driver',
        details: {
          pickup: 'Santa Monica',
          dropoff: 'Venice Beach',
          tripType: 'hourly',
          stops: [{ name: 'The Getty', type: 'attraction', duration: '1 hour' }],
          passengers: 3,
          luggage: 'none',
          vehicle: 'suv',
        },
      },
    ],
  },
  {
    id: 't12',
    title: 'Cancun Adventure Combo',
    city: 'Cancun',
    startDate: '2026-05-02',
    endDate: '2026-05-02',
    groupSize: 4,
    notes: 'ATV + snorkeling same day.',
    status: 'booked',
    createdBy: 'u3',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 360, max: 640 },
    serviceRequests: [
      {
        serviceType: 'activity_operator',
        details: {
          type: 'outdoor',
          activity: 'ATV Ride',
          level: 'intermediate',
          minGroupSize: 2,
          maxGroupSize: 8,
          location: 'Selvatica',
          duration: 'half_day',
          equipment: 'yes',
        },
      },
      {
        serviceType: 'activity_operator',
        details: {
          type: 'water',
          activity: 'Snorkeling',
          level: 'beginner',
          minGroupSize: 2,
          maxGroupSize: 6,
          location: 'Isla Mujeres',
          duration: 'half_day',
          equipment: 'yes',
        },
      },
    ],
  },
  {
    id: 't13',
    title: 'Tokyo Medical Translation Visit',
    city: 'Tokyo',
    startDate: '2026-05-04',
    endDate: '2026-05-04',
    groupSize: 2,
    notes: 'Hospital interpretation support.',
    status: 'completed',
    createdBy: 'u5',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 180, max: 320 },
    serviceRequests: [
      { serviceType: 'translator', details: { from: 'English', to: 'Japanese', durationHours: 4, context: 'medical', groupType: 'family' } },
    ],
  },
  {
    id: 't14',
    title: 'Paris Romance Evening',
    city: 'Paris',
    startDate: '2026-05-06',
    endDate: '2026-05-06',
    groupSize: 2,
    notes: 'Private car for evening scenic route.',
    status: 'open',
    createdBy: 'u6',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 260, max: 430 },
    serviceRequests: [
      {
        serviceType: 'driver',
        details: {
          pickup: 'Hotel Lutetia',
          dropoff: 'Hotel Lutetia',
          tripType: 'hourly',
          stops: [
            { name: 'Eiffel Tower', type: 'attraction', duration: '1 hour' },
            { name: 'Seine River Cruise Dock', type: 'attraction', duration: '1 hour' },
          ],
          passengers: 2,
          luggage: 'none',
          vehicle: 'luxury',
        },
      },
    ],
  },
  {
    id: 't15',
    title: 'Rome Family Cultural + Food Day',
    city: 'Rome',
    startDate: '2026-05-07',
    endDate: '2026-05-07',
    groupSize: 7,
    notes: 'Need guide with child-friendly pacing.',
    status: 'negotiating',
    createdBy: 'u7',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 340, max: 620 },
    serviceRequests: [
      {
        serviceType: 'guide',
        details: {
          places: ['Colosseum', 'Trastevere'],
          duration: 'full_day',
          groupSize: 7,
          language: 'English',
          style: 'relaxed',
          tourType: 'food',
        },
      },
      {
        serviceType: 'driver',
        details: {
          pickup: 'Rome Airport',
          dropoff: 'Centro Storico',
          tripType: 'half_day',
          stops: [{ name: 'Vatican Area', type: 'attraction', duration: '1 hour' }],
          passengers: 7,
          luggage: 'medium',
          vehicle: 'van',
        },
      },
    ],
  },
  {
    id: 't16',
    title: 'Barcelona Wellness Retreat Transfer',
    city: 'Barcelona',
    startDate: '2026-05-10',
    endDate: '2026-05-10',
    groupSize: 4,
    notes: 'Transfer and wellness package.',
    status: 'booked',
    createdBy: 'u8',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 220, max: 450 },
    serviceRequests: [
      {
        serviceType: 'activity_operator',
        details: {
          type: 'wellness',
          activity: 'Yoga Retreat',
          level: 'beginner',
          minGroupSize: 2,
          maxGroupSize: 10,
          location: 'Montjuic Wellness Center',
          duration: 'full_day',
          equipment: 'partial',
        },
      },
    ],
  },
  {
    id: 't17',
    title: 'Dubai Airport Transfer Solo',
    city: 'Dubai',
    startDate: '2026-05-12',
    endDate: '2026-05-12',
    groupSize: 1,
    notes: 'Solo traveler, premium sedan.',
    status: 'completed',
    createdBy: 'u9',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: false,
    fixedPrice: 140,
    serviceRequests: [
      {
        serviceType: 'driver',
        details: {
          pickup: 'DXB Terminal 3',
          dropoff: 'Marina Hotel',
          tripType: 'airport',
          stops: [],
          passengers: 1,
          luggage: 'light',
          vehicle: 'economy',
        },
      },
    ],
  },
  {
    id: 't18',
    title: 'Istanbul Family Adventure Day',
    city: 'Istanbul',
    startDate: '2026-05-14',
    endDate: '2026-05-14',
    groupSize: 10,
    notes: 'Large family with mixed ages.',
    status: 'open',
    createdBy: 'u10',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 420, max: 700 },
    serviceRequests: [
      {
        serviceType: 'guide',
        details: {
          places: ['Blue Mosque', 'Topkapi Palace', 'Grand Bazaar'],
          duration: 'full_day',
          groupSize: 10,
          language: 'English',
          style: 'balanced',
          tourType: 'cultural',
        },
      },
      {
        serviceType: 'translator',
        details: { from: 'Arabic', to: 'English', durationHours: 6, context: 'tourism', groupType: 'family' },
      },
    ],
  },
  {
    id: 't19',
    title: 'NYC Family Indoor Fun',
    city: 'New York',
    startDate: '2026-05-17',
    endDate: '2026-05-17',
    groupSize: 5,
    notes: 'Rain-friendly indoor activities.',
    status: 'open',
    createdBy: 'u11',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 250, max: 460 },
    serviceRequests: [
      {
        serviceType: 'activity_operator',
        details: {
          type: 'indoor',
          activity: 'VR Experience',
          level: 'beginner',
          minGroupSize: 3,
          maxGroupSize: 8,
          location: 'Midtown Manhattan',
          duration: 'half_day',
          equipment: 'yes',
        },
      },
      {
        serviceType: 'driver',
        details: {
          pickup: 'Midtown Hotel',
          dropoff: 'Midtown Hotel',
          tripType: 'hourly',
          stops: [{ name: 'Chelsea Market', type: 'shopping', duration: '1 hour' }],
          passengers: 5,
          luggage: 'none',
          vehicle: 'suv',
        },
      },
    ],
  },
  {
    id: 't20',
    title: 'Los Angeles Beginner Wellness Day',
    city: 'Los Angeles',
    startDate: '2026-05-20',
    endDate: '2026-05-20',
    groupSize: 2,
    notes: 'Yoga + spa day near Santa Monica.',
    status: 'completed',
    createdBy: 'u12',
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: { min: 190, max: 330 },
    serviceRequests: [
      {
        serviceType: 'activity_operator',
        details: {
          type: 'wellness',
          activity: 'Spa',
          level: 'beginner',
          minGroupSize: 1,
          maxGroupSize: 4,
          location: 'Santa Monica',
          duration: 'half_day',
          equipment: 'yes',
        },
      },
    ],
  },
];

const mockTrips: Trip[] = tripSeed.map((seed, tripIdx) => {
  const cityPoint = getCityPoint(seed.city);
  const inferredStops = seed.serviceRequests
    .flatMap((request) => {
      if (request.serviceType === 'driver') {
        const details = request.details as { pickup?: string; dropoff?: string; stops?: Array<{ name: string }> };
        const driverStops = details.stops?.map((stop) => stop.name) || [];
        return [details.pickup, ...driverStops, details.dropoff].filter(Boolean) as string[];
      }
      if (request.serviceType === 'guide') {
        return ((request.details as { places?: string[] }).places || []) as string[];
      }
      if (request.serviceType === 'activity_operator') {
        const activityDetails = request.details as { location?: string; activity?: string };
        return [activityDetails.activity || 'Activity', activityDetails.location || seed.city];
      }
      return [seed.city];
    })
    .slice(0, 4);

  const serviceRequirements = seed.serviceRequests.map(serviceRequestToRequirement).map(withPricingGuidance);
  const servicesNeeded = serviceRequirements.map((service) => service.type);

  return {
    id: seed.id,
    title: seed.title,
    city: seed.city,
    startDate: seed.startDate,
    endDate: seed.endDate,
    duration: Math.max(1, Math.ceil((new Date(seed.endDate).getTime() - new Date(seed.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1)),
    stops: inferredStops.map((name, idx) => ({
      id: `${seed.id}_stop_${idx + 1}`,
      name,
      duration: idx === 0 ? 45 : 90,
      location: {
        lat: Number((cityPoint.lat + idx * 0.012 + tripIdx * 0.001).toFixed(4)),
        lng: Number((cityPoint.lng + idx * 0.012 + tripIdx * 0.001).toFixed(4)),
      },
    })),
    requiredServices: serviceRequirements,
    serviceRequests: seed.serviceRequests,
    servicesNeeded,
    groupSize: seed.groupSize,
    notes: seed.notes,
    status: seed.status,
    createdBy: seed.createdBy,
    createdByRole: seed.createdByRole,
    isPreDesigned: seed.isPreDesigned,
    isNegotiable: seed.isNegotiable,
    fixedPrice: seed.fixedPrice,
    estimatedPriceRange: seed.estimatedPriceRange,
    offerCount: 0,
    currentParticipants: seed.groupSize > 1 ? Math.max(1, Math.floor(seed.groupSize / 2)) : 1,
    maxParticipants: Math.max(seed.groupSize, 6),
  };
});

const travelerUsers: User[] = [
  { id: 'u1', name: 'Liam Carter', email: 'liam@tripulike.demo', phone: '+12025550101', role: 'traveler', verificationStatus: 'verified', reviewCount: 14, rating: 4.8, completedTrips: 18, joinedDate: '2024-02-11', location: 'New York' },
  { id: 'u2', name: 'Sofia Rivera', email: 'sofia@tripulike.demo', phone: '+12135550102', role: 'traveler', verificationStatus: 'verified', reviewCount: 9, rating: 4.7, completedTrips: 12, joinedDate: '2024-03-06', location: 'Los Angeles' },
  { id: 'u3', name: 'Noah Bennett', email: 'noah@tripulike.demo', phone: '+442035550103', role: 'traveler', verificationStatus: 'verified', reviewCount: 11, rating: 4.9, completedTrips: 20, joinedDate: '2023-11-20', location: 'London' },
  { id: 'u4', name: 'Aisha Rahman', email: 'aisha@tripulike.demo', phone: '+97145550104', role: 'traveler', verificationStatus: 'verified', reviewCount: 6, rating: 4.6, completedTrips: 8, joinedDate: '2024-05-15', location: 'Dubai' },
  { id: 'u5', name: 'Kenji Sato', email: 'kenji@tripulike.demo', phone: '+8135550105', role: 'traveler', verificationStatus: 'verified', reviewCount: 7, rating: 4.8, completedTrips: 10, joinedDate: '2024-04-01', location: 'Tokyo' },
  { id: 'u6', name: 'Mina Park', email: 'mina@tripulike.demo', phone: '+8225550106', role: 'traveler', verificationStatus: 'verified', reviewCount: 5, rating: 4.7, completedTrips: 7, joinedDate: '2024-01-19', location: 'Seoul' },
  { id: 'u7', name: 'Emma Dubois', email: 'emma@tripulike.demo', phone: '+3315550107', role: 'traveler', verificationStatus: 'verified', reviewCount: 12, rating: 4.9, completedTrips: 16, joinedDate: '2023-12-10', location: 'Paris' },
  { id: 'u8', name: 'Marco Rossi', email: 'marco@tripulike.demo', phone: '+39065550108', role: 'traveler', verificationStatus: 'verified', reviewCount: 4, rating: 4.5, completedTrips: 6, joinedDate: '2024-06-02', location: 'Rome' },
  { id: 'u9', name: 'Fatima Al Nuaimi', email: 'fatima@tripulike.demo', phone: '+97155550109', role: 'traveler', verificationStatus: 'verified', reviewCount: 8, rating: 4.8, completedTrips: 11, joinedDate: '2024-02-08', location: 'Abu Dhabi' },
  { id: 'u10', name: 'David Wong', email: 'david@tripulike.demo', phone: '+60125550110', role: 'traveler', verificationStatus: 'verified', reviewCount: 15, rating: 4.9, completedTrips: 22, joinedDate: '2023-10-27', location: 'Kuala Lumpur' },
  { id: 'u11', name: 'Nurul Azizah', email: 'nurul@tripulike.demo', phone: '+60135550111', role: 'traveler', verificationStatus: 'verified', reviewCount: 10, rating: 4.8, completedTrips: 14, joinedDate: '2024-03-01', location: 'Penang' },
  { id: 'u12', name: 'Carlos Mendoza', email: 'carlos@tripulike.demo', phone: '+5255550112', role: 'traveler', verificationStatus: 'verified', reviewCount: 13, rating: 4.7, completedTrips: 17, joinedDate: '2023-12-22', location: 'Cancun' },
];

const driverProfiles = [
  ['s1', 'Ahmad Hassan', 'Kuala Lumpur', 'SUV', 6, 4.8, 143],
  ['s4', 'Narin Chai', 'Bangkok', 'Van', 10, 4.7, 119],
  ['s5', 'Putu Mahendra', 'Bali', 'SUV', 5, 4.9, 176],
  ['s6', 'Hiro Tanaka', 'Tokyo', 'Economy', 4, 4.8, 201],
  ['s7', 'Luc Martin', 'Paris', 'Luxury', 3, 4.9, 156],
  ['s8', 'Giorgio Bianchi', 'Rome', 'Van', 8, 4.7, 132],
  ['s9', 'Marta Soler', 'Barcelona', 'Economy', 4, 4.8, 144],
  ['s10', 'Omar Al Mansoori', 'Dubai', 'Luxury', 4, 4.9, 188],
  ['s15', 'Emre Kaplan', 'Istanbul', 'SUV', 6, 4.7, 111],
  ['s16', 'Diego Morales', 'Cancun', 'Van', 9, 4.8, 126],
] as const;

const guideProfiles = [
  ['s2', 'Rashid Ahmad', 'Kuala Lumpur', ['cultural', 'food'], 4.9, 120],
  ['s11', 'Anong Srisawat', 'Bangkok', ['food', 'city'], 4.8, 99],
  ['s17', 'Wayan Surya', 'Bali', ['nature', 'adventure'], 4.9, 162],
  ['s18', 'Yuki Arai', 'Tokyo', ['city', 'culture'], 4.8, 138],
  ['s19', 'Claire Bernard', 'Paris', ['cultural', 'history'], 4.9, 205],
  ['s20', 'Franco Villa', 'Rome', ['history', 'food'], 4.8, 174],
  ['s22', 'Jordi Camps', 'Barcelona', ['city', 'food'], 4.7, 112],
  ['s23', 'Layla Haddad', 'Dubai', ['city', 'luxury'], 4.8, 141],
  ['s24', 'Deniz Aksoy', 'Istanbul', ['cultural', 'shopping'], 4.7, 118],
  ['s25', 'Samantha King', 'New York', ['city', 'family'], 4.8, 147],
] as const;

const translatorProfiles = [
  ['s12', 'Mei Lin Interpreter', 'Kuala Lumpur', [['English', 'Mandarin'], ['Mandarin', 'English']], 4.9, 98],
  ['s13', 'Yousef Language Services', 'Dubai', [['Arabic', 'English'], ['English', 'Arabic']], 4.7, 61],
  ['s14', 'Aiko Nakamura', 'Tokyo', [['English', 'Japanese'], ['Japanese', 'English']], 4.8, 74],
  ['s21', 'Bora Demir', 'Istanbul', [['Turkish', 'English'], ['Arabic', 'English']], 4.7, 80],
  ['s26', 'Lina Gomez', 'Cancun', [['Spanish', 'English'], ['English', 'Spanish']], 4.8, 95],
  ['s27', 'Nadia Karim', 'Bangkok', [['Arabic', 'English'], ['English', 'Thai']], 4.7, 77],
  ['s28', 'Ken Watanabe', 'Los Angeles', [['Japanese', 'English'], ['English', 'Japanese']], 4.8, 89],
  ['s29', 'Marie Laurent', 'Paris', [['French', 'English'], ['English', 'French']], 4.9, 123],
  ['s30', 'Giulia Neri', 'Rome', [['Italian', 'English'], ['English', 'Italian']], 4.8, 102],
  ['s31', 'Sora Lee', 'New York', [['Korean', 'English'], ['English', 'Korean']], 4.7, 68],
] as const;

const activityProfiles = [
  ['s3', 'BlueWave Experiences', 'Bali', ['water', 'outdoor'], ['PADI', 'Rescue Diver'], 4.8, 206],
  ['s32', 'Andaman Pro Adventures', 'Bangkok', ['outdoor', 'family'], ['ATTA', 'First Aid'], 4.7, 131],
  ['s33', 'Tokyo Indoor Labs', 'Tokyo', ['indoor', 'family'], ['ISO 21101'], 4.8, 140],
  ['s34', 'Paris Wellness Studio', 'Paris', ['wellness'], ['Wellness Europe'], 4.9, 172],
  ['s35', 'Roma Adventure Club', 'Rome', ['outdoor', 'family'], ['UIAA'], 4.7, 117],
  ['s36', 'Barcelona Sea Co.', 'Barcelona', ['water'], ['PADI'], 4.8, 124],
  ['s37', 'Desert Pulse Dubai', 'Dubai', ['outdoor', 'family'], ['DTCM Approved'], 4.9, 193],
  ['s38', 'Istanbul Family Activities', 'Istanbul', ['family', 'indoor'], ['Local Tourism Board'], 4.7, 108],
  ['s39', 'NYC Urban Experiences', 'New York', ['indoor', 'outdoor'], ['US Adventure Safety'], 4.8, 134],
  ['s40', 'Cancun Reef Masters', 'Cancun', ['water', 'family'], ['PADI', 'EFR'], 4.9, 167],
] as const;

const driverUsers: User[] = driverProfiles.map(([id, name, city, vehicleType, maxPassengers, rating, reviewCount], idx) => ({
  id,
  name,
  email: `${id}@tripulike.demo`,
  phone: `+1000000${idx + 100}`,
  role: 'driver',
  serviceType: 'driver',
  operatingLocation: city,
  verificationStatus: 'verified',
  reviewCount,
  rating,
  completedTrips: reviewCount + 90,
  joinedDate: `2023-${String((idx % 9) + 1).padStart(2, '0')}-12`,
  vehicleInfo: { type: vehicleType, model: `${vehicleType} Pro`, plateNumber: `${city.slice(0, 3).toUpperCase()}-${1000 + idx}` },
  specialties: ['Airport Transfer', `${city} City Routes`, `Up to ${maxPassengers} passengers`],
}));

const guideUsers: User[] = guideProfiles.map(([id, name, city, specialties, rating, reviewCount], idx) => ({
  id,
  name,
  email: `${id}@tripulike.demo`,
  phone: `+2000000${idx + 100}`,
  role: 'guide',
  serviceType: 'guide',
  operatingLocation: city,
  verificationStatus: 'verified',
  reviewCount,
  rating,
  completedTrips: reviewCount + 70,
  joinedDate: `2023-${String((idx % 9) + 1).padStart(2, '0')}-18`,
  guideSpecialties: specialties,
  specialties,
}));

const translatorUsers: User[] = translatorProfiles.map(([id, name, city, languagePairs, rating, reviewCount], idx) => ({
  id,
  name,
  email: `${id}@tripulike.demo`,
  phone: `+3000000${idx + 100}`,
  role: 'translator',
  serviceType: 'translator',
  operatingLocation: city,
  verificationStatus: 'verified',
  reviewCount,
  rating,
  completedTrips: reviewCount + 50,
  joinedDate: `2023-${String((idx % 9) + 1).padStart(2, '0')}-24`,
  languages: languagePairs.map(([from, to]) => ({ from, to })),
  specialties: ['Tourism', 'Business', 'Medical'],
}));

const activityUsers: User[] = activityProfiles.map(([id, name, city, activityTypes, certifications, rating, reviewCount], idx) => ({
  id,
  name,
  email: `${id}@tripulike.demo`,
  phone: `+4000000${idx + 100}`,
  role: 'activity_operator',
  serviceType: 'activity_provider',
  operatingLocation: city,
  verificationStatus: 'verified',
  reviewCount,
  rating,
  completedTrips: reviewCount + 110,
  joinedDate: `2022-${String((idx % 9) + 1).padStart(2, '0')}-05`,
  activityTypes,
  specialties: certifications,
}));

const mockUsers: User[] = [...travelerUsers, ...driverUsers, ...guideUsers, ...translatorUsers, ...activityUsers];

const supplierById = Object.fromEntries(
  mockUsers.filter((user) => user.role !== 'traveler').map((supplier) => [supplier.id, supplier])
) as Record<string, User>;

const offerScenarioSeeds: Array<{
  tripId: string;
  supplierRole: UserRole;
  supplierIds: string[];
  roundPrices: number[];
  acceptedSupplierId: string;
}> = [
  { tripId: 't1', supplierRole: 'guide', supplierIds: ['s2', 's11'], roundPrices: [360, 330, 340], acceptedSupplierId: 's2' },
  { tripId: 't2', supplierRole: 'driver', supplierIds: ['s1', 's4', 's5'], roundPrices: [290, 270, 275], acceptedSupplierId: 's4' },
  { tripId: 't3', supplierRole: 'activity_operator', supplierIds: ['s3', 's40'], roundPrices: [420, 390, 400], acceptedSupplierId: 's3' },
  { tripId: 't4', supplierRole: 'translator', supplierIds: ['s14', 's28'], roundPrices: [260, 235, 240], acceptedSupplierId: 's14' },
  { tripId: 't5', supplierRole: 'guide', supplierIds: ['s19', 's25'], roundPrices: [540, 510, 520], acceptedSupplierId: 's19' },
  { tripId: 't6', supplierRole: 'driver', supplierIds: ['s8', 's15'], roundPrices: [420, 390, 400], acceptedSupplierId: 's8' },
  { tripId: 't8', supplierRole: 'driver', supplierIds: ['s10', 's7'], roundPrices: [1400, 1250, 1320], acceptedSupplierId: 's10' },
  { tripId: 't9', supplierRole: 'translator', supplierIds: ['s13', 's21'], roundPrices: [210, 190, 195], acceptedSupplierId: 's13' },
  { tripId: 't10', supplierRole: 'guide', supplierIds: ['s25', 's23'], roundPrices: [980, 900, 930], acceptedSupplierId: 's25' },
  { tripId: 't11', supplierRole: 'driver', supplierIds: ['s9', 's16'], roundPrices: [310, 280, 295], acceptedSupplierId: 's9' },
  { tripId: 't12', supplierRole: 'activity_operator', supplierIds: ['s40', 's37'], roundPrices: [500, 450, 470], acceptedSupplierId: 's40' },
  { tripId: 't18', supplierRole: 'translator', supplierIds: ['s21', 's13'], roundPrices: [380, 340, 355], acceptedSupplierId: 's21' },
];

const mockOffers: Offer[] = offerScenarioSeeds.flatMap((scenario, scenarioIdx) =>
  scenario.supplierIds.flatMap((supplierId, supplierIdx) => {
    const supplier = supplierById[supplierId];
    if (!supplier) return [];

    return scenario.roundPrices.map((price, roundIdx) => {
      const status =
        roundIdx === scenario.roundPrices.length - 1
          ? supplierId === scenario.acceptedSupplierId
            ? 'accepted'
            : 'declined'
          : roundIdx === 1
            ? 'countered'
            : 'pending';

      return {
        id: `o${scenarioIdx + 1}_${supplierIdx + 1}_${roundIdx + 1}`,
        tripId: scenario.tripId,
        supplierId,
        supplierName: supplier.name,
        supplierRole: scenario.supplierRole,
        supplierRating: supplier.rating,
        supplierReviewCount: supplier.reviewCount,
        supplierVerified: supplier.verificationStatus === 'verified',
        price: price + supplierIdx * 12,
        notes: `Round ${roundIdx + 1} proposal for ${scenario.tripId} from ${supplier.name}.`,
        validUntil: `2026-05-${String(10 + roundIdx).padStart(2, '0')}`,
        createdAt: `2026-04-${String(8 + scenarioIdx).padStart(2, '0')}T0${Math.min(8 + roundIdx, 9)}:30:00`,
        round: roundIdx + 1,
        status,
        isPriceMatch: roundIdx === 0 ? 'fair' : roundIdx === 1 ? 'good' : supplierId === scenario.acceptedSupplierId ? 'good' : 'high',
      } as Offer;
    });
  })
);

mockTrips.forEach((trip) => {
  trip.offerCount = mockOffers.filter((offer) => offer.tripId === trip.id).length;
});

const mockBookings: Booking[] = [
  ...mockOffers
    .filter((offer) => offer.status === 'accepted')
    .slice(0, 10)
    .map((offer, idx) => {
      const trip = mockTrips.find((candidate) => candidate.id === offer.tripId) as Trip;
      const travelerId = trip.createdByRole === 'traveler' ? trip.createdBy : 'u1';
      const finalPrice = offer.price;
      const platformFeeRate = 0.12;
      const platformFee = Number((finalPrice * platformFeeRate).toFixed(2));
      const escrowHeld = Number((finalPrice + platformFee).toFixed(2));
      const commission = platformFee;
      const supplierPayout = finalPrice;

      return {
        id: `b${idx + 1}`,
        tripId: trip.id,
        trip,
        travelerId,
        supplierId: offer.supplierId,
        finalPrice,
        depositAmount: finalPrice,
        depositPaid: true,
        fullPayment: true,
        escrowHeld,
        commission,
        supplierPayout,
        platformFee,
        platformFeeRate,
        escrowAmount: escrowHeld,
        payoutToSupplier: supplierPayout,
        bookingDate: `2026-04-${String(10 + idx).padStart(2, '0')}T10:00:00`,
        paymentMethod: idx % 2 === 0 ? 'deposit' : 'full',
        cancellationPolicy: {
          moreThan24h: 100,
          between10And24h: 50,
          lessThan10h: 0,
        },
        trackingEnabled: trip.status === 'booked' || trip.status === 'started',
        tripStartedAt: trip.status === 'started' || trip.status === 'completed' ? `2026-04-${String(11 + idx).padStart(2, '0')}T09:15:00` : undefined,
      } as Booking;
    }),
];

const mockReviews: Review[] = [
  {
    id: 'r1',
    tripId: 't1',
    bookingId: 'b1',
    reviewerId: 'u3',
    reviewerName: 'Sarah Chen',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    reviewedUserId: 's2',
    serviceRating: 5,
    safetyRating: 5,
    communicationRating: 5,
    comment: 'Rashid was an amazing guide! Very knowledgeable about KL history and culture. Made our family trip memorable. Highly recommend!',
    createdAt: '2026-02-20T16:30:00',
    helpful: 12,
  },
  {
    id: 'r2',
    tripId: 't1',
    bookingId: 'b2',
    reviewerId: 'u7',
    reviewerName: 'Michael Brown',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    reviewedUserId: 's2',
    serviceRating: 5,
    safetyRating: 5,
    communicationRating: 4,
    comment: 'Excellent tour! Rashid\'s English was perfect and he shared so many interesting facts about each location. The timing was spot on.',
    createdAt: '2026-02-15T14:20:00',
    helpful: 8,
  },
  {
    id: 'r3',
    tripId: 't1',
    bookingId: 'b3',
    reviewerId: 'u8',
    reviewerName: 'Emma Wilson',
    reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    reviewedUserId: 's2',
    serviceRating: 4,
    safetyRating: 5,
    communicationRating: 5,
    comment: 'Great experience overall. Batu Caves was breathtaking! The guide was patient with our questions and made sure we were comfortable throughout.',
    createdAt: '2026-02-10T11:15:00',
    helpful: 5,
  },
];

const mockSocialPosts: SocialPost[] = [
  {
    id: 'sp1',
    userId: 'u3',
    userName: 'Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    userLocation: 'Singapore',
    tripId: 't1',
    supplierId: 's2',
    supplierName: 'Rashid Tours',
    location: 'Batu Caves, Kuala Lumpur',
    caption: 'Absolutely stunning visit to Batu Caves! 🙏✨ The 272 colorful steps were worth every climb. Our guide Rashid from @RashidTours shared amazing insights about Hindu culture. Pro tip: Visit early morning to avoid crowds and heat! #BatuCaves #KualaLumpur #Malaysia',
    images: ['https://images.unsplash.com/photo-1545428320-c4cbdfc269bc?w=800'],
    rating: 5,
    tags: ['#BatuCaves', '#KualaLumpur', '#Malaysia', '#Culture', '#Temple'],
    likes: 234,
    comments: 18,
    shares: 12,
    createdAt: '2026-02-24T15:30:00',
    isLiked: false,
    isBookmarked: false,
    postType: 'experience',
  },
  {
    id: 'sp2',
    userId: 'u7',
    userName: 'Michael Brown',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    userLocation: 'London, UK',
    location: 'Petronas Twin Towers, Kuala Lumpur',
    caption: 'Sunrise at KLCC Park with these iconic towers! 🌅 Did you know you can visit the sky bridge? Book in advance! The view is breathtaking. Perfect start to exploring KL. #PetronasTowers #KLCC #SunriseViews',
    images: ['https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800'],
    rating: 5,
    tags: ['#PetronasTowers', '#KLCC', '#KualaLumpur', '#Architecture'],
    likes: 189,
    comments: 14,
    shares: 8,
    createdAt: '2026-02-23T07:45:00',
    isLiked: true,
    isBookmarked: true,
    postType: 'experience',
  },
  {
    id: 'sp3',
    userId: 'u8',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    userLocation: 'Melbourne, Australia',
    location: 'Cameron Highlands',
    caption: 'Tea plantation paradise! 🍵🌿 Spent an amazing day at BOH Tea Plantation. The rolling hills, fresh air, and tea tasting session were perfect. Don\'t miss the scones with strawberry jam! Highly recommend the guided tour. #CameronHighlands #TeaPlantation #Malaysia',
    images: ['https://images.unsplash.com/photo-1587824209331-1e87494d40a9?w=800'],
    rating: 5,
    tags: ['#CameronHighlands', '#Tea', '#Nature', '#Highlands'],
    likes: 312,
    comments: 24,
    shares: 19,
    createdAt: '2026-02-22T13:20:00',
    isLiked: false,
    isBookmarked: true,
    postType: 'experience',
  },
  {
    id: 'sp4',
    userId: 'u5',
    userName: 'David Kim',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    userLocation: 'Seoul, South Korea',
    postType: 'tripmate',
    location: 'Penang, Malaysia',
    caption: '🔍 Looking for foodie tripmates! Planning a 3-day Penang food adventure April 1-3. Love street food, night markets, and hidden gems. Let\'s explore and split costs! Budget: ~RM 200/day. Anyone interested? 🍜🥘',
    images: ['https://images.unsplash.com/photo-1583415091141-d8e9d6c5d8e3?w=800'],
    tags: ['#FindYourTripmate', '#Penang', '#FoodTravel', '#SoloTravel'],
    likes: 47,
    comments: 8,
    shares: 5,
    createdAt: '2026-02-25T10:15:00',
    isLiked: false,
    isBookmarked: false,
    tripmateDetails: {
      destination: 'Penang, Malaysia',
      startDate: '2026-04-01',
      endDate: '2026-04-03',
      budget: 200,
      lookingFor: 'Food enthusiast to share meals and explore hawker centers together',
      participants: 1,
    },
  },
  {
    id: 'sp5',
    userId: 'u9',
    userName: 'Lisa Anderson',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    userLocation: 'New York, USA',
    location: 'Jonker Street, Melaka',
    caption: 'Melaka is a MUST visit! 🏛️ The colorful streets, amazing food, and rich history make it perfect for a day trip from KL. The chicken rice balls are to die for! Spent hours exploring antique shops on Jonker Street. Weekend night market is incredible! #Melaka #UNESCO #Heritage',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    rating: 5,
    tags: ['#Melaka', '#UNESCO', '#Heritage', '#JonkerStreet', '#Malaysia'],
    likes: 276,
    comments: 31,
    shares: 15,
    createdAt: '2026-02-21T18:50:00',
    isLiked: true,
    isBookmarked: false,
    postType: 'recommendation',
  },
];

const mockNetworkPosts: SupplierNetworkPost[] = [
  {
    id: 'np1',
    supplierId: 's2',
    supplierName: 'Rashid Ahmad',
    supplierAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    supplierRole: 'guide',
    supplierRating: 4.9,
    supplierVerified: true,
    type: 'collaboration',
    title: 'Looking for driver partner for 5-day East Coast tour',
    description: 'Hi fellow suppliers! I have a confirmed booking for 5-day East Coast tour (Kuantan-Terengganu-Kelantan) March 15-20. Looking for a reliable driver with comfortable 7-seater. Group of 6 tourists. 50/50 profit split. Must be experienced with long-distance driving.',
    referralPercentage: 50,
    createdAt: '2026-02-26T09:30:00',
    likes: 12,
    comments: 7,
    isLiked: false,
    isBookmarked: true,
    location: 'Kuala Lumpur',
    tags: ['#Collaboration', '#Driver', '#EastCoast'],
  },
  {
    id: 'np2',
    supplierId: 's8',
    supplierName: 'Fatimah Tours & Travel',
    supplierAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    supplierRole: 'activity_operator',
    supplierRating: 4.8,
    supplierVerified: true,
    type: 'overflow',
    title: 'Overbooked! Need guide for Cameron Highlands trip',
    description: 'We\'re fully booked next weekend and received 2 more bookings for Cameron Highlands (March 2-3). Looking for experienced guide to handle this group. 4 people, English speaking. All arrangements done, just need guide service. 25% referral commission. Contact me ASAP!',
    referralPercentage: 25,
    createdAt: '2026-02-26T11:15:00',
    likes: 8,
    comments: 5,
    isLiked: false,
    isBookmarked: false,
    location: 'Cameron Highlands',
    tags: ['#Overflow', '#Guide', '#Cameron'],
  },
  {
    id: 'np3',
    supplierId: 's9',
    supplierName: 'Kumar Logistics',
    supplierAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    supplierRole: 'driver',
    supplierRating: 4.7,
    supplierVerified: true,
    type: 'help_needed',
    title: 'First time organizing snorkeling tour - advice needed!',
    description: 'Hey everyone! I\'ve been a driver for 3 years, now expanding to full day tours. A client asked for Perhentian Islands snorkeling trip. Any experienced operators who can guide me? What permits do I need? Best operators to work with? Really appreciate any advice!',
    createdAt: '2026-02-26T08:45:00',
    likes: 15,
    comments: 12,
    isLiked: true,
    isBookmarked: false,
    location: 'Kuala Lumpur',
    tags: ['#Help', '#NewOperator', '#Snorkeling'],
  },
  {
    id: 'np4',
    supplierId: 's10',
    supplierName: 'Malaysia Heritage Guides',
    supplierAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    supplierRole: 'guide',
    supplierRating: 4.9,
    supplierVerified: true,
    type: 'news',
    title: '🚨 Important: New Tourism Regulations Effective March 1',
    description: 'MOTAC announced new regulations for tour operators: 1) All guides must display digital certification 2) Insurance coverage minimum RM 500K 3) Vehicle inspection every 6 months 4) Updated first aid certification required. Check MOTAC website for full details. Let\'s stay compliant!',
    createdAt: '2026-02-25T14:30:00',
    likes: 45,
    comments: 23,
    isLiked: true,
    isBookmarked: true,
    location: 'Malaysia',
    tags: ['#News', '#Regulations', '#MOTAC', '#Important'],
  },
  {
    id: 'np5',
    supplierId: 's1',
    supplierName: 'Ahmad Hassan',
    supplierAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    supplierRole: 'driver',
    supplierRating: 4.8,
    supplierVerified: true,
    type: 'pro_tip',
    title: '💡 Pro Tip: How to handle peak season bookings',
    description: 'After 10 years in the business, here\'s my advice for the upcoming peak season (June-Aug): 1) Start confirming bookings 3 months ahead 2) Set clear cancellation policies 3) Have backup vehicle/partner 4) Create package deals to maximize earnings 5) Always under-promise and over-deliver. Built my 4.8 rating following these principles!',
    createdAt: '2026-02-24T16:20:00',
    likes: 67,
    comments: 28,
    isLiked: true,
    isBookmarked: true,
    tags: ['#ProTip', '#PeakSeason', '#Business', '#Success'],
  },
  {
    id: 'np6',
    supplierId: 's11',
    supplierName: 'Penang Island Tours',
    supplierAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    supplierRole: 'activity_operator',
    supplierRating: 4.9,
    supplierVerified: true,
    type: 'update',
    title: '🎉 Milestone: 500 completed tours!',
    description: 'Grateful to announce we\'ve just completed our 500th tour! Thank you to all travelers who trusted us and fellow suppliers who\'ve collaborated. Special shoutout to drivers Ahmad, Siti, and Kumar who\'ve been with us from day one. Here\'s to the next 500! 🙏',
    createdAt: '2026-02-23T12:10:00',
    likes: 89,
    comments: 34,
    isLiked: false,
    isBookmarked: false,
    location: 'Penang',
    tags: ['#Milestone', '#Gratitude', '#Success'],
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'new_offer',
    title: 'New Offer Received',
    message: 'Ahmad Hassan sent you an offer for your KL trip - RM 280',
    link: '/traveler/trip/t2',
    read: false,
    createdAt: '2026-02-26T10:30:00',
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'new_offer',
    title: 'New Offer Received',
    message: 'Siti Aminah sent you an offer for your KL trip - RM 310',
    link: '/traveler/trip/t2',
    read: false,
    createdAt: '2026-02-26T14:15:00',
  },
  {
    id: 'n3',
    userId: 'u1',
    type: 'tripmate_request',
    title: 'Tripmate Interest',
    message: 'Someone is interested in joining your Penang food trip!',
    link: '/traveler/travel-stories',
    read: true,
    createdAt: '2026-02-25T16:20:00',
  },
];

const mockChats: Chat[] = [
  {
    id: 'c1',
    tripId: 't1',
    bookingId: 'b1',
    participants: ['u3', 's2'],
    participantNames: {
      'u3': 'Sarah Chen',
      's2': 'Rashid Ahmad',
    },
    participantAvatars: {
      'u3': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      's2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    participantRoles: {
      'u3': 'traveler',
      's2': 'guide',
    },
    lastMessage: 'Thanks for the amazing tour! Will definitely recommend.',
    lastMessageTime: '2026-02-20T16:30:00',
    unreadCount: 0,
    online: false,
  },
  {
    id: 'c2',
    tripId: 't2',
    bookingId: 'b2',
    participants: ['u1', 's1'],
    participantNames: {
      'u1': 'John Doe',
      's1': 'Ahmad Hassan',
    },
    participantAvatars: {
      'u1': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      's1': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    participantRoles: {
      'u1': 'traveler',
      's1': 'driver',
    },
    lastMessage: 'Yes, I have a car seat available. What time would you like pickup?',
    lastMessageTime: '2026-02-26T11:45:00',
    unreadCount: 2,
    online: true,
  },
];

const mockChatMessages: ChatMessage[] = [
  {
    id: 'm1',
    bookingId: 'b1',
    senderId: 'system',
    message: 'Your trip is confirmed. You can now chat with your supplier.',
    timestamp: '2026-04-10T10:00:00',
    isSystem: true,
  },
  {
    id: 'm2',
    bookingId: 'b1',
    senderId: 'u3',
    message: 'Hi Rashid, we are excited for tomorrow. Can we start at 9 AM?',
    timestamp: '2026-04-10T10:05:00',
  },
  {
    id: 'm3',
    bookingId: 'b1',
    senderId: 's2',
    message: 'Absolutely, 9 AM works. I will meet you at the hotel lobby.',
    timestamp: '2026-04-10T10:09:00',
  },
  {
    id: 'm4',
    bookingId: 'b2',
    senderId: 'system',
    message: 'Your trip is confirmed. You can now chat with your supplier.',
    timestamp: '2026-04-11T11:00:00',
    isSystem: true,
  },
  {
    id: 'm5',
    bookingId: 'b2',
    senderId: 'u1',
    message: 'Can we add one quick stop at a pharmacy?',
    timestamp: '2026-04-11T11:07:00',
  },
];

const activityBlueprints: Array<{
  title: string;
  category: Activity['category'];
  duration: number;
  price: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  requiredServices: ServiceType[];
}> = [
  { title: 'City Highlights Walk', category: 'sightseeing', duration: 150, price: 55, difficulty: 'easy', requiredServices: ['guide'] },
  { title: 'Local Street Food Route', category: 'food', duration: 180, price: 68, difficulty: 'easy', requiredServices: ['guide'] },
  { title: 'Heritage Landmark Tour', category: 'cultural', duration: 210, price: 78, difficulty: 'easy', requiredServices: ['guide'] },
  { title: 'Nature Escape Trail', category: 'nature', duration: 240, price: 84, difficulty: 'moderate', requiredServices: ['guide', 'activity_provider'] },
  { title: 'Adventure Challenge Session', category: 'adventure', duration: 210, price: 98, difficulty: 'challenging', requiredServices: ['activity_provider'] },
  { title: 'Waterfront Experience', category: 'water_sports', duration: 180, price: 102, difficulty: 'moderate', requiredServices: ['activity_provider'] },
  { title: 'Night Lights Discovery', category: 'nightlife', duration: 150, price: 72, difficulty: 'easy', requiredServices: ['guide', 'driver'] },
  { title: 'Wellness Reset Experience', category: 'wellness', duration: 120, price: 88, difficulty: 'easy', requiredServices: ['activity_provider'] },
  { title: 'Shopping District Insider Tour', category: 'shopping', duration: 180, price: 76, difficulty: 'easy', requiredServices: ['guide', 'driver'] },
  { title: 'Premium Signature Journey', category: 'sightseeing', duration: 300, price: 130, difficulty: 'moderate', requiredServices: ['driver', 'guide'] },
];

const supplierPackageUsers = mockUsers.filter((user) =>
  ['driver', 'guide', 'activity_operator'].includes(user.role)
);

const pickSupplierForCity = (cityName: string, index: number) => {
  const localSuppliers = supplierPackageUsers.filter((supplier) => supplier.operatingLocation === cityName);
  if (localSuppliers.length > 0) {
    return localSuppliers[index % localSuppliers.length];
  }

  return supplierPackageUsers[index % supplierPackageUsers.length];
};

const mockActivities: Activity[] = mockCities.flatMap((city, cityIndex) =>
  city.activities.map((activityId, activityIndex) => {
    const blueprint = activityBlueprints[activityIndex % activityBlueprints.length];
    const point = getCityPoint(city.name, cityIndex * 10 + activityIndex, city.countryCode);
    const title = `${city.name} ${blueprint.title}`;

    return {
      id: activityId,
      name: title,
      title,
      city: city.name,
      country: city.country,
      category: blueprint.category,
      description: `${title} hosted with verified local suppliers in ${city.name}, ${city.country}.`,
      images: [`https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&sig=${cityIndex * 20 + activityIndex + 1}`],
      duration: blueprint.duration,
      estimatedPrice: blueprint.price + cityIndex,
      price: blueprint.price + cityIndex,
      difficulty: blueprint.difficulty,
      servicesNeeded: blueprint.requiredServices,
      requiredServices: blueprint.requiredServices,
      groupSizeMin: activityIndex % 2 === 0 ? 1 : 2,
      groupSizeMax: 8 + (activityIndex % 6),
      maxGroupSize: 8 + (activityIndex % 6),
      highlights: ['Verified local supplier', 'Traveler favorite', 'Flexible schedule'],
      location: point,
      rating: Number((4.6 + ((activityIndex + cityIndex) % 4) * 0.1).toFixed(1)),
      reviewCount: 60 + cityIndex * 7 + activityIndex * 3,
      popularityScore: 75 + ((cityIndex + activityIndex) % 20),
      tags: [slugify(city.name), blueprint.category, 'supplier-posted'],
    };
  })
);

const mockPackages: Package[] = mockCities.map((city, cityIndex) => {
  const supplier = pickSupplierForCity(city.name, cityIndex);
  const cityActivities = mockActivities.filter((activity) => activity.city === city.name).slice(0, 3);

  const includedServices: ServiceType[] =
    supplier.role === 'driver'
      ? ['driver']
      : supplier.role === 'guide'
        ? ['guide']
        : ['activity_provider'];

  return {
    id: `pkg-${city.id}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    supplierRole: supplier.role,
    supplierRating: supplier.rating,
    supplierReviewCount: supplier.reviewCount,
    supplierAvatar: supplier.avatar,
    title: `${city.name} Supplier Experience Pack`,
    description: `Supplier-posted package in ${city.name} including curated activities for travelers.`,
    country: city.country,
    city: city.name,
    price: 220 + cityIndex * 3,
    currency: 'USD',
    duration: '1 day',
    durationUnit: 'days',
    groupSizeMin: 1,
    groupSizeMax: 10,
    category: cityActivities[0]?.category || 'sightseeing',
    difficulty: cityActivities[0]?.difficulty || 'easy',
    includedServices,
    itinerary: [
      {
        day: 1,
        title: `${city.name} curated route`,
        description: `Run by ${supplier.name} (${supplier.role.replace('_', ' ')}).`,
        activities: cityActivities.map((activity) => activity.title || activity.name),
        duration: 'full day',
      },
    ],
    included: ['Supplier coordination', 'Local insights', 'Trip support'],
    notIncluded: ['Flights', 'Personal expenses', 'Travel insurance'],
    meetingPoint: `${city.name} Central Meeting Point`,
    dropoffPoint: `${city.name} City Center`,
    images: [`https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&sig=${cityIndex + 1}`],
    requirements: 'Comfortable walking shoes and valid ID.',
    cancellationPolicy: 'Free cancellation up to 24 hours before start time.',
    highlights: ['Posted by verified supplier', 'Top city activities', 'Instant booking demo'],
    tags: [slugify(city.name), slugify(city.country), 'supplier-posted'],
    createdAt: new Date(Date.now() - cityIndex * 86400000).toISOString(),
    bookings: 12 + (cityIndex % 20),
    rating: Number((4.5 + (cityIndex % 5) * 0.1).toFixed(1)),
  };
});

const mockCitiesWithPackages: City[] = mockCities.map((city) => ({
  ...city,
  packages: mockPackages.filter((pkg) => pkg.city === city.name).map((pkg) => pkg.id),
}));

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    users: mockUsers,
    user: null,
    isAuthenticated: false,
    trips: mockTrips,
    myTrips: [],
    offers: mockOffers,
    bookings: mockBookings,
    reviews: mockReviews,
    socialPosts: mockSocialPosts,
    networkPosts: mockNetworkPosts,
    chats: mockChats,
    chatMessages: mockChatMessages,
    activeBooking: null,
    notifications: mockNotifications,
    availability: [],
    activities: mockActivities,
    tripPlan: null,
    // Global marketplace state
    countries: mockCountries,
    cities: mockCitiesWithPackages,
    packages: mockPackages,
    cart: [],
    searchQuery: '',
    selectedCity: undefined,
  });

  const login = (email: string, role: UserRole) => {
    const matchingUser = mockUsers.find((candidate) => candidate.role === role);
    const user = {
      ...(matchingUser || mockUsers[0]),
      email,
      role,
    } as User;

    const userNotifications = mockNotifications.filter((notification) => notification.userId === user.id);

    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: true,
      myTrips: role === 'traveler' 
        ? prev.trips.filter((trip) =>
            (trip.createdByRole === 'traveler' && trip.createdBy === user.id) ||
            prev.bookings.some((booking) => booking.travelerId === user.id && booking.tripId === trip.id)
          )
        : [],
      notifications: userNotifications,
    }));
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      myTrips: [],
      activeBooking: null,
      notifications: [],
    }));
  };

  const updateUser = (updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
      users: prev.user
        ? prev.users.map((candidate) =>
            candidate.id === prev.user?.id ? { ...candidate, ...updates } : candidate
          )
        : prev.users,
    }));
  };

  const createTrip = (trip: Omit<Trip, 'id' | 'createdBy' | 'status'>) => {
    const normalizedRequiredServices =
      trip.requiredServices && trip.requiredServices.length > 0
        ? trip.requiredServices
        : mapServicesToRequirements(trip.servicesNeeded || ['driver']);

    const newTrip: Trip = {
      ...trip,
      id: `t${Date.now()}`,
      createdBy: state.user?.id || 'unknown',
      status: 'open',
      requiredServices: normalizedRequiredServices,
      servicesNeeded: normalizedRequiredServices.map((service) => service.type),
    };

    setState((prev) => ({
      ...prev,
      trips: [newTrip, ...prev.trips],
      myTrips: [newTrip, ...prev.myTrips],
    }));

    // Add notification for suppliers about new trip request
    if (!trip.isPreDesigned) {
      addNotification({
        userId: 's1', // Would notify all suppliers in real app
        type: 'new_offer',
        title: 'New Trip Request',
        message: `New custom trip request in ${trip.city}`,
        link: `/supplier/trip/${newTrip.id}`,
        read: false,
      });
    }

    return newTrip.id;
  };

  const updateTripStatus = (tripId: string, status: TripStatus) => {
    setState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => (t.id === tripId ? { ...t, status } : t)),
      myTrips: prev.myTrips.map((t) => (t.id === tripId ? { ...t, status } : t)),
    }));
  };

  const createOffer = (offer: Omit<Offer, 'id' | 'createdAt'>) => {
    const trip = state.trips.find((candidate) => candidate.id === offer.tripId);
    const userServiceType = state.user ? roleToServiceType(state.user.role) : null;

    const matchedRequirement =
      trip?.requiredServices.find((requirement) => requirement.type === userServiceType) ||
      trip?.requiredServices[0];

    const midBudget =
      trip?.estimatedPriceRange
        ? (trip.estimatedPriceRange.min + trip.estimatedPriceRange.max) / 2
        : matchedRequirement?.suggestedPrice || offer.price;

    const matchScore =
      state.user && matchedRequirement
        ? calculateMatchScore(state.user, matchedRequirement, trip?.city || '', midBudget)
        : undefined;

    const minExpected = matchedRequirement?.minPrice || 0;
    const maxExpected = matchedRequirement?.maxPrice || 0;
    const isPriceMatch =
      minExpected > 0 && maxExpected > 0
        ? offer.price < minExpected
          ? 'good'
          : offer.price > maxExpected
            ? 'high'
            : 'fair'
        : offer.isPriceMatch;

    const newOffer: Offer = {
      ...offer,
      id: `o${Date.now()}`,
      createdAt: new Date().toISOString(),
      matchScore,
      isPriceMatch,
    };

    setState((prev) => ({
      ...prev,
      offers: [newOffer, ...prev.offers],
    }));

    updateTripStatus(offer.tripId, 'negotiating');

    // Update trip offer count
    setState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => 
        t.id === offer.tripId 
          ? { ...t, offerCount: (t.offerCount || 0) + 1 }
          : t
      ),
    }));

    // Notify traveler
    const tripForNotification = state.trips.find((t) => t.id === offer.tripId);
    if (tripForNotification) {
      addNotification({
        userId: tripForNotification.createdBy,
        type: 'new_offer',
        title: 'New Offer Received',
        message: `${offer.supplierName} sent you an offer for RM ${offer.price}`,
        link: `/traveler/trip/${offer.tripId}`,
        read: false,
      });
    }
  };

  const acceptOffer = (offerId: string) => {
    const offer = state.offers.find((o) => o.id === offerId);
    
    setState((prev) => ({
      ...prev,
      offers: prev.offers.map((o) =>
        o.id === offerId ? { ...o, status: 'accepted' as const } : o
      ),
    }));

    if (offer) {
      updateTripStatus(offer.tripId, 'price_locked');
      
      // Notify supplier
      addNotification({
        userId: offer.supplierId,
        type: 'offer_accepted',
        title: 'Offer Accepted! 🎉',
        message: `Your offer for RM ${offer.price} has been accepted`,
        link: `/supplier/trip/${offer.tripId}`,
        read: false,
      });
    }
  };

  const declineOffer = (offerId: string) => {
    const offer = state.offers.find((o) => o.id === offerId);
    
    setState((prev) => ({
      ...prev,
      offers: prev.offers.map((o) =>
        o.id === offerId ? { ...o, status: 'declined' as const } : o
      ),
    }));

    if (offer) {
      addNotification({
        userId: offer.supplierId,
        type: 'offer_declined',
        title: 'Offer Declined',
        message: `Your offer for RM ${offer.price} was declined`,
        link: `/supplier/trip/${offer.tripId}`,
        read: false,
      });
    }
  };

  const counterOffer = (originalOfferId: string, newPrice: number, notes: string) => {
    const originalOffer = state.offers.find((o) => o.id === originalOfferId);
    if (!originalOffer || originalOffer.round >= 3) return;

    setState((prev) => ({
      ...prev,
      offers: prev.offers.map((o) =>
        o.id === originalOfferId ? { ...o, status: 'countered' as const } : o
      ),
    }));

    const counterOfferData: Offer = {
      id: `o${Date.now()}`,
      tripId: originalOffer.tripId,
      supplierId: originalOffer.supplierId,
      supplierName: originalOffer.supplierName,
      supplierRole: originalOffer.supplierRole,
      supplierAvatar: originalOffer.supplierAvatar,
      supplierRating: originalOffer.supplierRating,
      supplierReviewCount: originalOffer.supplierReviewCount,
      supplierVerified: originalOffer.supplierVerified,
      price: newPrice,
      notes,
      validUntil: originalOffer.validUntil,
      createdAt: new Date().toISOString(),
      round: originalOffer.round + 1,
      status: 'pending',
    };

    setState((prev) => ({
      ...prev,
      offers: [counterOfferData, ...prev.offers],
    }));

    // Notify supplier
    addNotification({
      userId: originalOffer.supplierId,
      type: 'counter_offer',
      title: 'Counter Offer Received',
      message: `New counter offer: RM ${newPrice} (Round ${counterOfferData.round})`,
      link: `/supplier/trip/${originalOffer.tripId}`,
      read: false,
    });
  };

  const createBooking = (tripId: string, offerId: string, paymentMethod: 'full' | 'deposit') => {
    const trip = state.trips.find((t) => t.id === tripId);
    const offer = state.offers.find((o) => o.id === offerId);
    if (!trip || !offer) return;

    const finalPrice = offer.price;
    const platformFeeRate = 0.12;
    const platformFee = roundPrice(finalPrice * platformFeeRate);
    const escrowAmount = roundPrice(finalPrice + platformFee);
    const depositAmount = finalPrice;
    const commission = platformFee;
    const supplierPayout = finalPrice;

    const bookingId = `b${Date.now()}`;

    const booking: Booking = {
      id: bookingId,
      tripId,
      trip,
      travelerId: state.user?.id || '',
      supplierId: offer.supplierId,
      finalPrice,
      depositAmount,
      depositPaid: true,
      fullPayment: true,
      escrowHeld: escrowAmount,
      commission,
      supplierPayout,
      platformFee,
      platformFeeRate,
      escrowAmount,
      payoutToSupplier: supplierPayout,
      bookingDate: new Date().toISOString(),
      paymentMethod,
      cancellationPolicy: {
        moreThan24h: 100,
        between10And24h: 50,
        lessThan10h: 0,
      },
      trackingEnabled: false,
    };

    setState((prev) => ({
      ...prev,
      bookings: [booking, ...prev.bookings],
    }));

    updateTripStatus(tripId, 'booked');

    // Create chat
    const chat: Chat = {
      id: `c${Date.now()}`,
      tripId,
      bookingId,
      participants: [state.user?.id || '', offer.supplierId],
      participantNames: {
        [state.user?.id || '']: state.user?.name || '',
        [offer.supplierId]: offer.supplierName,
      },
      participantAvatars: {
        [state.user?.id || '']: state.user?.avatar || '',
        [offer.supplierId]: offer.supplierAvatar || '',
      },
      participantRoles: {
        [state.user?.id || '']: 'traveler',
        [offer.supplierId]: offer.supplierRole,
      },
      lastMessage: 'Booking confirmed! Looking forward to the trip.',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      online: true,
    };

    const bookingSystemMessage: ChatMessage = {
      id: `m${Date.now()}`,
      bookingId,
      senderId: 'system',
      message: 'Your trip is confirmed. You can now chat with your supplier.',
      timestamp: new Date().toISOString(),
      isSystem: true,
    };

    setState((prev) => ({
      ...prev,
      chats: [chat, ...prev.chats],
      chatMessages: [bookingSystemMessage, ...prev.chatMessages],
    }));

    // Notify both parties
    addNotification({
      userId: state.user?.id || '',
      type: 'booking_confirmed',
      title: 'Booking Confirmed! 🎉',
      message: `Your trip with ${offer.supplierName} is confirmed`,
      link: `/traveler/my-trips`,
      read: false,
    });

    addNotification({
      userId: offer.supplierId,
      type: 'booking_confirmed',
      title: 'New Booking! 🎉',
      message: `You have a new booking for RM ${finalPrice}`,
      link: `/supplier/bookings`,
      read: false,
    });
  };

  const startTrip = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking) {
      updateTripStatus(booking.tripId, 'started');
      setState((prev) => ({
        ...prev,
        activeBooking: { ...booking, trackingEnabled: true },
        bookings: prev.bookings.map((b) =>
          b.id === bookingId ? { ...b, trackingEnabled: true } : b
        ),
      }));

      // Notify traveler
      addNotification({
        userId: booking.travelerId,
        type: 'trip_started',
        title: 'Trip Started',
        message: 'Your trip has begun. Have a great experience!',
        link: `/traveler/active-trip/${bookingId}`,
        read: false,
      });

      const tripStartSystemMessage: ChatMessage = {
        id: `m${Date.now()}`,
        bookingId,
        senderId: 'system',
        message: 'Driver on the way',
        timestamp: new Date().toISOString(),
        isSystem: true,
      };

      setState((prev) => ({
        ...prev,
        chatMessages: [tripStartSystemMessage, ...prev.chatMessages],
      }));
    }
  };

  const completeTrip = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking) {
      updateTripStatus(booking.tripId, 'completed');
      setState((prev) => ({
        ...prev,
        activeBooking: null,
      }));

      // Notify both parties
      addNotification({
        userId: booking.travelerId,
        type: 'trip_completed',
        title: 'Trip Completed',
        message: 'Please leave a review for your experience',
        link: `/traveler/review/${booking.tripId}/${bookingId}`,
        read: false,
      });

      addNotification({
        userId: booking.supplierId,
        type: 'payment_received',
        title: 'Payment Released',
        message: `RM ${booking.payoutToSupplier || booking.supplierPayout} has been released to your account`,
        link: `/supplier/dashboard`,
        read: false,
      });
    }
  };

  const submitReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
    }));

    updateTripStatus(review.tripId, 'reviewed');

    // Notify supplier
    addNotification({
      userId: review.reviewedUserId,
      type: 'new_review',
      title: 'New Review Received',
      message: `You received a ${review.serviceRating}-star review`,
      link: `/supplier/profile`,
      read: false,
    });
  };

  const createSocialPost = (post: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'isLiked'>) => {
    const newPost: SocialPost = {
      ...post,
      id: `sp${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
    };

    setState((prev) => ({
      ...prev,
      socialPosts: [newPost, ...prev.socialPosts],
    }));
  };

  const createNetworkPost = (post: Omit<SupplierNetworkPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'isLiked'>) => {
    const newPost: SupplierNetworkPost = {
      ...post,
      id: `np${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
    };

    setState((prev) => ({
      ...prev,
      networkPosts: [newPost, ...prev.networkPosts],
    }));
  };

  const cancelBooking = (bookingId: string) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (booking) {
      updateTripStatus(booking.tripId, 'cancelled');
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.filter((b) => b.id !== bookingId),
      }));
    }
  };

  const cancelTrip = (tripId: string) => {
    // Cancel the trip
    setState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === tripId ? { ...t, status: 'cancelled' as TripStatus } : t
      ),
      myTrips: prev.myTrips.map((t) =>
        t.id === tripId ? { ...t, status: 'cancelled' as TripStatus } : t
      ),
      // Cancel all offers for this trip
      offers: prev.offers.map((o) =>
        o.tripId === tripId ? { ...o, status: 'declined' as const } : o
      ),
      // Cancel any bookings for this trip
      bookings: prev.bookings.filter((b) => b.tripId !== tripId),
    }));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
    }));
  };

  const togglePostLike = (postId: string, isNetwork: boolean) => {
    if (isNetwork) {
      setState((prev) => ({
        ...prev,
        networkPosts: prev.networkPosts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        ),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        socialPosts: prev.socialPosts.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        ),
      }));
    }
  };

  const togglePostBookmark = (postId: string, isNetwork: boolean) => {
    if (isNetwork) {
      setState((prev) => ({
        ...prev,
        networkPosts: prev.networkPosts.map((p) =>
          p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
        ),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        socialPosts: prev.socialPosts.map((p) =>
          p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
        ),
      }));
    }
  };

  const updateAvailability = (availability: Availability) => {
    setState((prev) => ({
      ...prev,
      availability: prev.availability.find((a) => a.id === availability.id)
        ? prev.availability.map((a) => (a.id === availability.id ? availability : a))
        : [...prev.availability, availability],
    }));
  };

  const addActivityToPlan = (activity: Activity) => {
    setState((prev) => {
      const plan = prev.tripPlan ?? {
        id: `tp-${Date.now()}`,
        userId: prev.user?.id || 'u1',
        city: activity.city,
        selectedActivities: [],
        selectedServices: [],
        totalEstimatedCost: 0,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
      };

      if (plan.selectedActivities.some((a) => a.id === activity.id)) {
        return prev;
      }

      const selectedActivities = [...plan.selectedActivities, activity];
      const selectedServices = Array.from(
        new Set([...(plan.selectedServices || []), ...selectedActivities.flatMap((item) => item.servicesNeeded)])
      );

      return {
        ...prev,
        tripPlan: {
          ...plan,
          city: plan.city || activity.city,
          selectedActivities,
          selectedServices,
          totalEstimatedCost: selectedActivities.reduce((sum, item) => sum + item.estimatedPrice, 0),
        },
      };
    });
  };

  const removeActivityFromPlan = (activityId: string) => {
    setState((prev) => {
      if (!prev.tripPlan) return prev;
      const selectedActivities = prev.tripPlan.selectedActivities.filter((a) => a.id !== activityId);
      return {
        ...prev,
        tripPlan: {
          ...prev.tripPlan,
          selectedActivities,
          totalEstimatedCost: selectedActivities.reduce((sum, item) => sum + item.estimatedPrice, 0),
        },
      };
    });
  };

  const createTripPlan = (city: string) => {
    setState((prev) => ({
      ...prev,
      tripPlan: {
        id: `tp-${Date.now()}`,
        userId: prev.user?.id || 'u1',
        city,
        selectedActivities: [],
        selectedServices: [],
        totalEstimatedCost: 0,
        status: 'draft',
        createdAt: new Date().toISOString(),
      },
    }));
  };

  const updateTripPlan = (updates: Partial<TripPlan>) => {
    setState((prev) => ({
      ...prev,
      tripPlan: prev.tripPlan
        ? {
            ...prev.tripPlan,
            ...updates,
          }
        : prev.tripPlan,
    }));
  };

  const publishTripRequest = (tripPlan: TripPlan, numberOfPeople: number, notes: string) => {
    const totalDurationMinutes = tripPlan.selectedActivities.reduce((sum, item) => sum + item.duration, 0);
    const durationDays = Math.max(1, Math.ceil(totalDurationMinutes / 480));
    const startDate = tripPlan.tripDate || new Date().toISOString().slice(0, 10);
    const endDate = startDate;
    const selectedServices = tripPlan.selectedServices?.length
      ? tripPlan.selectedServices
      : Array.from(new Set(tripPlan.selectedActivities.flatMap((a) => a.servicesNeeded)));

    const requiredServices: TripServiceRequirement[] =
      tripPlan.requiredServices && tripPlan.requiredServices.length > 0
        ? tripPlan.requiredServices.map(withPricingGuidance)
        : selectedServices.map((service) => {
            if (service === 'translator' && tripPlan.translatorRequirement) {
              return withPricingGuidance({
                type: 'translator',
                translatorDetails: {
                  fromLanguage: tripPlan.translatorRequirement.fromLanguage,
                  toLanguage: tripPlan.translatorRequirement.toLanguage,
                  context: 'tourism',
                  durationHours: 4,
                  groupType: 'family',
                },
                details: {
                  fromLanguage: tripPlan.translatorRequirement.fromLanguage,
                  toLanguage: tripPlan.translatorRequirement.toLanguage,
                },
              });
            }

            return withPricingGuidance({ type: service });
          });

    const totalSuggestedPrice = requiredServices.reduce(
      (sum, requirement) => sum + (requirement.suggestedPrice || 0),
      0
    );
    const totalMinPrice = requiredServices.reduce((sum, requirement) => sum + (requirement.minPrice || 0), 0);
    const totalMaxPrice = requiredServices.reduce((sum, requirement) => sum + (requirement.maxPrice || 0), 0);

    const newTrip: Trip = {
      id: `t${Date.now()}`,
      title: `Custom Trip to ${tripPlan.city}`,
      city: tripPlan.city,
      startDate,
      endDate,
      duration: durationDays,
      stops: tripPlan.selectedActivities.map(a => ({
        id: a.id,
        name: a.name,
        duration: a.duration,
        location: a.location,
      })),
      requiredServices: requiredServices.length > 0 ? requiredServices : [{ type: 'driver' }],
      serviceRequests: (requiredServices.length > 0 ? requiredServices : [{ type: 'driver' }]).map((service) => {
        const serviceType = service.type === 'activity_provider' ? 'activity_operator' : service.type;

        if (service.type === 'translator') {
          return {
            serviceType,
            details: {
              from: service.translatorDetails?.fromLanguage || service.details?.fromLanguage,
              to: service.translatorDetails?.toLanguage || service.details?.toLanguage,
              durationHours: service.translatorDetails?.durationHours,
              context: service.translatorDetails?.context,
            },
          };
        }

        if (service.type === 'driver') {
          return {
            serviceType,
            details: {
              pickup: service.driverDetails?.pickupLocation,
              dropoff: service.driverDetails?.dropoffLocation,
              tripType: service.driverDetails?.tripType,
              stops: service.driverDetails?.stops,
              passengers: service.driverDetails?.passengers,
              vehicle: service.driverDetails?.vehicleType,
            },
          };
        }

        if (service.type === 'guide') {
          return {
            serviceType,
            details: {
              places: service.guideDetails?.places,
              duration: service.guideDetails?.duration,
              language: service.guideDetails?.language,
              groupSize: service.guideDetails?.groupSize,
              style: service.guideDetails?.experienceStyle,
            },
          };
        }

        return {
          serviceType,
          details: {
            activity: service.activityDetails?.activityName,
            type: service.activityDetails?.activityCategory,
            level: service.activityDetails?.skillLevel,
            location: service.activityDetails?.location,
            duration: service.activityDetails?.duration,
          },
        };
      }),
      servicesNeeded: (requiredServices.length > 0 ? requiredServices : [{ type: 'driver' }]).map((service) => service.type),
      groupSize: numberOfPeople,
      notes: [
        notes,
        tripPlan.pickupLocation ? `Pickup: ${tripPlan.pickupLocation}` : '',
        tripPlan.dropoffLocation ? `Drop-off: ${tripPlan.dropoffLocation}` : '',
      ].filter(Boolean).join(' | '),
      status: 'open',
      createdBy: state.user?.id || 'unknown',
      createdByRole: 'traveler',
      isPreDesigned: false,
      isNegotiable: true,
      estimatedPriceRange: {
        min: Math.max(50, Math.floor(totalMinPrice || (tripPlan.estimatedBudget || tripPlan.totalEstimatedCost || 250) * 0.8)),
        max: Math.max(100, Math.ceil(totalMaxPrice || (tripPlan.estimatedBudget || tripPlan.totalEstimatedCost || 350) * 1.2)),
      },
      offerCount: 0,
      fixedPrice: totalSuggestedPrice || undefined,
    };

    setState((prev) => ({
      ...prev,
      trips: [newTrip, ...prev.trips],
      myTrips: [newTrip, ...prev.myTrips],
    }));

    addNotification({
      userId: 's1',
      type: 'new_offer',
      title: 'New Trip Request',
      message: `New custom trip request in ${tripPlan.city}`,
      link: `/supplier/trip/${newTrip.id}`,
      read: false,
    });

    setState((prev) => {
      const targetBudget =
        (newTrip.estimatedPriceRange?.min && newTrip.estimatedPriceRange?.max)
          ? (newTrip.estimatedPriceRange.min + newTrip.estimatedPriceRange.max) / 2
          : 0;

      const rankedMatches = prev.users
        .filter((candidate) => candidate.role !== 'traveler')
        .map((candidate) => {
          const city = (candidate.operatingLocation || candidate.location || '').toLowerCase().trim();
          const exactCityMatch = city === tripPlan.city.toLowerCase().trim();
          if (!exactCityMatch) return null;

          let bestScore = -1;
          for (const required of requiredServices) {
            const roleService = roleToServiceType(candidate.role);
            if (roleService !== required.type) continue;

            if (required.type === 'translator') {
              const fromLanguage = required.translatorDetails?.fromLanguage || required.details?.fromLanguage;
              const toLanguage = required.translatorDetails?.toLanguage || required.details?.toLanguage;
              if (fromLanguage && toLanguage) {
                const canTranslate = (candidate.languages || []).some(
                  (pair) => pair.from === fromLanguage && pair.to === toLanguage
                );
                if (!canTranslate) continue;
              }
            }

            if (required.type === 'activity_provider' && required.activityDetails?.activityCategory) {
              const supportedTypes = candidate.activityTypes || [];
              if (supportedTypes.length > 0 && !supportedTypes.includes(required.activityDetails.activityCategory)) {
                continue;
              }
            }

            const score = calculateMatchScore(candidate, required, tripPlan.city, targetBudget);
            if (score > bestScore) bestScore = score;
          }

          if (bestScore < 0) return null;
          return { id: candidate.id, score: bestScore, name: candidate.name };
        })
        .filter((item): item is { id: string; score: number; name: string } => Boolean(item))
        .sort((a, b) => b.score - a.score);

      if (rankedMatches.length === 0) {
        return prev;
      }

      const translatorRequest = requiredServices.find((service) => service.type === 'translator');
      const translatorFrom = translatorRequest?.translatorDetails?.fromLanguage || translatorRequest?.details?.fromLanguage;
      const translatorTo = translatorRequest?.translatorDetails?.toLanguage || translatorRequest?.details?.toLanguage;

      const supplierNotifications = rankedMatches.map((match, index) => ({
        id: `n-auto-${Date.now()}-${index}`,
        userId: match.id,
        type: 'new_offer' as const,
        title: 'Matching Request Available',
        message:
          translatorFrom && translatorTo
            ? `New translator request: ${translatorFrom} -> ${translatorTo}`
            : `New request in ${tripPlan.city} matches your service type (score: ${match.score})`,
        link: `/supplier/trip/${newTrip.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      }));

      return {
        ...prev,
        notifications: [...supplierNotifications, ...prev.notifications],
      };
    });

    return newTrip.id;
  };

  const clearTripPlan = () => {
    setState((prev) => ({
      ...prev,
      tripPlan: null,
    }));
  };

  const sendChatMessage = (bookingId: string, message: string) => {
    const trimmed = message.trim();
    if (!trimmed || !state.user) return;

    const targetChat = state.chats.find(
      (chat) => chat.bookingId === bookingId && chat.participants.includes(state.user?.id || '')
    );
    if (!targetChat) return;

    const chatMessage: ChatMessage = {
      id: `m${Date.now()}`,
      bookingId,
      senderId: state.user.id,
      message: trimmed,
      timestamp: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      chatMessages: [chatMessage, ...prev.chatMessages],
      chats: prev.chats.map((chat) =>
        chat.id === targetChat.id
          ? {
              ...chat,
              lastMessage: trimmed,
              lastMessageTime: chatMessage.timestamp,
              unreadCount: chat.unreadCount + 1,
            }
          : chat
      ),
    }));
  };

  // Marketplace methods (Parts 4-7)
  const searchPackages = (query: string): Package[] => {
    if (!query.trim()) return state.packages;
    const lower = query.toLowerCase();
    return state.packages.filter(
      (pkg) =>
        pkg.title.toLowerCase().includes(lower) ||
        pkg.description.toLowerCase().includes(lower) ||
        pkg.city.toLowerCase().includes(lower) ||
        pkg.tags?.some((tag) => tag.toLowerCase().includes(lower))
    );
  };

  const searchActivities = (query: string): Activity[] => {
    if (!query.trim()) return state.activities;
    const lower = query.toLowerCase();
    return state.activities.filter(
      (act) =>
        act.title.toLowerCase().includes(lower) ||
        act.location.toLowerCase().includes(lower) ||
        act.description?.toLowerCase().includes(lower)
    );
  };

  const createPackage = (packageData: Omit<Package, 'id' | 'createdAt'>) => {
    // Role-based permission: Translators cannot create packages
    if (state.user?.role === 'translator') {
      throw new Error('Translators cannot create packages. Please use the "My Services" section to offer translation services.');
    }

    // Only Driver, Tour Guide, and Activity Operator can create packages
    if (!['driver', 'guide', 'activity_provider'].includes(state.user?.role || '')) {
      throw new Error('Only drivers, tour guides, and activity operators can create packages.');
    }

    const newPackage: Package = {
      ...packageData,
      id: `pkg${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      packages: [newPackage, ...prev.packages],
      cities: prev.cities.map((city) =>
        city.country === packageData.country && city.name === packageData.city
          ? { ...city, packages: [newPackage.id, ...city.packages] }
          : city
      ),
    }));

    addNotification({
      userId: packageData.supplierId,
      type: 'new_offer',
      title: 'Package Created',
      message: `Your package "${packageData.title}" is now live!`,
      link: '/supplier/packages',
      read: false,
    });
  };

  const addToCart = (packageId: string, quantity: number, date?: string) => {
    const pkg = state.packages.find((p) => p.id === packageId);
    if (!pkg) return;

    const cartItemId = `cart${Date.now()}`;
    const cartItem: CartItem = {
      id: cartItemId,
      packageId,
      package: pkg,
      quantity,
      selectedDate: date,
      addedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      cart: [cartItem, ...prev.cart],
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.id !== cartItemId),
    }));
  };

  const clearCart = () => {
    setState((prev) => ({
      ...prev,
      cart: [],
    }));
  };

  const getCartTotal = (): number => {
    return state.cart.reduce((total, item) => total + item.package.price * item.quantity, 0);
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, bookingStatus: status } : booking
      ),
    }));
  };

  const setCityFilter = (city: string) => {
    setState((prev) => ({
      ...prev,
      selectedCity: city,
    }));
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
    }));
  };

  const getSupplierPackages = (supplierId: string): Package[] => {
    return state.packages.filter((pkg) => pkg.supplierId === supplierId);
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
        createTrip,
        updateTripStatus,
        createOffer,
        acceptOffer,
        declineOffer,
        counterOffer,
        createBooking,
        startTrip,
        completeTrip,
        submitReview,
        createSocialPost,
        createNetworkPost,
        cancelBooking,
        cancelTrip,
        markNotificationAsRead,
        addNotification,
        togglePostLike,
        togglePostBookmark,
        updateAvailability,
        addActivityToPlan,
        removeActivityFromPlan,
        createTripPlan,
        updateTripPlan,
        publishTripRequest,
        clearTripPlan,
        sendChatMessage,
        // New marketplace methods
        searchPackages,
        searchActivities,
        createPackage,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        updateBookingStatus,
        setCityFilter,
        setSearchQuery,
        getSupplierPackages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}