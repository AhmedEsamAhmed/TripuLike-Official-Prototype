Project: TripuLike– System Update (Supplier Logic & UX Refinement)
________________________________________
🔁 1. GLOBAL CHANGE – REMOVE AUTHENTICATION FLOW
Remove:
•	Login
•	Signup
•	OTP
•	Password reset
•	Authentication validation screens
Replace With:
New Entry Screen:
Headline: Welcome to TripMate
Subtext: Your trusted tourism experience platform
Buttons:
•	Continue as Traveler
•	Register as Supplier
No login logic required (prototype mode only).
Purpose:
Make demo experience frictionless for stakeholders.
________________________________________
🔄 2. SUPPLIER TYPE MODIFICATION
Update Supplier Types List
Modify existing supplier types to:
1.	Tour Agency
2.	Driver
3.	Tour Guide
4.	Translator (NEW)
5.	Local Support (NEW)
Update:
•	Supplier registration selection screen
•	Supplier profile badge display
•	Filtering logic across system
UI requirement:
Show supplier type badge clearly in profile header.
________________________________________
🔐 3. PACKAGE CREATION ACCESS CONTROL (CRITICAL LOGIC UPDATE)
Modify Feature Permission:
Only supplier type:
✅ Tour Agency
Can:
•	Access “Create Package”
•	Upload packages
•	Include hotels
•	Include flights
All other supplier types:
•	Hide “Create Package” button
•	Remove package management section
•	Operate only via trip requests
Reason:
Packages may include flights & hotel bookings → requires agency-level authority.
In Figma:
Simulate role-based visibility.
________________________________________
🏠 4. SUPPLIER HOME PAGE – ADD DEMO DATA
Update existing Supplier Home Dashboard:
Add "View Bookings" Section with Demo Data
Include sample booking cards:
Booking ID: TM-2045
Customer: Sarah Lee
Trip: Kuala Lumpur City Tour
Date: 18 March 2026
Status: Confirmed
Payment: Paid
Booking ID: TM-2046
Customer: Ahmed Rahman
Trip: Genting Highlands
Date: 20 March 2026
Status: Pending
Payment: Awaiting Confirmation
Each card must show:
•	Trip name
•	Date
•	Status badge
•	Payment status
•	View details button
Modern card layout with clear hierarchy.
________________________________________
⚙️ 5. OPERATIONS PAGE RESTRUCTURE
________________________________________
A) View Requests Panel – LOCATION FILTERING
Modify request visibility logic:
Requests displayed based on:
Supplier’s preferred operating location.
Example:
If supplier operates in Kuala Lumpur →
Only show KL-based trip requests.
Add:
“Operating Area” indicator in supplier profile settings.
Each request card includes:
•	Customer name
•	Date
•	Pick-up location
•	Duration
•	Budget (if available)
•	Submit Offer button
________________________________________
B) My Offers Panel – UPGRADE FLOW
Add:
•	More demo data
•	Clear Accept button
•	Clear status indicators
Offer Status Types:
•	Waiting
•	Negotiation
•	Accepted
When supplier clicks an offer:
Open Offer Detail Page showing:
•	Price offered
•	Breakdown
•	Customer counter offer (if any)
•	Negotiate button
•	Accept Offer button
________________________________________
Updated Supplier Flow:
Submit Offer →
Customer Negotiates →
Supplier Accepts →
Trip Moves to Active Panel
This flow must be visually clear in prototype transitions.
________________________________________
🚗 6. ACTIVE PAGE – FULL OPERATIONAL FLOW UPDATE
This is the biggest enhancement.
________________________________________
After Offer Acceptance:
Trip appears in Active.
When trip date arrives:
Status shows:
Customer Confirmed
Button appears:
▶ Start Trip
________________________________________
When Supplier Clicks “Start Trip”
Open Full Trip Dashboard
________________________________________
A) Trip Summary Section
Display:
•	Customer Name
•	Contact
•	Emergency Contact
•	Payment Status
•	Total Amount
•	Remaining Balance
•	Special Notes
________________________________________
B) Detailed Schedule Timeline
Structured timeline layout:
08:00 – Pick up at KLCC
09:00 – Batu Caves
11:30 – Central Market
13:00 – Lunch
15:00 – Petronas Towers
18:00 – Drop off
Each stop includes:
•	Location name
•	Time
•	Duration
•	Notes
________________________________________
C) Real-Time Tracking View
Add:
•	Live map section
•	Supplier current location
•	Route path
•	Current stop highlight
•	“Live Trip in Progress” status indicator
________________________________________
D) End Trip Button
After trip completion:
Supplier taps “End Trip”
Trip moves to:
Completed section
Customer can leave review.
________________________________________
⭐ 7. SUPPLIER PROFILE – ADD TRUST LAYER
Update profile section to clearly include:
•	Profile image
•	Supplier type badge
•	Years of experience
•	Languages spoken
•	Operating areas
•	Rating score (example: 4.8 / 5)
________________________________________
Reviews & Comments Section
Add:
⭐ 4.8 (120 Reviews)
Review cards:
“Very professional and friendly.”
“Trip was smooth and well organized.”
Each review shows:
•	Star rating
•	Comment
•	Trip name
•	Date
Make review section visually strong and easy to scan.
________________________________________
🎨 8. UI/UX IMPROVEMENT REQUIREMENTS
Apply across modified sections:
•	Minimal white background
•	Soft shadows
•	Rounded cards
•	Clear status badges
•	Strong CTA buttons
•	Clear navigation
Supplier bottom navigation:
Home | Operations | Active | Profile
Make negotiation and acceptance buttons very visible.
________________________________________
📌 SUMMARY OF MODIFICATIONS IMPLEMENTED
Here is what has been changed in the system:
1. Authentication Removed
Demo-friendly entry with role selection.
2. Supplier Types Expanded
Added Translator & Local Support.
3. Package Feature Restricted
Only Tour Agency can create packages.
4. Dashboard Enriched
Added booking demo data & payment visibility.
5. Location-Based Filtering
Suppliers only see relevant requests.
6. Negotiation Flow Clarified
Clear Accept & Negotiate logic.
7. Active Trip Execution Upgraded
Added:
•	Start Trip
•	Full timeline
•	Payment status
•	Live tracking
•	Trip summary
•	End Trip
8. Trust System Enhanced
Added rating & review display to supplier profile.

