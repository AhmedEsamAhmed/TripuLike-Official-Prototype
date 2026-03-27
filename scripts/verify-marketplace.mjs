import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const contextPath = resolve(process.cwd(), 'src/app/context/AppContext.tsx');
const chatsPath = resolve(process.cwd(), 'src/app/screens/shared/Chats.tsx');
const typesPath = resolve(process.cwd(), 'src/app/types.ts');

const contextSource = readFileSync(contextPath, 'utf8');
const chatsSource = readFileSync(chatsPath, 'utf8');
const typesSource = readFileSync(typesPath, 'utf8');

const checks = [
  {
    name: 'matching-weights-location-service',
    test: /if \(cityMatch\) score \+= 40;[\s\S]*if \(serviceMatch\) score \+= 30;/.test(contextSource),
    details: 'Expected location +40 and service +30 weighting in calculateMatchScore.',
  },
  {
    name: 'matching-weights-rating-experience-pricefit',
    test: /score \+= Math\.min\(supplier\.rating \* 3, 15\);[\s\S]*score \+= Math\.min\(supplier\.reviewCount \/ 10, 10\);[\s\S]*const priceFit = Math\.max\(0, 5 \* \(1 - deltaRatio\)\);/.test(contextSource),
    details: 'Expected rating <=15, experience <=10, and price-fit <=5 scoring terms.',
  },
  {
    name: 'publish-flow-ranks-matches',
    test: /const rankedMatches = prev\.users[\s\S]*\.sort\(\(a, b\) => b\.score - a\.score\);/.test(contextSource),
    details: 'Expected ranked supplier matching sort in publishTripRequest.',
  },
  {
    name: 'pricing-guidance-fields',
    test: /const withPricingGuidance = \(requirement: TripServiceRequirement\): TripServiceRequirement => \{[\s\S]*suggestedPrice:[\s\S]*minPrice:[\s\S]*maxPrice:/.test(contextSource),
    details: 'Expected suggestedPrice/minPrice/maxPrice assignment in withPricingGuidance.',
  },
  {
    name: 'offer-enrichment-matchscore-pricefit',
    test: /const createOffer = \(offer: Omit<Offer, 'id' \| 'createdAt'>\) => \{[\s\S]*const matchScore =[\s\S]*const isPriceMatch =[\s\S]*matchScore,[\s\S]*isPriceMatch,/.test(contextSource),
    details: 'Expected createOffer to store matchScore and isPriceMatch.',
  },
  {
    name: 'booking-escrow-fields',
    test: /const createBooking = \(tripId: string, offerId: string, paymentMethod: 'full' \| 'deposit'\) => \{[\s\S]*platformFeeRate = 0\.12;[\s\S]*const platformFee =[\s\S]*const escrowAmount =[\s\S]*escrowAmount,[\s\S]*payoutToSupplier: supplierPayout,/.test(contextSource),
    details: 'Expected escrow and payout fields in createBooking.',
  },
  {
    name: 'system-message-booking-confirmed',
    test: /Your trip is confirmed\. You can now chat with your supplier\./.test(contextSource),
    details: 'Expected booking confirmation system message.',
  },
  {
    name: 'system-message-driver-on-the-way',
    test: /message: 'Driver on the way'/.test(contextSource),
    details: 'Expected trip start system message.',
  },
  {
    name: 'chat-send-action-wired',
    test: /const sendChatMessage = \(bookingId: string, message: string\) => \{[\s\S]*chatMessages: \[chatMessage, \.\.\.prev\.chatMessages\]/.test(contextSource),
    details: 'Expected sendChatMessage state update.',
  },
  {
    name: 'chat-screen-uses-booking-thread',
    test: /const \{ user, chats, chatMessages, sendChatMessage \} = useApp\(\);[\s\S]*message\.bookingId === selectedChat\.bookingId/.test(chatsSource),
    details: 'Expected booking-linked threaded chat UI usage.',
  },
  {
    name: 'seed-driver-negotiation-scenario',
    test: /\{ tripId: 't2',[\s\S]*roundPrices: \[290, 270, 275\]/.test(contextSource),
    details: 'Expected seeded driver negotiation scenario for t2.',
  },
  {
    name: 'seed-activity-scenario',
    test: /\{ tripId: 't3',[\s\S]*supplierRole: 'activity_operator'/.test(contextSource),
    details: 'Expected seeded activity booking scenario for t3.',
  },
  {
    name: 'seed-multi-service-trip',
    test: /id: 't3',[\s\S]*serviceType: 'activity_operator',[\s\S]*serviceType: 'driver'/.test(contextSource),
    details: 'Expected seeded multi-service trip with activity_operator and driver services.',
  },
  // New marketplace feature checks (Part 3, 4, 5, 7)
  {
    name: 'global-destination-countries-type',
    test: /export interface Country[\s\S]*code: string;[\s\S]*name: string;[\s\S]*cities: string\[\];/.test(typesSource),
    details: 'Expected Country type with code, name, cities for global destination system.',
  },
  {
    name: 'global-destination-cities-type',
    test: /export interface City[\s\S]*id: string;[\s\S]*name: string;[\s\S]*country: string;[\s\S]*activities: string\[\];[\s\S]*packages: string\[\];/.test(typesSource),
    details: 'Expected City type with id, name, country, activities, packages for global destination system.',
  },
  {
    name: 'package-type-for-suppliers',
    test: (() => {
      const hasPackageInterface = /export interface Package/.test(typesSource);
      const hasSupplierId = /supplierId: string/.test(typesSource);
      const hasTitle = /title: string/.test(typesSource);
      const hasCity = /city: string/.test(typesSource);
      const hasCountry = /country: string/.test(typesSource);
      const hasPrice = /price: number/.test(typesSource);
      const hasMeetingPoint = /meetingPoint: string/.test(typesSource);
      const hasDropoffPoint = /dropoffPoint: string/.test(typesSource);
      const hasItinerary = /itinerary: ItineraryDay\[\]/.test(typesSource);
      return hasPackageInterface && hasSupplierId && hasTitle && hasCity && hasCountry && hasPrice && hasMeetingPoint && hasDropoffPoint && hasItinerary;
    })(),
    details: 'Expected Package type with supplier fields, enhanced itinerary (day-based), meetingPoint, dropoffPoint for supplier-created packages.',
  },
  {
    name: 'itinerary-day-structure',
    test: /export interface ItineraryDay[\s\S]*day: number;[\s\S]*title: string;[\s\S]*description: string;[\s\S]*activities: string\[\];[\s\S]*duration: string;/.test(typesSource),
    details: 'Expected ItineraryDay interface with day-based structure (day, title, description, activities, duration).',
  },
  {
    name: 'booking-status-lifecycle',
    test: /export type BookingStatus[\s\S]*'pending'[\s\S]*'accepted'[\s\S]*'paid'[\s\S]*'confirmed'[\s\S]*'active'[\s\S]*'completed'/.test(typesSource),
    details: 'Expected full BookingStatus lifecycle type.',
  },
  {
    name: 'cart-item-type',
    test: /export interface CartItem[\s\S]*packageId: string;[\s\S]*package: Package;[\s\S]*quantity: number;/.test(typesSource),
    details: 'Expected CartItem type for cart system.',
  },
  {
    name: 'appstate-marketplace-fields',
    test: /countries: Country\[\];[\s\S]*cities: City\[\];[\s\S]*packages: Package\[\];[\s\S]*cart: CartItem\[\];/.test(typesSource),
    details: 'Expected AppState to include countries, cities, packages, cart fields.',
  },
  {
    name: 'mock-countries-seed-data',
    test: /const mockCountries: Country\[\] = \[[\s\S]*MY[\s\S]*Malaysia[\s\S]*TH[\s\S]*Thailand/.test(contextSource),
    details: 'Expected seed data for countries in global destination system.',
  },
  {
    name: 'mock-cities-seed-data',
    test: /const mockCities: City\[\] = \[[\s\S]*kl-city[\s\S]*Kuala Lumpur[\s\S]*bangkok-city[\s\S]*Bangkok/.test(contextSource),
    details: 'Expected seed data for cities in global destination system.',
  },
  {
    name: 'search-packages-method',
    test: /const searchPackages = \(query: string\): Package\[\]/.test(contextSource),
    details: 'Expected searchPackages method for package search functionality.',
  },
  {
    name: 'create-package-method',
    test: /const createPackage = \(packageData: Omit<Package, 'id' \| 'createdAt'>\)/.test(contextSource),
    details: 'Expected createPackage method for supplier package creation.',
  },
  {
    name: 'cart-management-methods',
    test: /const addToCart = \(packageId: string, quantity: number[\s\S]*const removeFromCart = \(cartItemId: string[\s\S]*const clearCart = \(\) => \{[\s\S]*const getCartTotal = \(\): number/.test(contextSource),
    details: 'Expected cart management methods (add, remove, clear, total).',
  },
  {
    name: 'supplier-packages-retrieval',
    test: /const getSupplierPackages = \(supplierId: string\): Package\[\]/.test(contextSource),
    details: 'Expected getSupplierPackages method for supplier to view their packages.',
  },
];

const failed = checks.filter((check) => !check.test);

if (failed.length > 0) {
  console.error('\nMarketplace verification failed.\n');
  for (const failure of failed) {
    console.error(`- ${failure.name}: ${failure.details}`);
  }
  console.error(`\nSummary: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}

console.log('Marketplace verification passed.');
console.log(`Summary: ${checks.length}/${checks.length} checks passed.`);
