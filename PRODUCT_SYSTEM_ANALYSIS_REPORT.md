# TripuLike - Product & System Analysis Report

**Document Version:** 1.0  
**Analysis Date:** March 4, 2026  
**Analyst Role:** Senior Product Manager & System Architect  
**Analysis Scope:** Complete codebase and implemented functionality

---

## EXECUTIVE SUMMARY

### What is the Product About?

**TripuLike** is a comprehensive two-sided marketplace platform that connects travelers with verified tourism service suppliers in Malaysia. The platform facilitates the entire travel lifecycle from discovery and booking to trip execution and post-trip reviews.

The product operates as an **integrated booking and service management platform** that enables:
- Travelers to discover pre-designed tour packages or create custom trip requests
- Tourism suppliers (agencies, drivers, guides, translators, local support) to offer services and manage operations
- Direct negotiation between parties with a structured 3-round limit
- Secure escrow-based payment processing with platform commission (17.5%)
- Real-time trip tracking and emergency support
- Dual social networking for experience sharing and professional collaboration

### Core Problems Solved

**For Travelers:**
1. Trust & Safety - Finding verified, reliable local tourism suppliers
2. Price Transparency - Clear pricing and comparison tools
3. Discovery - Authentic local experiences beyond mainstream tours
4. Coordination - Managing multiple suppliers (driver + guide + translator) in one place
5. Payment Security - Escrow protection against upfront payment risks
6. Real-Time Safety - Live tracking and emergency support during trips

**For Suppliers:**
7. Customer Acquisition - Direct access to travelers without high OTA fees
8. Fair Commission - 17.5% vs traditional 20-30% OTA rates
9. Business Tools - Professional booking and operations management
10. Payment Security - Guaranteed payouts after trip completion
11. Professional Network - Collaboration and overflow referral opportunities

### Target Users

**Travelers (Demand Side):**
- International Students in Kuala Lumpur (Age: 18-30)
- Family Travelers (Age: 30-50)
- Group Travelers (Age: 25-45)
- Solo Travelers (Age: 25-40)

**Suppliers (Supply Side):**
- Tour Agencies (Full-service operators)
- Independent Drivers (Transport specialists)
- Tour Guides (Experience specialists)
- Translators (Language support)
- Local Support (Concierge services)

### Platform Type

**Hybrid Multi-Sided Marketplace:**
- B2C Primary (70-80%): Suppliers → Travelers
- C2C Secondary (20-30%): Traveler → Traveler (tripmate finding)
- B2B Tertiary (5-10%): Supplier → Supplier (collaboration)

**Geographic Focus:** Malaysia (Kuala Lumpur, Penang, Melaka, Cameron Highlands, Langkawi)

### Business Model

**Revenue Model:** Transaction Commission
- **17.5% commission** on all completed bookings
- Charged to supplier (transparent in payout breakdown)
- Released after successful trip completion
- Example: RM 400 booking = RM 70 commission, RM 330 supplier payout

**Payment Flow:**
1. Customer books → Pays full amount or 50% deposit
2. Funds held in escrow → Platform controls
3. Trip completes → Customer confirms
4. Platform deducts 17.5% commission
5. Supplier receives payout (82.5%)
6. Auto-release after 24h if no dispute

---

## USER ROLES & PERMISSIONS

### Role 1: Traveler

**Capabilities:**
- Browse pre-designed packages
- Create custom trip requests with multi-stop itinerary
- Receive and compare offers from multiple suppliers
- Negotiate pricing (3-round system)
- Make payments (full or 50% deposit)
- Track active trips in real-time
- Leave reviews after completion
- Post travel stories and find tripmates
- Chat with booked suppliers

**Access Restrictions:**
- ❌ Cannot create pre-designed packages (agency exclusive)
- ❌ Cannot access supplier operations dashboard
- ❌ Cannot participate in Supplier Network

### Role 2: Tour Agency

**Capabilities:**
- All supplier features PLUS:
- **Create pre-designed packages** (EXCLUSIVE permission)
- Multi-day package creation with accommodation/flights
- Package management (edit, activate, deactivate)
- View location-filtered trip requests
- Submit offers and negotiate
- Manage bookings and execute trips
- Access business analytics
- Network with other suppliers

**Unique Features:**
- Package creation system (1-7 day packages)
- Advanced analytics and revenue forecasting
- Multi-service bundling
- Team management (future)

### Role 3: Driver

**Capabilities:**
- View trip requests filtered by "driver" service type
- Submit transport-only offers
- Negotiate pricing
- Manage bookings and execute trips
- Vehicle management (multiple vehicles, capacity, amenities)
- Receive payouts

**Access Restrictions:**
- ❌ Cannot create pre-designed packages
- ❌ Cannot bid on guide-only or translator-only requests

### Role 4: Tour Guide

**Capabilities:**
- View requests filtered by "guide" service type
- Submit guided tour offers
- Showcase specialties (culture, heritage, nature, adventure, food)
- Display language proficiencies
- Negotiate pricing
- Execute trips with tracking

**Access Restrictions:**
- ❌ Cannot create packages
- ❌ Cannot offer transport unless dual-registered

### Role 5: Translator

**Capabilities:**
- View requests filtered by "translator" service type
- Language pair filtering
- Submit interpretation offers
- Display interpretation modes (consecutive, escort)
- Accompany any tour type

**Access Restrictions:**
- ❌ Cannot create packages
- ❌ Cannot accept bookings for unverified languages

### Role 6: Local Support

**Capabilities:**
- View requests filtered by "local_support" service type
- Submit concierge service offers
- Airport pickup, SIM card, local recommendations
- Logistics coordination
- Student support specialist services

**Access Restrictions:**
- ❌ Cannot create packages
- ❌ Cannot offer specialized services (driving, guiding) unless licensed

---

## CORE FEATURES BREAKDOWN

### 1. Authentication & Onboarding

**Frictionless Entry:**
- Travelers: No login required (demo mode)
- Suppliers: Role selection → Immediate access → Verification later

**Supplier Verification:**
- 3-step process: Document Upload → Review → Verification
- Required documents: ID, License, Insurance, Tax registration
- Status: Pending → Verified/Rejected
- Unverified suppliers can view but not submit offers

### 2. Trip Discovery & Creation

**For Travelers:**
- Browse pre-designed packages with filters
- Location selector ("Where do you want to go?")
- Package detail pages (inclusions, exclusions, highlights)
- Create custom trip requests:
  - Multi-step form (destination, dates, stops, services, budget)
  - Add 1-10 stops with durations
  - Select needed services (driver, guide, translator, local support)
  - Optional budget range

**For Suppliers:**
- View trip requests filtered by:
  - Operating area (location-based)
  - Service type (role-based)
- Request cards show: destination, dates, group size, budget, competition level

### 3. Negotiation & Offers

**3-Round Negotiation System:**
- Round 1: Supplier submits initial offer
- Round 2: Traveler counters OR accepts
- Round 3: Supplier counters OR accepts (FINAL ROUND)
- Maximum 3 rounds enforced
- Either party can accept at any round
- Price comparison indicators (Good Deal, Fair Price, High Price)
- 48-hour offer validity with expiration countdown

**Offer Management:**
- Suppliers: "My Offers" tab (Waiting, Negotiation, Accepted)
- Travelers: Compare offers side-by-side
- Auto-decline other offers when one accepted

### 4. Booking & Payment

**Payment Options:**
- Full Payment: 100% upfront
- 50% Deposit: 50% now, 50% before trip (24h prior)

**Payment Breakdown:**
```
Total: RM 400
Platform Commission (17.5%): RM 70
Supplier Receives: RM 330
```

**Escrow System:**
- Funds held until trip completion
- Auto-release after 24h (dispute period)
- Commission deducted automatically

**Cancellation Policy:**
- >24h before: 100% refund
- 10-24h before: 50% refund
- <10h before: 0% refund

### 5. Trip Execution & Tracking

**Active Trip Screen:**
- Trip summary (customer info, payment status, schedule)
- "Start Trip" button (enabled on trip date)
- Real-time GPS tracking (simulated in demo)
- Stop-by-stop progress tracking
- Progress bar (% complete)
- "End Trip" button (after all stops completed)

**Real-Time Features:**
- Animated location marker
- Route path visualization
- Current stop highlighted
- ETA to next stop
- Both parties see same view

**Emergency Support:**
- SOS button during active trips
- Captures GPS location
- Notifies platform support (24/7)
- Displays emergency contact numbers

### 6. Reviews & Ratings

**Multi-Criteria Rating:**
- Service Quality (1-5 stars)
- Safety (1-5 stars)
- Communication (1-5 stars)
- Overall rating (average)

**Review Features:**
- Written comment (20-500 characters)
- Verified booking badge
- Supplier can respond
- Helpful voting
- Public display on supplier profile

### 7. Social Networking - Travel Stories

**Post Types:**
1. Experience Posts (trip stories with photos and ratings)
2. Tripmate Requests (find travel companions)
3. Recommendations (tips, hidden gems)

**Features:**
- Like, comment, bookmark
- Location tagging and hashtags
- Trending destinations
- Link to platform bookings

### 8. Social Networking - Supplier Network

**Post Types:**
1. Collaboration (partner opportunities)
2. Overflow (refer excess bookings for commission split)
3. Help Needed (ask community)
4. News (industry updates)
5. Pro Tips (best practices)
6. Updates (milestones)

**Referral System:**
- Set referral percentage (10-50%)
- Automatic commission distribution
- Track successful referrals

### 9. Messaging / Communication

**Chat Features:**
- Auto-created when booking confirmed
- Trip-specific threads
- Real-time online status
- Unread count badges
- Quick reply buttons
- Location sharing
- Image sharing

### 10. Notifications

**14 Notification Types:**
- new_offer, offer_accepted, offer_declined
- counter_offer, booking_confirmed
- trip_starting_soon, trip_started, trip_completed
- payment_received, new_review
- verification_approved, verification_rejected
- new_message, tripmate_request

**Features:**
- Deep links to relevant screens
- Filter tabs (All, Bookings, Offers, Messages, System)
- Mark all as read
- Push notifications (critical events)

### 11. Package Creation (Agency Only)

**Multi-Step Form:**
1. Basic Information (title, destination, duration, description)
2. Itinerary Builder (day-by-day schedule, stops, activities)
3. Pricing & Capacity (fixed/negotiable, group size limits)
4. Inclusions & Exclusions (checklists)
5. Highlights & Categories (attractions, difficulty level)
6. Images & Media (featured image + gallery)
7. Review & Publish

**Package Management:**
- Edit published packages
- Activate/deactivate
- Track views and bookings
- Performance metrics

### 12. Supplier Management & Dashboard

**Analytics:**
- Total earnings (monthly)
- Completed trips
- Average rating
- Pending payouts
- Earnings chart (daily, weekly, monthly)

**Availability Calendar:**
- Mark dates unavailable
- Set capacity limits per day
- Color-coded (green, yellow, red, gray)
- Prevent overbooking

**Payout History:**
- Date, Booking ID, Customer, Trip name
- Gross amount, Commission, Net payout
- Export as CSV

---

## KEY USER FLOWS

### Flow 1: Traveler Registration & Entry
1. Land on Welcome screen
2. Tap "Continue as Traveler"
3. Immediately logged in (no forms)
4. Navigate to Traveler Home
5. Browse packages or create trip

### Flow 2: Custom Trip Creation
1. Click "Create Your Trip"
2. Step 1: Select destination, dates
3. Step 2: Add stops (1-10) with durations
4. Step 3: Select services needed
5. Step 4: Enter group size, special requirements
6. Step 5: Optional budget range
7. Step 6: Review & Submit
8. Trip created with status "open"
9. Matching suppliers notified

### Flow 3: Supplier Offer Submission
1. Navigate to "Operations" > "View Requests"
2. Browse filtered requests (location + service type)
3. Click request to view details
4. Click "Submit Offer"
5. Enter price and notes
6. Submit (status: "pending", round: 1)
7. Traveler notified
8. Wait for response (48h validity)

### Flow 4: 3-Round Negotiation
**Round 1:**
- Supplier offers RM 350
- Traveler counters RM 300

**Round 2:**
- Supplier counters RM 325
- Round incremented to 3 (FINAL)

**Round 3:**
- Traveler accepts RM 325
- Price locked
- Other offers auto-declined
- Navigate to Booking/Payment

### Flow 5: Booking & Payment
1. View booking summary
2. Select payment method (Full or 50% Deposit)
3. Review commission breakdown
4. Agree to Terms & Conditions
5. Enter card details
6. Process payment (escrow)
7. Booking confirmed (status: "booked")
8. Notifications sent to both parties

### Flow 6: Active Trip Execution
**Pre-Trip:**
1. Trip date arrives
2. Supplier opens "Confirmed" booking
3. View trip details and schedule
4. Click "Start Trip" button

**During Trip:**
5. Status changes to "started"
6. Real-time tracking enabled
7. Supplier marks stops as completed
8. Progress updates (0% → 100%)
9. Traveler sees live tracking

**Completion:**
10. All stops completed
11. Click "End Trip"
12. Status changes to "completed"
13. Payout release triggered (24h)
14. Traveler prompted for review

### Flow 7: Trip Cancellation
**Traveler Initiates:**
1. Open "My Trips" > "Upcoming"
2. Click "Cancel Booking"
3. View refund amount (based on time until trip)
4. Select cancellation reason
5. Confirm cancellation
6. Refund processed
7. Supplier notified (compensation calculated)

**Refund Logic:**
- >24h: 100% refund, supplier gets RM 0
- 10-24h: 50% refund, supplier gets 50% minus commission
- <10h: 0% refund, supplier gets full payout

---

## TECHNICAL IMPLEMENTATION NOTES

### Platform Architecture
- **Frontend:** React with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Routing:** React Router
- **Icons:** Lucide React
- **Mobile-First:** iPhone 14 Pro (390×844px)

### Data Models (Key Entities)
- User (role, verificationStatus, profile)
- Trip (status, stops, services, budget)
- Offer (price, round, status, validity)
- Booking (escrowHeld, commission, supplierPayout)
- Package (agency-created, inclusions, pricing)
- Review (service, safety, communication ratings)
- Message (chat threads linked to bookings)
- Notification (14 types, deep links)

### Business Rules Enforced
- 3-round negotiation maximum
- 17.5% commission on all bookings
- 48-hour offer validity
- Escrow release after 24h post-completion
- Tiered cancellation refunds
- Location-based request filtering
- Service-type based request filtering
- Package creation restricted to agencies

### Demo Mode Characteristics
- No authentication (frictionless entry)
- Mocked payment processing
- Simulated GPS tracking
- No backend (all data in-memory)
- No email/SMS sending
- No admin panel

---

## COMPETITIVE ADVANTAGES

1. **Lower Commission:** 17.5% vs 20-30% OTA standard
2. **3-Round Negotiation:** Structured, fair price discovery
3. **Real-Time Tracking:** Safety and transparency during trips
4. **Dual Social Networks:** Travel Stories + Supplier Network
5. **Escrow Protection:** Payment security for both parties
6. **Multi-Service Bundling:** Driver + Guide + Translator in one booking
7. **Tripmate Finding:** Cost-sharing for solo travelers
8. **Emergency Support:** 24/7 SOS with location capture
9. **Verified Suppliers:** Document verification before offers
10. **Fair Cancellation Policy:** Clear, tiered refunds

---

## FUTURE ENHANCEMENTS (Not Implemented)

- Admin dashboard and controls
- Password-based authentication
- Email/SMS notifications (real)
- Push notifications (real)
- Payment gateway integration (real)
- GPS tracking (real)
- Photo uploads in reviews
- Voice messages in chat
- Team management for agencies
- Premium supplier accounts
- Package insurance add-ons
- Multi-language support (UI)
- Multi-currency support
- Regional expansion (Singapore, Indonesia, Thailand)

---

**End of Report**
