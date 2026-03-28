// Core Types for TripuLike Marketplace

export type UserRole = 'traveler' | 'driver' | 'guide' | 'translator' | 'activity_operator';

export type ServiceType = 'driver' | 'guide' | 'translator' | 'activity_provider';

export type ActivityCategory = 
  | 'sightseeing'
  | 'adventure'
  | 'cultural'
  | 'food'
  | 'nature'
  | 'water_sports'
  | 'shopping'
  | 'nightlife'
  | 'wellness';

export type TripStatus = 
  | 'draft'
  | 'open'
  | 'negotiating'
  | 'price_locked'
  | 'booked'
  | 'started'
  | 'completed'
  | 'cancelled'
  | 'reviewed';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type NotificationType = 
  | 'new_offer'
  | 'offer_accepted'
  | 'offer_declined'
  | 'counter_offer'
  | 'booking_confirmed'
  | 'trip_starting_soon'
  | 'trip_started'
  | 'trip_completed'
  | 'payment_received'
  | 'new_review'
  | 'verification_approved'
  | 'verification_rejected'
  | 'new_message'
  | 'tripmate_request'
  | 'tripmate_joined';

export type NetworkPostType = 
  | 'collaboration' 
  | 'help_needed' 
  | 'news' 
  | 'pro_tip' 
  | 'update'
  | 'overflow';

export type PaymentMethod = 'full' | 'deposit';

export interface LanguagePair {
  from: string;
  to: string;
}

export interface TripServiceRequirement {
  type: ServiceType;
  serviceDate?: string;
  startTime?: string;
  estimatedDurationHours?: number;
  location?: string;
  notes?: string;
  groupSize?: number;
  suggestedPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  driverDetails?: {
    tripType: 'hourly' | 'half_day' | 'full_day' | 'airport';
    pickupLocation: string;
    dropoffLocation: string;
    stops: Array<{
      name: string;
      type: 'attraction' | 'restaurant' | 'shopping' | 'custom';
      estimatedDuration: '30_mins' | '1_hour' | '2_hours' | 'flexible';
    }>;
    startTime: string;
    passengers: number;
    vehicleType: 'economy' | 'suv' | 'luxury' | 'van';
    luggage: 'none' | 'light' | 'medium' | 'heavy';
    specialNotes?: string;
  };
  translatorDetails?: {
    fromLanguage: string;
    toLanguage: string;
    context: 'tourism' | 'business' | 'shopping' | 'medical' | 'event' | 'other';
    durationHours: number;
    groupType: 'solo' | 'family' | 'business';
  };
  guideDetails?: {
    pickupLocation?: string;
    dropoffLocation?: string;
    duration: 'half_day' | 'full_day' | 'custom';
    durationHours?: number;
    places: Array<{
      name: string;
      type?: 'suggestion' | 'custom';
    }>;
    tourType: 'cultural' | 'food' | 'adventure' | 'nature' | 'city_highlights' | 'custom';
    groupSize: number;
    language: string;
    experienceStyle: 'relaxed' | 'balanced' | 'fast_paced';
    notes?: string;
  };
  activityDetails?: {
    activityCategory: 'water' | 'outdoor' | 'indoor' | 'wellness' | 'family';
    activityName: string;
    location: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    minGroupSize: number;
    maxGroupSize: number;
    duration: '1-2h' | 'half_day' | 'full_day';
    equipmentIncluded: 'yes' | 'no' | 'partial';
    safetyRequirements?: string;
    notes?: string;
  };
  // Legacy translator support for existing records
  details?: {
    fromLanguage?: string;
    toLanguage?: string;
  };
}

export interface ServiceRequest {
  serviceType: 'driver' | 'guide' | 'translator' | 'activity_operator' | 'activity_provider';
  details: Record<string, unknown>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  verificationStatus: VerificationStatus;
  verificationRejectionReason?: string;
  reviewCount: number;
  rating: number;
  completedTrips: number;
  joinedDate: string;
  operatingLocation?: string;
  serviceType?: ServiceType;
  licenseNumber?: string;
  vehicleInfo?: {
    type: string;
    model: string;
    plateNumber: string;
  };
  guideSpecialties?: string[];
  languages?: LanguagePair[];
  activityTypes?: string[];
  location?: string;
  specialties?: string[];
  bio?: string;
  // Basic info for travelers and suppliers
  basicInfo?: {
    fullName: string;
    phone: string;
    email: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Availability {
  id: string;
  supplierId: string;
  date: string;
  timeSlots: {
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
  maxBookings: number;
  currentBookings: number;
}

export interface Stop {
  id: string;
  name: string;
  duration: number; // minutes
  location: { lat: number; lng: number };
}

export interface Trip {
  id: string;
  title?: string;
  city: string;
  startDate: string;
  endDate: string;
  duration: number; // days
  stops: Stop[];
  requiredServices: TripServiceRequirement[];
  serviceRequests?: ServiceRequest[];
  servicesNeeded?: ServiceType[];
  groupSize: number;
  notes: string;
  status: TripStatus;
  createdBy: string; // user id
  createdByRole: UserRole;
  isPreDesigned: boolean; // true if supplier created
  fixedPrice?: number;
  isNegotiable: boolean;
  capacity?: number; // for pre-designed trips
  description?: string;
  featuredImage?: string;
  inclusions?: string[];
  exclusions?: string[];
  highlights?: string[];
  difficulty?: 'easy' | 'moderate' | 'challenging';
  minAge?: number;
  categories?: string[];
  estimatedPriceRange?: { min: number; max: number };
  offerCount?: number;
  isTripmate?: boolean; // for finding tripmates
  currentParticipants?: number;
  maxParticipants?: number;
  // Timing and scheduling
  suggestedTiming?: {
    stopId: string;
    duration: number; // minutes to spend at this stop
  }[];
}

export interface Offer {
  id: string;
  tripId: string;
  supplierId: string;
  supplierName: string;
  supplierRole: UserRole;
  supplierAvatar?: string;
  supplierRating: number;
  supplierReviewCount: number;
  supplierVerified: boolean;
  price: number;
  notes: string;
  validUntil: string;
  createdAt: string;
  round: number; // negotiation round
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  isPriceMatch?: 'good' | 'fair' | 'high'; // compared to market price
  matchScore?: number;
}

export type BookingStatus = 
  | 'pending'
  | 'accepted'
  | 'paid'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  tripId: string;
  trip: Trip;
  travelerId: string;
  supplierId: string;
  finalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  fullPayment: boolean;
  escrowHeld: number;
  commission: number;
  supplierPayout: number;
  platformFee?: number;
  platformFeeRate?: number;
  escrowAmount?: number;
  payoutToSupplier?: number;
  bookingDate: string;
  paymentMethod: PaymentMethod;
  bookingStatus?: BookingStatus;
  cancellationPolicy: {
    moreThan24h: number;
    between10And24h: number;
    lessThan10h: number;
  };
  trackingEnabled?: boolean;
  currentLocation?: { lat: number; lng: number };
  // Trip tracking and timing
  tripStartedAt?: string;
  currentStopIndex?: number;
  stopTracking?: StopTrackingInfo[];
  tripEvents?: TripEvent[];
  // Cancellation
  cancellationReason?: string;
  cancelledAt?: string;
  cancellationFee?: number;
}

export interface Review {
  id: string;
  tripId: string;
  bookingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewedUserId: string;
  serviceRating: number;
  safetyRating: number;
  communicationRating: number;
  comment: string;
  createdAt: string;
  helpful?: number;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;
  tripId?: string;
  supplierId?: string;
  supplierName?: string;
  location: string;
  caption: string;
  images: string[];
  rating?: number;
  tags?: string[];
  likes: number;
  comments: number;
  shares?: number;
  createdAt: string;
  isLiked: boolean;
  isBookmarked?: boolean;
  postType?: 'experience' | 'tripmate' | 'recommendation';
  tripmateDetails?: {
    destination: string;
    startDate: string;
    endDate: string;
    budget?: number;
    lookingFor: string;
    participants?: number;
  };
}

export interface SupplierNetworkPost {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierAvatar?: string;
  supplierRole: UserRole;
  supplierRating: number;
  supplierVerified: boolean;
  type: NetworkPostType;
  title: string;
  description: string;
  referralPercentage?: number;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  location?: string;
  tags?: string[];
}

export interface Chat {
  id: string;
  tripId: string;
  bookingId?: string;
  participants: string[];
  participantNames?: { [userId: string]: string };
  participantAvatars?: { [userId: string]: string };
  participantRoles?: { [userId: string]: UserRole };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read?: boolean;
}

export interface Emergency {
  id: string;
  tripId: string;
  bookingId: string;
  reportedBy: string;
  reportedAt: string;
  location: { lat: number; lng: number };
  snapshot: string;
  status: 'active' | 'resolved';
  description?: string;
}

// New: Activity/Place for discovery
export interface Activity {
  id: string;
  name: string;
  title?: string;
  city: string;
  country?: string;
  category: ActivityCategory;
  description: string;
  images: string[];
  duration: number; // minutes
  estimatedPrice: number;
  price?: number;
  entranceFee?: number;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  minAge?: number;
  groupSizeMin?: number;
  groupSizeMax?: number;
  maxGroupSize?: number;
  requiredServices?: ServiceType[];
  servicesNeeded: ServiceType[];
  highlights: string[];
  location: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  popularityScore: number;
  operatingHours?: string;
  bestTimeToVisit?: string;
  whatToBring?: string[];
  tags: string[];
}

// New: Trip Plan (shopping cart for selected activities)
export interface TripPlan {
  id: string;
  userId: string;
  requestTitle?: string;
  city: string;
  country: string;
  selectedActivities: Activity[];
  selectedPackages: Package[];
  selectedServices?: ServiceType[];
  requiredServices?: TripServiceRequirement[];
  customRequests?: TripServiceRequirement[];
  translatorRequirement?: {
    fromLanguage: string;
    toLanguage: string;
  };
  prefilledTranslatorId?: string;
  tripDate?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  estimatedBudget?: number;
  totalEstimatedCost: number;
  status: 'draft' | 'published';
  createdAt: string;
}

// Trip tracking and timing events
export type TripEventType = 'trip_started' | 'arrived_at_stop' | 'dropped_off' | 'picked_up' | 'completed_stop' | 'trip_completed' | 'trip_cancelled';

export interface TripEvent {
  id: string;
  eventType: TripEventType;
  stopIndex?: number;
  stopName?: string;
  timestamp: string;
  location?: { lat: number; lng: number };
  supplierId: string;
  supplierName: string;
  notes?: string;
}

export interface StopTrackingInfo {
  stopId: string;
  stopIndex: number;
  stopName: string;
  suggestedDuration: number; // minutes
  scheduledArrivalTime?: string;
  actualArrivalTime?: string;
  droppedOffAt?: string;
  pickedUpAt?: string;
  timeSpentMinutes?: number;
  status: 'pending' | 'arrived' | 'dropped_off' | 'in_progress' | 'completed';
}

// Global destination system (Part 3)
export interface Country {
  code: string;
  name: string;
  flag: string;
  cities: string[]; // city IDs
  description?: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  description?: string;
  activities: string[]; // activity IDs
  packages: string[]; // package IDs (supplier-created)
  bestTime?: string;
  highlights?: string[];
  image?: string;
}

// Supplier-created packages (Part 5) - Enhanced for traveler-grade experiences
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  duration: string; // "4 hours", "full day", etc.
}

export interface Package {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierRole: UserRole;
  supplierRating: number;
  supplierReviewCount: number;
  supplierAvatar?: string;
  
  // Basic Info
  title: string;
  description: string;
  
  // Location (Global System)
  country: string;
  city: string;
  
  // Pricing & Duration
  price: number;
  currency?: string;
  duration: string; // "2 hours", "3 days", etc.
  durationUnit?: 'hours' | 'days';
  
  // Group Size
  groupSizeMin: number;
  groupSizeMax: number;
  
  // Classification
  category: ActivityCategory | 'multi_service';
  difficulty?: 'easy' | 'moderate' | 'challenging';
  
  // Services Included
  includedServices: ServiceType[];
  
  // Rich Itinerary (Day-based)
  itinerary: ItineraryDay[];
  
  // What's Included/Not Included
  included: string[];
  notIncluded: string[];
  
  // Meeting & Drop-off Points
  meetingPoint: string;
  dropoffPoint: string;
  
  // Media
  images?: string[];
  
  // Additional Info
  requirements?: string;
  cancellationPolicy?: string;
  highlights?: string[];
  tags?: string[];
  
  // Metadata
  createdAt: string;
  bookings?: number;
  rating?: number;
  reviews?: Review[];
}

// Cart item for trip planning (Part 7)
export interface CartItem {
  id: string;
  packageId: string;
  package: Package;
  quantity: number;
  selectedDate?: string;
  addedAt: string;
}

export interface StopTrackingInfo {
  stopId: string;
  stopIndex: number;
  stopName: string;
  suggestedDuration: number; // minutes
  scheduledArrivalTime?: string;
  actualArrivalTime?: string;
  droppedOffAt?: string;
  pickedUpAt?: string;
  timeSpentMinutes?: number;
  status: 'pending' | 'arrived' | 'dropped_off' | 'in_progress' | 'completed';
}

export interface AppState {
  users: User[];
  user: User | null;
  isAuthenticated: boolean;
  trips: Trip[];
  myTrips: Trip[];
  offers: Offer[];
  bookings: Booking[];
  reviews: Review[];
  socialPosts: SocialPost[];
  networkPosts: SupplierNetworkPost[];
  chats: Chat[];
  chatMessages: ChatMessage[];
  activeBooking: Booking | null;
  notifications: Notification[];
  availability: Availability[];
  activities: Activity[];
  tripPlan: TripPlan | null;
  // Global destination system
  countries: Country[];
  cities: City[];
  // Supplier packages
  packages: Package[];
  // Cart system
  cart: CartItem[];
  searchQuery: string;
  selectedCity?: string;
}