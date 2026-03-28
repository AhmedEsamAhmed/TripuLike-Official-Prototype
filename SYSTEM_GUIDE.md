# TripuLike Marketplace - Complete System Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [TRAVELER SIDE](#traveler-side)
4. [SUPPLIER SIDE](#supplier-side)
5. [Core Data Models](#core-data-models)
6. [Key Workflows](#key-workflows)
7. [Permissions Matrix](#permissions-matrix)

---

## System Overview

**TripuLike** is a two-sided marketplace connecting **Travelers (demand)** with **Suppliers (supply)** to create and book customized travel experiences.

### Core Value Proposition
- **Travelers**: Browse destinations, plan custom trips, request specific services (driver, guide, translator, activities), upload requests to suppliers
- **Suppliers**: Create travel packages, respond to traveler requests with offers, manage bookings and active trips

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **State Management**: React Context (AppContext)
- **Routing**: React Router
- **Data**: Mock seed data (14 countries, 140+ cities seeded)

---

## User Roles & Permissions

### 5 User Roles in System

```
┌─────────────────────────────────────────────────────┐
│ TRAVELER           │ SUPPLIER ROLES                 │
├────────────────────┼────────────────────────────────┤
│ - Traveler         │ - Driver                       │
└────────────────────┼────────────────────────────────┤
│                    │ - Tour Guide (Guide)           │
│                    ├────────────────────────────────┤
│                    │ - Translator                   │
│                    ├────────────────────────────────┤
│                    │ - Activity Operator            │
└────────────────────┴────────────────────────────────┘
```

### User Authentication
- **Login**: Email + Role selection
- **Routes Gated**: `/traveler/*` restricted to travelers, `/supplier/*` restricted to suppliers
- **Navigation Bottom Bar**: Shows role-specific menu

---

## TRAVELER SIDE

### 🎯 Traveler User Journey

#### 1. **Home / Destination Discovery** (`/traveler/home`)
```
TRAVELER VIEWS:
├─ Destination Filter Panel
│  ├─ Select Country (dropdown)
│  ├─ Select City (cascading dropdown, populated from selected country)
│  └─ "Plan This Destination" button → initiates trip planning
│
├─ Trip Planning Cart (Live Summary)
│  ├─ Shows current destination
│  ├─ Activities/Places Added (count)
│  ├─ Estimated Cost (sum of activity prices)
│  ├─ "Add Places & Activities" button → Go to DiscoverActivities
│  └─ "Upload Request" button → Go to TripPlan
│
├─ Package Sections
│  ├─ 🔥 Popular (top-rated packages from suppliers)
│  ├─ 🌍 Explore by Destination (packages in selected city)
│  ├─ 💡 Recommended for You (packages matching traveler interests)
│  ├─ ✨ New (recently added packages)
│  └─ 🎯 Activities (individual activities per destination)
│
└─ Search Bar
   └─ Real-time search across: package title, description, city, country
```

**Seed Data**: 4 packages per city × 140+ cities = 560+ packages available

#### 2. **Destination Activity Discovery** (`/traveler/discover/:cityId`)
```
TRAVELER ACTIONS:
├─ Browse Activities by City
│  ├─ Display: 18 activities per city
│  ├─ Filter by Category:
│  │  ├─ Sightseeing
│  │  ├─ Adventure
│  │  ├─ Cultural
│  │  ├─ Food
│  │  ├─ Nature
│  │  ├─ Water Sports
│  │  └─ Shopping, Nightlife, Wellness
│  │
│  └─ Activity Info Card:
│     ├─ Activity name & description
│     ├─ Duration (minutes)
│     ├─ Price (RM)
│     ├─ Rating & review count
│     ├─ Difficulty level (Easy/Moderate/Challenging)
│     └─ Highlights
│
├─ Add Activity to Cart
│  ├─ Click "Add" button → adds to TripPlan.selectedActivities
│  ├─ Creates TripPlan if not exists
│  └─ Shows cart count in header
│
└─ Navigation
   ├─ Floating Cart Badge (shows item count)
   ├─ "Checkout My Trip (X)" button at bottom when items exist
   └─ Back to browse or go to TripPlan
```

**Data**: 18 activities × 140+ cities = 2,520+ activities

#### 3. **Activity Details** (`/traveler/activity/:activityId`)
```
TRAVELER VIEWS:
├─ Activity Full Details
│  ├─ Name & Description
│  ├─ Image gallery
│  ├─ Duration, Price, Rating
│  ├─ Difficulty & Group Size
│  ├─ Services Included
│  ├─ Location & Map coords
│  ├─ Supplier posted by (verification badge)
│  ├─ Required Services (driver, guide, etc.)
│  └─ Highlights & Tags
│
└─ Actions
   ├─ "Add to Trip Plan" → adds to cart, shows confirmation
   ├─ "View More Activities" → back to DiscoverActivities
   └─ Cart count updated
```

#### 4. **Package Details** (`/traveler/package/:packageId`)
```
TRAVELER VIEWS:
├─ Supplier Package Full Details
│  ├─ Title & Description
│  ├─ Image carousel
│  ├─ Supplier Profile
│  │  ├─ Name, avatar, rating, review count
│  │  ├─ Verification badge
│  │  └─ Contact info
│  │
│  ├─ Pricing & Duration
│  │  ├─ Price per person
│  │  ├─ Duration (2 hours, 3 days, etc.)
│  │  ├─ Group size range (1-10 people)
│  │  └─ Currency (USD/RM)
│  │
│  ├─ Day-by-Day Itinerary
│  │  ├─ Day 1: Title, Description, Activities list
│  │  ├─ Day 2: [same structure]
│  │  └─ Day N: [continues for package duration]
│  │
│  ├─ What's Included / Not Included
│  │  ├─ Included: [list of services]
│  │  └─ Not Included: [list of exclusions]
│  │
│  ├─ Logistics
│  │  ├─ Meeting Point
│  │  ├─ Drop-off Point
│  │  ├─ Requirements (physical fitness, ID, etc.)
│  │  └─ Cancellation Policy
│  │
│  └─ Category & Difficulty
│     ├─ Category (sightseeing, adventure, food, etc.)
│     └─ Difficulty level
│
└─ Actions
   ├─ "Add to Cart" → adds package to cart
   ├─ "View Trip Plan" → go to /traveler/trip-plan
   └─ Multi-day packages available
```

#### 5. **Trip Planning Cart** (`/traveler/trip-plan`)
```
TRAVELER FLOW (3-Step Process):

STEP 1: SELECT SERVICES NEEDED
├─ Checkboxes for each service type
│  ├─ Driver (transportation)
│  ├─ Guide (tour expertise)
│  ├─ Translator (language)
│  └─ Activity Operator (experiences)
│
├─ Basic Trip Info
│  ├─ City
│  ├─ Trip Date (minimum: today)
│  ├─ Start Time
│  ├─ Estimated Duration (hours)
│  ├─ Number of People
│  └─ Budget (RM)
│
└─ Trip Summary
   ├─ Activities Added (list with X remove option)
   ├─ Total Activity Cost
   ├─ Total Duration
   └─ "Add More Activities" link

STEP 2: CONFIGURE EACH SERVICE
(User configures based on selected services)

   ▶ DRIVER Configuration:
     ├─ Trip Type: Hourly, Half-day, Full-day, Airport Transfer
     ├─ Pickup Location
     ├─ Drop-off Location
     ├─ Multi-Stop Builder (add stops with names & durations)
     ├─ Vehicle Preference (economy, SUV, luxury, van)
     ├─ Passengers & Luggage amount
     └─ Special Notes (wheelchair, child seat, etc.)

   ▶ GUIDE Configuration:
     ├─ Duration: Half-day, Full-day, Custom hours
     ├─ Tour Type: Cultural, Food, Adventure, Nature, City Highlights
     ├─ Places to Visit (suggestions + custom input)
     ├─ Pickup & Drop-off (optional)
     ├─ Group Size
     ├─ Language Preference
     ├─ Experience Style (relaxed, balanced, fast-paced)
     └─ Notes for guide

   ▶ TRANSLATOR Configuration:
     ├─ From Language (English, Mandarin, Arabic, Malay, etc.)
     ├─ To Language
     ├─ Context (tourism, business, shopping, medical, event)
     ├─ Duration (hours)
     └─ Group Type (solo, family, business)

   ▶ ACTIVITY Configuration:
     ├─ Activity Type (water, outdoor, indoor, wellness, family)
     ├─ Activity Name (dynamic list based on type)
     ├─ Location
     ├─ Skill Level (beginner, intermediate, advanced)
     ├─ Group Size (min/max)
     ├─ Duration (1-2h, half-day, full-day)
     ├─ Equipment Included? (yes, no, partial)
     ├─ Safety Requirements
     └─ Additional Notes

STEP 3: PUBLISH REQUEST TO SUPPLIERS
├─ Validation Checks:
│  ├─ At least one service selected
│  ├─ Trip date populated
│  ├─ Budget entered & > 0
│  └─ Service-specific required fields filled
│
├─ On "Publish Request":
│  ├─ Creates Trip object with status = "open"
│  ├─ Generates Trip ID
│  ├─ Sends notifications to matching suppliers
│  ├─ Adds to traveler's "My Trips"
│  └─ Redirects to /traveler/booking-management
│
└─ Suppliers receive notification for matching services
```

#### 6. **My Trips & Booking Management** (`/traveler/my-trips`, `/traveler/booking-management`)
```
TRAVELER VIEWS:
├─ Active Trips
│  ├─ Trips with status: booked, started
│  ├─ Card shows: destination, date, services, supplier
│  ├─ "View Details" → trip details
│  └─ "Track Live" → active trip tracking
│
├─ Pending Offers
│  ├─ Trips awaiting supplier responses
│  ├─ Offer list shows: supplier, proposed price, validity
│  ├─ Actions:
│  │  ├─ Accept Offer → creates Booking, moves to Active
│  │  ├─ Decline Offer → removes offer
│  │  ├─ Counter Offer → negotiate price
│  │  └─ Chat with Supplier
│  │
│  └─ Offer Details:
│     ├─ Supplier info (name, rating, verification)
│     ├─ Proposed Price & Validity
│     ├─ Notes from supplier
│     └─ Match Score (market price comparison)
│
├─ Completed Trips
│  ├─ Trips with status: completed, reviewed
│  ├─ "Leave Review" button (if not reviewed)
│  └─ "View Trip Summary" button
│
└─ Trip Requests In Progress
   └─ Awaiting first offer (status = "open", "negotiating")
```

#### 7. **Active Trip Tracking** (`/traveler/active-trip/:bookingId`)
```
TRAVELER VIEWS:
├─ Real-Time Trip Status
│  ├─ Current Location (map pin)
│  ├─ Driver/Guide/Movement (live)
│  ├─ Next Stop (upcoming)
│  ├─ Time to Arrival (ETA)
│  ├─ Current Stop Details
│  ├─ Estimated Remaining Time
│  └─ Safety Features:
│     ├─ Emergency Contact to Supplier
│     ├─ Trip Share (share location with family)
│     └─ Verification: "You're with [Supplier Name]"
│
└─ Actions
   ├─ Pass Through trip stops sequentially
   ├─ Mark as "Arrived at Stop"
   ├─ Communication: Chat with supplier
   └─ Upon completion: Mark trip complete
```

#### 8. **Trip Review** (`/traveler/review/:tripId/:bookingId`)
```
TRAVELER ACTIONS:
├─ Rate Experience:
│  ├─ Service Quality Rating (1-5 stars)
│  ├─ Safety Rating (1-5 stars)
│  ├─ Communication Rating (1-5 stars)
│  └─ Written Comment (optional)
│
├─ Review Data:
│  ├─ Posted to supplier's profile
│  ├─ Contributes to supplier rating calculation
│  ├─ Visible to other travelers browsing supplier
│  └─ Impacts supplier ranking in "match score"
│
└─ After Review:
   ├─ Trip marked as "reviewed"
   ├─ Notification sent to supplier
   └─ Traveler can view past trips
```

#### 9. **Travel Stories** (`/traveler/stories`)
```
TRAVELER FEATURES:
├─ Social Timeline
│  ├─ Share trip photos & experiences
│  ├─ Post caption, location, date
│  ├─ Tag tripmate (other travelers)
│  ├─ Like & comment on other travelers' posts
│  └─ View trending travel posts
│
└─ Discoverable Content
   ├─ Inspire other travelers
   ├─ Social proof for destinations
   └─ Community engagement
```

---

## SUPPLIER SIDE

### 🏢 Supplier User Journey

#### 1. **Verification** (`/supplier/verification`)
```
SUPPLIER PROCESS:
├─ Documents Upload:
│  ├─ Government ID
│  ├─ License (based on role):
│  │  ├─ Drivers: License Number, Vehicle Plate
│  │  ├─ Guides: Qualifications, Specialties
│  │  ├─ Translators: Certifications, Languages
│  │  └─ Activity Operators: Insurance, Permits
│  │
│  └─ Verification Status: pending → verified (or rejected)
│
└─ Requirement:
   ├─ Must be verified before accepting bookings
   ├─ If rejected, can resubmit with corrections
   └─ Rejection reason provided in notification
```

#### 2. **Supplier Dashboard** (`/supplier/dashboard`)
```
SUPPLIER METRICS:
├─ Quick Stats
│  ├─ Completed Trips
│  ├─ Total Earnings
│  ├─ Cancellations
│  ├─ Average Rating
│  └─ Review Count
│
├─ Active & Upcoming
│  ├─ Today's bookings
│  ├─ Next 7 days trips
│  ├─ Pending offers awaiting traveler response
│  └─ New requests for my services
│
└─ Notifications
   ├─ New trip request matching my services
   ├─ Traveler accepted offer
   ├─ Trip review posted
   ├─ Verification status update
   └─ Message from traveler
```

#### 3. **Package Creation** (`/supplier/create-package`)
```
SUPPLIER ROLE REQUIREMENTS:
├─ Eligible Roles:
│  ├─ Driver ✅
│  ├─ Guide (Tour Guide) ✅
│  ├─ Activity Operator ✅
│  └─ Translator ❌ (redirected to /supplier/services)
│
PACKAGE CREATION FORM (11 Sections):

SECTION 1: Basic Info
├─ Package Title
├─ Description (what's included, highlights)
└─ Category (sightseeing, adventure, food, etc.)

SECTION 2: Destination
├─ Country (dropdown)
├─ City (cascading dropdown from country)
└─ Package instantly linked to city

SECTION 3: Pricing & Group Size
├─ Price per person
├─ Currency (USD, RM, etc.)
├─ Min Group Size (default 1)
├─ Max Group Size (default 10)
└─ Price includes/excludes noted below

SECTION 4: Services Included
├─ Checkboxes:
│  ├─ Driver transportation
│  ├─ Tour guide (narration/insights)
│  ├─ Activity activities)
│  ├─ Meal inclusions
│  └─ Other services
│
└─ Determines which services supplier provides

SECTION 5: Day-by-Day Itinerary Builder
├─ Add/Remove Days (multi-day packages available)
├─ Per Day:
│  ├─ Title (e.g., "Day 1: City Highlights")
│  ├─ Description (what happens)
│  ├─ Activities List (activities done that day)
│  └─ Duration (e.g., "8 hours", "full day")
│
└─ Example: 3-day package has Day 1, 2, 3 itineraries

SECTION 6: What's Included
├─ Add list of inclusions:
│  ├─ "Professional guide"
│  ├─ "All transport"
│  ├─ "2 meals"
│  └─ [custom items]
│
└─ Traveler sees what's provided

SECTION 7: What's NOT Included
├─ Add list of exclusions:
│  ├─ "International flights"
│  ├─ "Travel insurance"
│  ├─ "Personal expenses"
│  └─ [custom items]
│
└─ Traveler sees what's NOT provided

SECTION 8: Meeting & Drop-off Points
├─ Meeting Point (e.g., "Hotel Lobby, 9:00 AM")
├─ Drop-off Point (e.g., "City Center")
└─ Flexibility options

SECTION 9: Package Images
├─ Upload/Add image URLs (multiple)
├─ First image = package card thumbnail
├─ Gallery shows on package details page
└─ Recommended: 4-6 high-quality images

SECTION 10: Requirements & Difficulty
├─ Physical Requirements (fitness level)
├─ Age Restrictions (if any)
├─ Skill Level (beginner, intermediate, advanced)
├─ What to bring (packing list)
└─ Health/Allergy considerations

SECTION 11: Cancellation Policy
├─ Refund terms:
│  ├─ More than 24h before: X% refund
│  ├─ 10-24 hours: X% refund
│  ├─ Less than 10h: X% refund
│  └─ Non-refundable deposits
│
└─ Displayed to travelers before booking

SUBMISSION:
├─ All sections validated
├─ On Submit:
│  ├─ Creates Package entry
│  ├─ Linked to city automatically
│  ├─ Appears in traveler marketplace immediately
│  ├─ Shows in "New" section for 7 days
│  └─ Supplier gets notification confirmation
```

**Result**: Package appears in `/traveler/home`, searchable, browsable by city, available for cart/booking

#### 4. **Supplier Packages** (`/supplier/packages`)
```
SUPPLIER VIEWS OWN PACKAGES:
├─ Package List:
│  ├─ All packages created by this supplier
│  ├─ Sort by: Date Created, Rating, Bookings
│  ├─ Filter by: Status (active, archived)
│  └─ Statistics per package:
│     ├─ Total bookings
│     ├─ Average rating
│     ├─ Views (impressions)
│     └─ Conversion rate
│
├─ Actions Per Package:
│  ├─ Edit (modify details, pricing, itinerary)
│  ├─ Deactivate (temporarily remove from market)
│  ├─ Analytics (view booking trends)
│  ├─ Duplicate (create similar package faster)
│  └─ Delete (remove permanently)
│
└─ Booking Requests for Packages:
   ├─ Traveler adds package to cart
   ├─ Traveler can "Customize" by selecting from package options
   └─ Supplier sees booking as upcoming trip
```

#### 5. **Responding to Trip Requests** (`/supplier/operations`)
```
SUPPLIER WORKFLOW FOR TRIP REQUESTS:

RECEIVE REQUEST:
├─ Notification: "New trip request for [Service] in [City]"
├─ Request Details:
│  ├─ Traveler info (name, rating, reviews)
│  ├─ Trip Services Needed (driver, guide, translator, activity)
│  ├─ Destinations & Stops
│  ├─ Trip Date & Duration
│  ├─ Estimated Budget
│  ├─ Traveler Notes & Preferences
│  └─ Group Size & Composition
│
└─ Supplier Reviews:
   ├─ Whether I can fulfill this request
   ├─ Cost-benefit analysis
   └─ Schedule availability

RESPOND WITH OFFER:
├─ Create Offer:
│  ├─ Proposed Price (negotiate from suggested)
│  ├─ Validity (when offer expires)
│  ├─ Notes (confirm availability, special terms, etc.)
│  ├─ Detailed Itinerary (show how I'll execute)
│  └─ Proposed Timeline (when I can start, completion time)
│
└─ On Submit:
   ├─ Offer sent to traveler
   ├─ Notification to traveler: "[Supplier] offered [Price] for your trip"
   ├─ Offer appears in traveler's "Pending Offers"
   ├─ Supplier can see offer status (pending, accepted, declined, countered)
   └─ Round-trip negotiation possible

TRAVELER RESPONSE:
├─ Accept → Creates Booking (status = "confirmed")
├─ Decline → Offer rejected
├─ Counter → Suggests different price
│  ├─ Supplier sees counter offer
│  ├─ Can accept, decline, or counter-counter
│  └─ Negotiation rounds possible
│
└─ Communication:
   ├─ Chat window opens between supplier & traveler
   ├─ Can clarify requirements, dates, special requests
   ├─ Chat history visible to both sides
   └─ Secure messaging platform

BOOKING CONFIRMED:
├─ Supplier status: "Trip Confirmed"
├─ Booking.status = "confirmed"
├─ Payment processing begins (deposit or full)
├─ Supplier sees traveler contact information
├─ Trip appears in "Active Trips"
└─ Pre-trip communication & coordination
```

#### 6. **Availability Management** (`/supplier/availability`)
```
SUPPLIER CALENDAR:
├─ Set Available Time Slots:
│  ├─ Select dates/times
│  ├─ Set max bookings per time slot
│  ├─ Block out unavailable times
│  └─ Set buffer times between trips
│
├─ Recurring Availability:
│  ├─ Mon-Fri: 8 AM - 6 PM
│  ├─ Saturday: 8 AM - 10 PM
│  ├─ Sunday: Off
│  └─ Public holidays: Off
│
└─ Benefits:
   ├─ Travelers see real-time availability
   ├─ Automatic conflict prevention
   ├─ Manageable workload
   └─ Realistic offer proposals
```

#### 7. **Active Trip Management** (`/supplier/active-trip/:bookingId`)
```
SUPPLIER DURING TRIP:
├─ Pre-Trip (24h before):
│  ├─ Final confirmation with traveler
│  ├─ reconfirm arrival time & location
│  ├─ Exchange phone numbers
│  ├─ Discuss any last-minute changes
│  └─ Check traveler requirements
│
├─ Trip Execution:
│  ├─ Start trip → Mark status "active"
│  ├─ Real-time Location Tracking:
│  │  ├─ Share GPS location with traveler
│  │  ├─ Show ETA to next stop
│  │  ├─ Log arrivals at checkpoints
│  │  └─ Document actual times vs planned
│  │
│  ├─ Trip Events Logged:
│  │  ├─ Trip Started (location, time)
│  │  ├─ Arrived at Stop (stop name, time, duration)
│  │  ├─ Picked Up/Dropped Off passengers
│  │  ├─ Completed Stop (notes)
│  │  └─ Trip Completed (final location, time)
│  │
│  ├─ Communication:
│  │  ├─ Chat with traveler in real-time
│  │  ├─ Share updates/photos during trip
│  │  ├─ Report issues immediately
│  │  └─ Emergency contact protocol
│  │
│  └─ Payment Processing:
│     ├─ Upon completion, platform processes:
│     ├─ Travel deposit collected (if booking deposit)
│     ├─ Full payment collected (if not already paid)
│     ├─ Platform fee deducted (~20%)
│     ├─ Supplier payout calculated
│     └─ Funds transferred to supplier account

POST-TRIP:
├─ Mark trip completed
├─ Traveler receives completion notification
├─ 24h window for traveler to leave review
├─ Rating impacts supplier rank
└─ Booking status = "completed" then "reviewed"
```

#### 8. **Earnings & Payouts**
```
SUPPLIER FINANCIAL:
├─ Earnings Dashboard:
│  ├─ Total Earnings (cumulative)
│  ├─ Pending Payouts (awaiting transfer)
│  ├─ Monthly Breakdown (earnings per month)
│  ├─ Per-Trip Details:
│  │  ├─ Booking amount
│  │  ├─ Platform fee (typically 15-20%)
│  │  ├─ Net earnings (after fees)
│  │  └─ Status (pending, paid, processing)
│  │
│  └─ Payment Methods:
│     ├─ Bank Transfer
│     ├─ E-Wallet (PayPal, etc.)
│     └─ Schedule (weekly, bi-weekly, monthly)
│
└─ Transparency:
   └─ All fees, deductions, and payouts clearly itemized
```

#### 9. **Supplier Network** (`/supplier/network`)
```
SUPPLIER COMMUNITY:
├─ Network Feed:
│  ├─ Posts from other suppliers
│  ├─ Collaboration opportunities
│  ├─ Help requests (need translator, driver, etc.)
│  ├─ Pro tips & industry news
│  └─ Success stories
│
├─ Post Types:
│  ├─ Collaboration: "Looking for guide for December packages"
│  ├─ Help Needed: "Urgent: need 2 drivers for tomorrow"
│  ├─ News: "New regulations for activity operators"
│  ├─ Pro Tips: "How to increase booking conversion"
│  └─ Updates: "Seasonal demand analysis"
│
├─ Actions:
│  ├─ Like & Comment on posts
│  ├─ Direct message other suppliers
│  ├─ Form partnerships or sub-contracting
│  ├─ Share resources and best practices
│  └─ Build reputation in community
│
└─ Benefits:
   ├─ Outsource services I can't provide
   ├─ Find reliable sub-contractors
   ├─ Learn from experienced suppliers
   └─ Create multi-service offerings
```

#### 10. **Analytics & Insights** (`/supplier/operations`)
```
SUPPLIER METRICS:
├─ Performance:
│  ├─ Completion Rate (trips completed / trips accepted)
│  ├─ Cancellation Rate (cancellations / total bookings)
│  ├─ Average Response Time (how quickly I reply to offers)
│  ├─ Booking Conversion (offers accepted / offers sent)
│  └─ Repeat Customer Rate (% of travelers who rebook)
│
├─ Revenue Metrics:
│  ├─ Total Revenue (all time earnings)
│  ├─ Average per Trip (earnings / completed trips)
│  ├─ Revenue Trend (monthly revenue growth)
│  ├─ Seasonal Demand (peaks and troughs)
│  └─ Peak Service (which service generates most revenue)
│
├─ Customer Satisfaction:
│  ├─ Average Rating (weighted by recency)
│  ├─ Review Count & Sentiment
│  ├─ Common Praise (top comments in reviews)
│  ├─ Common Issues (negatives to address)
│  └─ NPS Score (Net Promoter Score)
│
└─ Market Insights:
   ├─ Competitor pricing for same services
   ├─ Demand trends in my city/services
   ├─ Seasonal pricing adjustments
   ├─ Peak demand periods
   └─ Underserved niches
```

---

## Core Data Models

### 1. User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  
  // Role-specific data
  role: 'traveler' | 'driver' | 'guide' | 'translator' | 'activity_operator';
  
  // Verification & Trust
  verificationStatus: 'pending' | 'verified' | 'rejected';
  reviewCount: number;
  rating: number; // 1-5 stars
  completedTrips: number;
  
  // Avatar & Profile
  avatar?: string;
  
  // Supplier-specific fields
  operatingLocation?: string; // City operating in
  serviceType?: ServiceType;
  specialties?: string[]; // skills/expertise
  bio?: string;
  
  // Payment/Payout
  payoutDetails?: {
    bankAccount?: string;
    paymentMethod: 'bank_transfer' | 'e_wallet';
  };
}
```

### 2. Trip Model (Traveler Request)
```typescript
interface Trip {
  id: string;
  title: string;
  
  // Location & Time
  city: string;
  startDate: string;
  endDate: string;
  duration: number; // days
  
  // What Traveler Needs
  requiredServices: TripServiceRequirement[]; // driver, guide, translator, etc.
  servicesNeeded: ServiceType[];
  
  // Trip Details
  groupSize: number;
  notes: string;
  fixedPrice?: number;
  estimatedPriceRange?: { min: number; max: number };
  
  // Status Lifecycle
  status: 
    | 'draft' // traveler creating
    | 'open' // published, awaiting offers
    | 'negotiating' // offers received, countering
    | 'price_locked' // price agreed
    | 'booked' // confirmed with supplier
    | 'started' // trip in progress
    | 'completed' // finished
    | 'reviewed' // traveler left review
    | 'cancelled';
  
  createdBy: string; // traveler ID
  createdByRole: 'traveler';
}
```

### 3. Offer Model (Supplier Response)
```typescript
interface Offer {
  id: string;
  tripId: string; // which trip this is for
  
  // Who's offering
  supplierId: string;
  supplierName: string;
  supplierRole: UserRole;
  supplierRating: number;
  supplierAvatar?: string;
  
  // The Offer
  price: number; // proposed price
  notes: string; // why I'm good for this trip
  validUntil: string; // when offer expires
  
  // Negotiation
  round: number; // which round of negotiation
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  
  // Market Comparison
  isPriceMatch?: 'good' | 'fair' | 'high';
  matchScore?: number; // calculated score vs alternatives
  
  createdAt: string;
}
```

### 4. Booking Model (Confirmed Trip)
```typescript
interface Booking {
  id: string;
  tripId: string; // which trip
  trip: Trip; // full trip details
  
  // Parties Involved
  travelerId: string;
  supplierId: string;
  
  // Payment
  finalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  fullPayment: boolean;
  paymentMethod: 'full' | 'deposit';
  
  // Status Lifecycle
  bookingStatus: 
    | 'pending' // awaiting confirmation
    | 'accepted' // supplier accepted
    | 'paid' // payment received
    | 'confirmed' // confirmed & ready
    | 'active' // trip in progress
    | 'completed' // trip finished
    | 'cancelled';
  
  // Cancellation
  cancellationPolicy: {
    moreThan24h: number; // % refund
    between10And24h: number;
    lessThan10h: number;
  };
  cancellationReason?: string;
  cancelledAt?: string;
  
  // Trip Execution
  tripStartedAt?: string;
  currentStopIndex?: number;
  stopTracking?: StopTrackingInfo[]; // real-time location
  
  bookingDate: string;
}
```

### 5. Package Model (Pre-Designed Trip)
```typescript
interface Package {
  id: string;
  
  // Supplier Info
  supplierId: string;
  supplierName: string;
  supplierRole: UserRole;
  supplierRating: number;
  
  // Package Details
  title: string;
  description: string;
  
  // Destination (Global System)
  country: string;
  city: string;
  
  // Pricing & Duration
  price: number;
  currency: string;
  duration: string; // "2 hours", "3 days"
  durationUnit: 'hours' | 'days';
  groupSizeMin: number;
  groupSizeMax: number;
  
  // Itinerary (Day-by-Day)
  itinerary: Array<{
    day: number;
    title: string; // "Day 1: Introduction"
    description: string;
    activities: string[]; // activity names
    duration: string;
  }>;
  
  // What's Included/Not Included
  included: string[];
  notIncluded: string[];
  
  // Logistics
  meetingPoint: string;
  dropoffPoint: string;
  requirements?: string;
  cancellationPolicy?: string;
  
  // Marketing
  images: string[];
  highlights: string[];
  category: ActivityCategory;
  difficulty: 'easy' | 'moderate' | 'challenging';
  
  // Performance
  bookings: number;
  rating: number;
  createdAt: string;
}
```

### 6. Activity Model
```typescript
interface Activity {
  id: string;
  name: string;
  city: string;
  country: string;
  
  // Details
  title: string;
  description: string;
  category: ActivityCategory; // sightseeing, adventure, etc.
  duration: number; // minutes
  estimatedPrice: number;
  
  // Logistics
  groupSizeMin: number;
  groupSizeMax: number;
  location: { lat: number; lng: number };
  
  // Quality
  rating: number;
  reviewCount: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  
  // What's needed
  servicesNeeded: ServiceType[];
  
  images: string[];
  highlights: string[];
  tags: string[];
}
```

### 7. TripPlan Model (Shopping Cart)
```typescript
interface TripPlan {
  id: string;
  userId: string; // traveler ID
  
  // Destination
  city: string;
  country: string;
  
  // Selected Items (Cart)
  selectedActivities: Activity[]; // activities traveler added
  selectedPackages: Package[]; // packages traveler added
  
  // Services & Requirements
  selectedServices?: ServiceType[]; // driver, guide, etc.
  requiredServices?: TripServiceRequirement[]; // detailed requirements
  
  // Trip Details
  tripDate?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  estimatedBudget?: number;
  
  // Summary
  totalEstimatedCost: number; // sum of all items
  status: 'draft' | 'published'; // not published, or submitted to suppliers
  
  createdAt: string;
}
```

### 8. Review Model
```typescript
interface Review {
  id: string;
  tripId: string;
  bookingId: string;
  
  // Reviewer Info
  reviewerId: string; // traveler
  reviewerName: string;
  
  // Reviewed Person
  reviewedUserId: string; // supplier
  
  // Ratings (1-5 stars each)
  serviceRating: number; // how good was the service?
  safetyRating: number; // did I feel safe?
  communicationRating: number; // was communication clear?
  
  // Feedback
  comment: string; // detailed review text
  
  createdAt: string;
}
```

---

## Key Workflows

### 🔄 Workflow 1: Traveler Browsing & Trip Planning

```
START: Traveler visits /traveler/home
│
├─ Browse destinations & packages
│  ├─ Filter by country → city
│  ├─ View 4 package sections (popular, explore, recommended, new)
│  ├─ Search packages by name/city/description
│  └─ Each package shows: Supplier, Price, Duration, Rating
│
├─ Choose action:
│  ├─ Click Package → View full details (/traveler/package/:id)
│  │  ├─ See full itinerary (day-by-day)
│  │  ├─ See inclusions & exclusions
│  │  ├─ See meeting points & requirements
│  │  └─ "Add to Cart" → TripPlan.selectedPackages
│  │
│  ├─ Click "Plan This Destination" → Create trip request
│  │  ├─ Navigate to /traveler/discover/{city}
│  │  ├─ Browse 18 activities per city
│  │  ├─ Filter by activity category
│  │  ├─ "Add" activity → TripPlan.selectedActivities
│  │  └─ "Checkout My Trip" → /traveler/trip-plan
│  │
│  └─ Click "Upload Request" → /traveler/trip-plan
│
├─ In Trip Plan (3-step process):
│  ├─ STEP 1: Select services & basic info
│  │  ├─ Check: Driver, Guide, Translator, Activity
│  │  ├─ Fill: City, Date, Time, Budget
│  │  └─ Review: Added activities summary
│  │
│  ├─ STEP 2: Configure each service
│  │  ├─ Driver: Pickup, dropoff, vehicle type, stops
│  │  ├─ Guide: Places to visit, tour type, duration
│  │  ├─ Translator: Languages, context, duration
│  │  └─ Activity: Type, location, skill level, group size
│  │
│  └─ STEP 3: Publish request
│     ├─ Validation checks pass
│     ├─ Click "Publish Request to Suppliers"
│     ├─ Creates Trip(status="open")
│     ├─ Sends notifications to matching suppliers
│     └─ Redirects to /traveler/booking-management
│
└─ END: Trip request published, awaiting offers
```

### 🔄 Workflow 2: Supplier Receiving & Responding to Requests

```
START: Supplier receives notification "New trip request for [Service] in [City]"
│
├─ Navigate to /supplier/operations
│  ├─ View all incoming trip requests
│  ├─ Filter by: Service type, City, Status
│  └─ Click request to view full details
│
├─ Review Trip Request:
│  ├─ Who: Traveler name, rating, review count
│  ├─ What: Services needed, destinations, stops
│  ├─ When: Date, duration, time
│  ├─ How many: Group size
│  ├─ Budget: Traveler's estimated budget
│  └─ Why: Traveler notes & special requests
│
├─ Decide: Can I fulfill this?
│  ├─ Check my availability (from /supplier/availability)
│  ├─ Check if my services match (driver → driver requests)
│  ├─ Consider profitability & workload
│  └─ Option: Decline & mark for other suppliers
│
├─ Create Offer:
│  ├─ Propose Price (may differ from traveler budget)
│  ├─ Validity (when offer expires)
│  ├─ Notes (confirm I can do it, confirm timing, etc.)
│  ├─ Attach Itinerary (show how I'll execute)
│  └─ Click "Send Offer"
│
├─ Offer Sent:
│  ├─ Notification to traveler: "[Supplier] offered RM [price]"
│  ├─ Offer appears in traveler's /traveler/booking-management
│  ├─ Supplier can see offer status (pending)
│  └─ Communication channel opens for Q&A
│
├─ Wait for Traveler Response:
│  ├─ Accept → Trip moves to "booked" (Booking created)
│  ├─ Decline → Offer rejected, trip remains "open" for others
│  ├─ Counter → Traveler proposes different price
│  │  ├─ Supplier sees counter offer
│  │  ├─ Can accept, decline, or counter-counter
│  │  └─ Negotiation rounds continue until agreement
│  │
│  └─ Alternatively: Request communication (chat)
│     ├─ Supplier can message traveler for clarification
│     ├─ Traveler can ask for modifications
│     └─ Once agreed, both confirm in offer
│
└─ END: Offer accepted → Booking created, payment processing begins
```

### 🔄 Workflow 3: Executing a Booked Trip

```
START: Booking confirmed (status = "confirmed")
│
├─ PRE-TRIP (24 hours before):
│  ├─ Supplier confirms with traveler:
│  │  ├─ Check arrival time & location
│  │  ├─ Exchange contact numbers
│  │  ├─ Discuss any last-minute changes
│  │  └─ Confirm traveler requirements (dietary, mobility, etc.)
│  │
│  └─ Prepare for trip:
│     ├─ Vehicle inspection (if driver)
│     ├─ Route planning
│     ├─ Equipment check (if guide/activity)
│     └─ Mental preparation
│
├─ TRIP DAY:
│  ├─ Supplier arrives at meeting point
│  │  ├─ Verifies traveler identity
│  │  └─ Takes control of experience
│  │
│  ├─ Start Trip:
│  │  ├─ Mark trip status = "active"
│  │  ├─ Start location tracking (GPS shared with traveler)
│  │  ├─ Send traveler: "Trip started, you're with [Supplier]"
│  │  └─ Any emergency contact info needed?
│  │
│  ├─ Execute Stops:
│  │  ├─ Arrive at Stop 1
│  │  │  ├─ Log arrival time & location
│  │  │  ├─ Spend planned duration
│  │  │  ├─ Answer traveler questions
│  │  │  ├─ Take photos with traveler
│  │  │  └─ Log departure
│  │  │
│  │  ├─ Arrive at Stop 2 [repeat]
│  │  ├─ Arrive at Stop N [repeat]
│  │  └─ ...continue through itinerary
│  │
│  ├─ Communication throughout:
│  │  ├─ Traveler can chat anytime
│  │  ├─ Supplier explains what's happening
│  │  ├─ Share updates about delays/changes
│  │  └─ Emergency: Direct phone call available
│  │
│  └─ Complete Trip:
│     ├─ Arrive at drop-off point
│     ├─ Final goodbye & thank you
│     ├─ Mark trip status = "completed"
│     ├─ Log final location & time
│     └─ Supplier confirms trip ended
│
├─ POST-TRIP:
│  ├─ Payment Processing:
│  │  ├─ Platform collects full amount (if not already paid)
│  │  ├─ Platform fee deducted (~20%)
│  │  ├─ Supplier payout calculated
│  │  └─ Funds transferred to supplier's account
│  │
│  └─ Review Period (24 hours):
│     ├─ Traveler can leave review
│     ├─ Rate: Service, Safety, Communication (1-5 stars each)
│     ├─ Write comment
│     ├─ Review posted to supplier's profile
│     ├─ Supplier notified of review
│     ├─ Booking status = "reviewed"
│     └─ Review impacts supplier ranking
│
└─ END: Trip completed & reviewed, ready for next booking
```

---

## Permissions Matrix

### Who Can Do What?

| Feature | Traveler | Driver | Guide | Translator | Activity Op |
|---------|----------|--------|-------|------------|-------------|
| **Browse Packages** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add Activities to Cart | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Browse Activities** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filter by Destination | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create Trip Request** | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload Request to Suppliers | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Receive Trip Requests** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Send Offer on Request | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Create Packages** | ❌ | ✅ | ✅ | ❌ | ✅ |
| View Own Packages | ❌ | ✅ | ✅ | ❌ | ✅ |
| Edit Own Packages | ❌ | ✅ | ✅ | ❌ | ✅ |
| Delete Own Packages | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Manage Bookings** | ✅ | ❌ | ❌ | ❌ | ❌ |
| Accept/Decline Offers | ✅ | ❌ | ❌ | ❌ | ❌ |
| Counter Offer Price | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Active Trips** | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (own) |
| Track Trip Live | ✅ | ❌ | ❌ | ❌ | ❌ |
| Share Location | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Leave Review** | ✅ | ❌ | ❌ | ❌ | ❌ |
| Receive Review | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Chat with Other User** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Earnings | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Verify Documents** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Access Network** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Set Availability | ❌ | ✅ | ✅ | ✅ | ✅ |
| Post in Network | ❌ | ✅ | ✅ | ✅ | ✅ |

**Key Notes:**
- Translators cannot create packages (redirected to services)
- Travelers cannot access supplier features
- Each user sees only their own trips/bookings
- Reviews are posted publicly on supplier profiles
- Market data (packages, activities) is public for all

---

## System Status & Data Volume

### Current Seeded Data:

```
Destinations:
├─ Countries: 14 (Malaysia, Thailand, Indonesia, Japan, France, Italy, Spain, UAE, Turkey, USA, Mexico, and more)
├─ Cities: 140+ (10 cities per country on average)
├─ Activities per City: 18 (total 2,520+ activities)
└─ Packages per City: 4 (total 560+ packages)

Users: 20+ mock users (mixed roles)

Verification Status: 
  ├─ Some verified
  ├─ Some pending
  └─ Some rejected (for demo purposes)

Sample Trips & Bookings:
  ├─ 12+ example trip requests
  ├─ Offers & counter-offers demonstrated
  ├─ Multiple booking states shown
  └─ Reviews and ratings seeded
```

### API/Context Methods Available:

**Traveler Methods:**
- `createTripPlan(city)` - Start planning in a city
- `addActivityToPlan(activity)` - Add to cart
- `removeActivityFromPlan(activityId)` - Remove from cart
- `publishTripRequest(tripPlan, numberOfPeople, notes)` - Upload request to suppliers
- `clearTripPlan()` - Reset cart
- `searchPackages(query)` - Search supplier packages
- `searchActivities(query)` - Search activities
- `addToCart(packageId, quantity, date)` - Add package to cart
- `removeFromCart(cartItemId)` - Remove package from cart

**Supplier Methods:**
- `createPackage(packageData)` - Create pre-designed trip package
- `getSupplierPackages(supplierId)` - View own packages
- `createOffer(offer)` - Send offer on trip request
- `acceptOffer(offerId)` - Accept traveler's offer
- `declineOffer(offerId)` - Reject traveler's offer
- `counterOffer(originalOfferId, newPrice, notes)` - Negotiate price
- `createBooking(tripId, offerId, paymentMethod)` - Confirm booking
- `updateBookingStatus(bookingId, status)` - Update trip status
- `updateAvailability(availability)` - Manage time slots

**Shared Methods:**
- `sendChatMessage(bookingId, message)` - Chat with other party
- `submitReview(review)` - Post review
- `markNotificationAsRead(notificationId)` - Clear notification
- `login(email, role)` - Authenticate user
- `updateUser(updates)` - Update profile

---

## Navigation Flow Diagram

```
TRAVELER FLOW:
┌─────────────────────────────────────────────────────────┐
│ /traveler/home (Destination Discovery)                 │
│ - Browse packages, activities, destinations             │
│ - Search packages by name/city                          │
│ - Trip Planning Cart visible with status               │
└────────┬──────────────────────────────────────────────┘
         │
         ├─→ /traveler/package/:id (Package Details)
         │   └─→ Add to cart → back to home
         │
         ├─→ /traveler/discover/:cityId (Activities)
         │   ├─→ /traveler/activity/:id (Activity Details)
         │   │   └─→ Add to cart → back to discover
         │   └─→ Checkout → /traveler/trip-plan
         │
         └─→ /traveler/trip-plan (Create Request)
             ├─ Step 1: Select Services & Info
             ├─ Step 2: Configure Each Service
             ├─ Step 3: Publish Request
             └─→ /traveler/booking-management (View Offers)
                 ├─ Accept → Booking created
                 ├─ Decline → Offer rejected
                 ├─ Counter → Negotiate price
                 ├─ Chat → Communicate with supplier
                 └─→ /traveler/active-trip/:id (Live Tracking)
                     └─→ /traveler/review/:id (Leave Review)

SUPPLIER FLOW:
┌──────────────────────────────────────────────────────────┐
│ /supplier/dashboard (Overview & Metrics)                 │
└────────┬─────────────────────────────────────────────────┘
         │
         ├─→ /supplier/verification (Get Verified)
         │
         ├─→ /supplier/create-package (Create Packages)
         │   ├─ 11-section form
         │   └─→ /supplier/packages (View Packages)
         │       ├─ Edit, Delete, Analytics
         │       └─ View each package's bookings
         │
         ├─→ /supplier/operations (Manage Requests & Offers)
         │   ├─ View incoming trip requests
         │   ├─ Create and send offers
         │   ├─ Manage offers & negotiations
         │   └─ Chat with travelers
         │
         ├─→ /supplier/bookings (Confirmed Bookings)
         │   ├─ View booked trips
         │   ├─ Pre-trip communication
         │   └─→ /supplier/active-trip/:id (Execute Trip)
         │       ├─ Real-time location tracking
         │       ├─ Log trip events
         │       └─ Mark completed
         │
         ├─→ /supplier/availability (Set Available Times)
         │
         └─→ /supplier/network (Community)
             └─ Collaborate with other suppliers
```

---

## Key Insights

### Why This System Works:

1. **Two-Sided Marketplace**: Both travelers and suppliers have value:
   - Travelers get customization & choice
   - Suppliers get bookings & income

2. **Flexible Booking Options**:
   - Pre-designed Packages (easy, one-click)
   - Custom Trip Requests (flexible, negotiable)
   - Both sides can win

3. **Trust & Safety**:
   - Verification required before booking
   - Rating system incentivizes quality
   - Real-time tracking builds confidence
   - Reviews provide social proof

4. **Scalable Data Model**:
   - Countries & Cities are master data
   - Packages & Activities generated dynamically
   - One country can have 10+ cities
   - Each city has hundreds of activities & packages

5. **Multi-Service Ecosystem**:
   - Different supplier types (driver, guide, translator, activity)
   - Travelers can mix & match services
   - Suppliers can specialize or generalize

6. **Transparent Financial Model**:
   - Clear pricing (no hidden fees)
   - Platform fee understood upfront
   - Supplier payouts calculated automatically

---

## Summary Table: What Each Role Sees

| Role | Primary Goal | Main Pages | Key Actions | Restrictions |
|------|---|---|---|---|
| **Traveler** | Book travel experiences | Home, Discover, Trip Plan, My Trips, Active Trip | Browse, Plan, Request, Review | Can't create packages, can't see supplier dashboard |
| **Driver** | Get paid for transport | Dashboard, Operations, Packages, Active Trip | Create routes, Respond to requests, Track trips | Can't translate, can't operate activities |
| **Guide** | Lead curated tours | Dashboard, Operations, Packages, Active Trip | Create itineraries, Respond to requests, Lead experiences | Can't translate, can't provide other services |
| **Translator** | Earn from language services | Dashboard, Operations, Network | Respond to translator requests, Chat, Collaborate | Can't create packages, must use services flow |
| **Activity Op** | Run experiences | Dashboard, Operations, Packages, Active Trip | Create activity packages, Respond to requests | Can't provide transport or translation |

---

This comprehensive guide covers the entire TripuLike system. Each role has clear permissions, defined workflows, and data models that support the two-sided marketplace model. The system scales from individual transactions to multi-day complex trips with multiple suppliers.
