# TripuLike - New Structure Implementation Status

## 🎯 NEW FLOW IMPLEMENTED

### ✅ Phase 1: Foundation (COMPLETED)

#### 1. Type System Updated
- ✅ Added `Activity` interface with full details
- ✅ Added `TripPlan` interface for shopping cart
- ✅ Added `ActivityCategory` type (9 categories)
- ✅ Added `ServiceType` with activity_provider
- ✅ Updated AppState with activities and tripPlan

#### 2. New Traveler Home (COMPLETED)
- ✅ Destination selection screen
- ✅ 6 popular destinations with images
- ✅ Search functionality
- ✅ "How it works" guide
- ✅ Navigation to discover activities

#### 3. Discover Activities Screen (COMPLETED)
- ✅ Category filtering (All, Sightseeing, Adventure, Cultural, Food, Nature, Water Sports)
- ✅ Activity cards with full details
- ✅ Shopping cart icon with count
- ✅ "Add to Plan" and "View Details" buttons
- ✅ 6 sample activities created
- ✅ Proper navigation structure

#### 4. Routes Updated (COMPLETED)
- ✅ Added `/traveler/discover/:cityId` route
- ✅ Imported DiscoverActivities component
- ✅ All routes properly configured

---

## 🔄 Phase 2: Required Implementation

### Priority 1: Activity Details & Cart Management

#### 1. Activity Details Screen (**NEEDED**)
**File:** `/src/app/screens/traveler/ActivityDetails.tsx`

**Features Required:**
- Full activity information display
- Image gallery (multiple images)
- Detailed description
- Entrance fees and estimated prices
- Duration and difficulty
- Operating hours and best time to visit
- What to bring list
- Reviews and ratings
- Services needed badges
- "Add to My Plan" button
- Back navigation

**Example Structure:**
```tsx
<ActivityDetails>
  <ImageGallery images={activity.images} />
  <ActivityInfo>
    <Title>{activity.name}</Title>
    <Rating>4.8 (3,420 reviews)</Rating>
    <PriceInfo>
      <EntranceFee>RM 85</EntranceFee>
      <EstimatedTotal>RM 120</EstimatedTotal>
    </PriceInfo>
    <QuickInfo>
      <Duration>2 hours</Duration>
      <Difficulty>Easy</Difficulty>
      <MinAge>5+</MinAge>
    </QuickInfo>
    <Description>{activity.description}</Description>
    <Highlights>{activity.highlights.map(...)}</Highlights>
    <PracticalInfo>
      <OperatingHours />
      <BestTimeToVisit />
      <WhatToBring />
    </PracticalInfo>
    <ServicesNeeded>
      {activity.servicesNeeded.includes('guide') && <Badge>Tour Guide Needed</Badge>}
      {activity.servicesNeeded.includes('driver') && <Badge>Driver Needed</Badge>}
    </ServicesNeeded>
  </ActivityInfo>
  <StickyFooter>
    <TotalPrice>RM 120</TotalPrice>
    <AddButton onClick={addToPlan}>Add to My Plan</AddButton>
  </StickyFooter>
</ActivityDetails>
```

#### 2. Trip Plan Screen (**NEEDED**)
**File:** `/src/app/screens/traveler/TripPlan.tsx`

**Features Required:**
- List all selected activities
- Remove activity option
- Calculate total estimated cost
- Show estimated duration
- Form to enter:
  - Trip date (date picker)
  - Pickup location (text input with suggestions)
  - Drop-off location (text input with suggestions)
  - Estimated budget for services (number input)
  - Number of people (number input)
- "Post Trip Request" button
- Back to discover button

**Example Structure:**
```tsx
<TripPlan>
  <Header>
    <Title>My Trip Plan</Title>
    <CityName>Kuala Lumpur</CityName>
  </Header>
  
  <SelectedActivities>
    {selectedActivities.map(activity => (
      <ActivityCard>
        <Image src={activity.images[0]} />
        <Info>
          <Name>{activity.name}</Name>
          <Duration>{activity.duration} min</Duration>
          <Price>RM {activity.estimatedPrice}</Price>
        </Info>
        <RemoveButton onClick={removeActivity} />
      </ActivityCard>
    ))}
  </SelectedActivities>
  
  <TripSummary>
    <TotalDuration>Total Duration: 7 hours</TotalDuration>
    <TotalCost>Estimated Cost: RM 450</TotalCost>
  </TripSummary>
  
  <TripDetailsForm>
    <DatePicker label="When?" value={tripDate} />
    <LocationInput label="Pick Up Location" value={pickup} />
    <LocationInput label="Drop Off Location" value={dropoff} />
    <NumberInput label="Number of People" value={groupSize} />
    <BudgetInput label="Your Budget for Services" value={budget} />
    <NotesTextarea label="Special Requests" value={notes} />
  </TripDetailsForm>
  
  <Actions>
    <BackButton onClick={goBack}>Add More Activities</BackButton>
    <PostButton onClick={postRequest}>Post Trip Request</PostButton>
  </Actions>
</TripPlan>
```

#### 3. AppContext Methods (**NEEDED**)

Add to `/src/app/context/AppContext.tsx`:

```typescript
interface AppContextType {
  // ... existing methods
  
  // New methods for activity flow
  addActivityToPlan: (activity: Activity) => void;
  removeActivityFromPlan: (activityId: string) => void;
  createTripPlan: (city: string) => void;
  updateTripPlan: (updates: Partial<TripPlan>) => void;
  publishTripRequest: (tripPlan: TripPlan) => string; // returns tripId
  clearTripPlan: () => void;
}

// Implementation
const addActivityToPlan = (activity: Activity) => {
  setTripPlan(prev => {
    if (!prev) {
      // Create new plan
      return {
        id: `plan-${Date.now()}`,
        userId: user!.id,
        city: activity.city,
        selectedActivities: [activity],
        totalEstimatedCost: activity.estimatedPrice,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
    }
    
    // Add to existing plan
    return {
      ...prev,
      selectedActivities: [...prev.selectedActivities, activity],
      totalEstimatedCost: prev.totalEstimatedCost + activity.estimatedPrice,
    };
  });
};

const publishTripRequest = (tripPlan: TripPlan) => {
  // Convert trip plan to Trip object
  const trip: Trip = {
    id: `trip-${Date.now()}`,
    title: `Trip to ${tripPlan.city}`,
    city: tripPlan.city,
    startDate: tripPlan.tripDate || '',
    endDate: tripPlan.tripDate || '',
    duration: 1,
    stops: tripPlan.selectedActivities.map(act => ({
      id: act.id,
      name: act.name,
      duration: act.duration,
      location: act.location,
    })),
    servicesNeeded: Array.from(new Set(
      tripPlan.selectedActivities.flatMap(a => a.servicesNeeded)
    )),
    groupSize: 2, // from form
    notes: '',
    status: 'open',
    createdBy: user!.id,
    createdByRole: 'traveler',
    isPreDesigned: false,
    isNegotiable: true,
    estimatedPriceRange: {
      min: tripPlan.estimatedBudget || 0,
      max: tripPlan.estimatedBudget || 0,
    },
  };
  
  setTrips(prev => [trip, ...prev]);
  setMyTrips(prev => [trip, ...prev]);
  
  // Clear plan
  setTripPlan(null);
  
  // Notify suppliers (simulated)
  addNotification({
    userId: 'suppliers',
    type: 'new_request',
    title: 'New Trip Request',
    message: `New request in ${trip.city}`,
    read: false,
  });
  
  return trip.id;
};
```

---

### Priority 2: Supplier Side Updates

#### 1. Supplier Registration - Service Selection (**NEEDED**)

Update supplier registration to include service type selection:

**File:** `/src/app/screens/auth/RoleSelection.tsx` or create new step

**Features:**
- After selecting role, show service type checkboxes
- Driver: Can offer transport services
- Guide: Can offer tour guiding
- Translator: Can offer translation
- Local Support: Can offer assistance
- Activity Provider: Can offer specific activities (diving, cooking class, etc.)

#### 2. Supplier Trip Request Filtering (**UPDATE NEEDED**)

Update `/src/app/screens/supplier/SupplierOperations.tsx`:

**Current:** Filters by location
**New:** Filter by services needed in the trip request

```typescript
// Show only requests that match supplier's services
const relevantRequests = trips.filter(trip => {
  if (trip.isPreDesigned) return false; // Not a request
  if (trip.status !== 'open') return false; // Not accepting offers
  
  // Check if supplier can fulfill any of the needed services
  const canProvide = trip.servicesNeeded.some(service => 
    user.specialties?.includes(service) || user.role === service
  );
  
  return canProvide;
});
```

#### 3. Offer Submission Updates (**UPDATE NEEDED**)

When supplier submits offer, they specify:
- Total price for all services
- Which services they're providing
- Notes about their offer

---

### Priority 3: Negotiation Flow Enhancement

#### 1. Negotiation Demo Data (**NEEDED**)

Create sample trips with offers in various negotiation states:

```typescript
// Trip Request 1: Round 1 (Initial Offer)
{
  id: 'trip-demo-1',
  title: 'KL Sightseeing + Food Tour',
  city: 'Kuala Lumpur',
  status: 'open',
  estimatedPriceRange: { min: 300, max: 400 },
  servicesNeeded: ['driver', 'guide'],
  // ... details
}

// Offer 1 for Trip Demo 1 (Round 1, Pending)
{
  id: 'offer-demo-1',
  tripId: 'trip-demo-1',
  supplierName: 'Ahmad (Driver)',
  price: 380,
  round: 1,
  status: 'pending',
  notes: 'I can provide comfortable 7-seater van with A/C',
}

// Trip Request 2: Round 2 (Negotiating)
{
  id: 'trip-demo-2',
  title: 'Langkawi Island Adventure',
  city: 'Langkawi',
  status: 'negotiating',
  estimatedPriceRange: { min: 350, max: 450 },
  servicesNeeded: ['driver', 'activity_provider'],
}

// Offer 2a (Round 1, Countered by Traveler)
{
  id: 'offer-demo-2a',
  tripId: 'trip-demo-2',
  supplierName: 'Sarah (Activity Provider)',
  price: 450,
  round: 1,
  status: 'countered',
  notes: 'Diving instructor + equipment included',
}

// Offer 2b (Round 2, Supplier Counter)
{
  id: 'offer-demo-2b',
  tripId: 'trip-demo-2',
  supplierName: 'Sarah (Activity Provider)',
  price: 420,
  round: 2,
  status: 'pending',
  notes: 'Reduced price. Equipment rental extra RM30',
  isPriceMatch: 'fair',
}

// Trip Request 3: Round 3 (Final Round)
{
  id: 'trip-demo-3',
  title: 'Cameron Highlands Tea Tour',
  city: 'Cameron Highlands',
  status: 'negotiating',
  estimatedPriceRange: { min: 280, max: 320 },
  servicesNeeded: ['driver', 'guide'],
}

// Offer 3 (Round 3 - FINAL, Must Decide)
{
  id: 'offer-demo-3',
  tripId: 'trip-demo-3',
  supplierName: 'John (Guide)',
  price: 300,
  round: 3,
  status: 'pending',
  notes: 'FINAL OFFER: Includes tea tasting and lunch',
  isPriceMatch: 'good',
}
```

#### 2. Negotiation UI Updates (**NEEDED**)

**My Trips - Offers View:**
```tsx
<TripCard>
  <TripInfo>
    <Title>KL Sightseeing + Food Tour</Title>
    <Status>3 Offers Received</Status>
  </TripInfo>
  
  <OffersSection>
    <OfferCard>
      <SupplierInfo>
        <Avatar />
        <Name>Ahmad (Driver)</Name>
        <Rating>4.8 ⭐</Rating>
      </SupplierInfo>
      <NegotiationStatus>
        <Round>Round 1/3</Round>
        <Status>Waiting for your response</Status>
      </NegotiationStatus>
      <PriceComparison>
        <YourBudget>Your Budget: RM 300-400</YourBudget>
        <TheirOffer isPriceMatch="fair">Their Offer: RM 380</TheirOffer>
        <Indicator>Fair Price</Indicator>
      </PriceComparison>
      <Actions>
        <AcceptButton>Accept RM 380</AcceptButton>
        <CounterButton>Counter Offer</CounterButton>
        <DeclineButton>Decline</DeclineButton>
      </Actions>
    </OfferCard>
  </OffersSection>
</TripCard>
```

---

### Priority 4: Interactive Prototype Behavior

#### 1. State Synchronization (**CRITICAL**)

Ensure when traveler posts request, it immediately appears in supplier view:

```typescript
// In publishTripRequest method
const publishTripRequest = (tripPlan: TripPlan) => {
  const trip = createTripFromPlan(tripPlan);
  
  // Add to global trips (visible to suppliers)
  setTrips(prev => [trip, ...prev]);
  
  // Add to traveler's my trips
  setMyTrips(prev => [trip, ...prev]);
  
  // Simulate notification to matching suppliers
  const matchingSuppliers = getMatchingSuppliers(trip.servicesNeeded);
  matchingSuppliers.forEach(supplierId => {
    addNotification({
      userId: supplierId,
      type: 'new_offer',
      title: 'New Trip Request',
      message: `New request in ${trip.city} matches your services`,
      link: `/supplier/operations`,
      read: false,
    });
  });
  
  return trip.id;
};
```

#### 2. Offer Submission Flow (**UPDATE**)

When supplier submits offer:
1. Add offer to global offers array
2. Update trip status to 'negotiating' if first offer
3. Notify traveler
4. Increment offer count on trip

#### 3. Accept Offer Flow (**UPDATE**)

When traveler accepts:
1. Update offer status to 'accepted'
2. Decline all other offers automatically
3. Update trip status to 'price_locked'
4. Navigate to booking/payment
5. Notify supplier

---

## 📊 Sample Data Requirements

### Activities (20+ needed)

**Kuala Lumpur (10):**
- ✅ Petronas Towers (sightseeing)
- ✅ Batu Caves (cultural)
- ✅ Jalan Alor Food Tour (food)
- ✅ KL Forest Eco Park (nature)
- ✅ Aquaria KLCC (sightseeing)
- 🔄 Chinatown Heritage Walk (cultural)
- 🔄 Cooking Class (food)
- 🔄 KL Tower (sightseeing)
- 🔄 Shopping at Pavilion (shopping)
- 🔄 Night Market Experience (food + shopping)

**Penang (6):**
- 🔄 George Town Street Art Tour
- 🔄 Penang Hill Cable Car
- 🔄 Kek Lok Si Temple
- 🔄 Hawker Food Tour
- 🔄 Tropical Spice Garden
- 🔄 Beach Activities

**Langkawi (5):**
- ✅ Scuba Diving (water_sports)
- 🔄 Island Hopping
- 🔄 Cable Car + Sky Bridge
- 🔄 Mangrove Tour
- 🔄 Beach BBQ

**Cameron Highlands (4):**
- 🔄 Tea Plantation Tour
- 🔄 Strawberry Farm
- 🔄 Jungle Trekking
- 🔄 Butterfly Farm

---

## 🎯 Implementation Priority Order

### Week 1: Core Flow
1. ✅ TravelerHome (destination selection)
2. ✅ DiscoverActivities (browse activities)
3. **ActivityDetails** (view full details)
4. **TripPlan** (shopping cart + checkout)
5. **AppContext methods** (add/remove activities, publish request)

### Week 2: Supplier Integration
6. **Supplier service selection** (during registration)
7. **Supplier Operations filtering** (by service type)
8. **Offer submission** (with service details)
9. **Interactive state sync** (requests appear in supplier view)

### Week 3: Negotiation & Polish
10. **Negotiation demo data** (all 3 rounds)
11. **My Trips offer management** (compare, accept, counter)
12. **Counter offer UI** (both sides)
13. **Navigation polish** (all arrows work)

### Week 4: Testing & Data
14. **Add 20+ activities** across all cities
15. **Test complete flow** (destination → activities → plan → post → offer → negotiate → book)
16. **Fix navigation issues**
17. **Add loading states**
18. **Polish UI/UX**

---

## ✅ Current Status

**Completed:** 25%
- ✅ Type system updated
- ✅ TravelerHome (destination selection)
- ✅ DiscoverActivities (browse + categories)
- ✅ Routes configured
- ✅ 6 sample activities created

**In Progress:** 0%
- 🔄 ActivityDetails screen
- 🔄 TripPlan screen
- 🔄 AppContext methods

**Not Started:** 75%
- ❌ Supplier service selection
- ❌ Offer-request matching
- ❌ Interactive prototype behavior
- ❌ Negotiation flow enhancement
- ❌ More sample data

---

## 📝 Next Immediate Steps

1. **Create ActivityDetails.tsx** - View full activity information
2. **Create TripPlan.tsx** - Shopping cart and checkout
3. **Update AppContext** - Add cart management methods
4. **Add route for ActivityDetails** - `/traveler/activity/:activityId`
5. **Add route for TripPlan** - `/traveler/trip-plan`
6. **Test navigation flow** - Destination → Discover → Details → Plan
7. **Create 15+ more activities** - Cover all cities and categories

---

**Last Updated:** March 4, 2026
**Status:** Phase 1 Complete, Starting Phase 2
