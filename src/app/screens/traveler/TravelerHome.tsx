import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import PackageCard from '../../components/design-system/PackageCard';
import { Search, MapPin, ChevronRight, ShoppingCart, Send, Plus, Compass, X, Bot, Sparkles } from 'lucide-react';
import { Activity } from '../../types';

type HomeView = 'all' | 'supplier' | 'recommended' | 'ai';

type RecommendedTrip = {
  id: string;
  title: string;
  city: string;
  country: string;
  activities: Activity[];
  totalPrice: number;
  totalDuration: number;
};

type RecommendedPlace = {
  name: string;
  vibe: string;
  idealFor: string;
  duration: string;
  estimatedBudget: string;
  note: string;
};

type AIPlanOption = {
  id: string;
  title: string;
  city: string;
  country: string;
  days: number;
  estimatedCost: number;
  source: 'supplier' | 'curated';
  highlights: string[];
  packageIds: string[];
  activityIds: string[];
};

type AIChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  plans?: AIPlanOption[];
};

const DEFAULT_RECOMMENDED_PLACES: RecommendedPlace[] = [
  {
    name: 'Local Heritage Walk',
    vibe: 'Culture + city stories',
    idealFor: 'First-time visitors',
    duration: '2-3 hours',
    estimatedBudget: 'RM 80-120',
    note: 'Best started before 10:00 AM to avoid crowds.',
  },
  {
    name: 'Sunset Viewpoint District',
    vibe: 'Scenic and relaxed',
    idealFor: 'Couples and photographers',
    duration: '90 minutes',
    estimatedBudget: 'RM 40-70',
    note: 'Carry light layers; evenings can be windy.',
  },
  {
    name: 'Night Street Food Loop',
    vibe: 'Food + local buzz',
    idealFor: 'Families and food lovers',
    duration: '2 hours',
    estimatedBudget: 'RM 60-100',
    note: 'Go after 7:00 PM for full vendor options.',
  },
];

const RECOMMENDED_PLACES_BY_CITY: Record<string, RecommendedPlace[]> = {
  'kuala lumpur': [
    {
      name: 'Merdeka Heritage Core',
      vibe: 'History and architecture',
      idealFor: 'Culture-focused travelers',
      duration: '2.5 hours',
      estimatedBudget: 'RM 90-140',
      note: 'Combine with a nearby museum for a half-day plan.',
    },
    {
      name: 'Bukit Bintang Evening Strip',
      vibe: 'Urban energy',
      idealFor: 'Friends and couples',
      duration: '2 hours',
      estimatedBudget: 'RM 100-180',
      note: 'Best between 6:30 PM and 9:30 PM.',
    },
    {
      name: 'KL Lake Garden Route',
      vibe: 'Nature in the city',
      idealFor: 'Families',
      duration: '2-3 hours',
      estimatedBudget: 'RM 50-90',
      note: 'Great for morning sessions with light walking.',
    },
  ],
  tokyo: [
    {
      name: 'Asakusa Old Town Circle',
      vibe: 'Traditional Tokyo',
      idealFor: 'History and food lovers',
      duration: '3 hours',
      estimatedBudget: 'RM 120-190',
      note: 'Start early to capture quieter temple views.',
    },
    {
      name: 'Shibuya Creative Blocks',
      vibe: 'Modern city culture',
      idealFor: 'Young travelers',
      duration: '2 hours',
      estimatedBudget: 'RM 110-170',
      note: 'Perfect for late afternoon to evening plans.',
    },
    {
      name: 'Ueno Park & Museum Lane',
      vibe: 'Green and educational',
      idealFor: 'Families and solo travelers',
      duration: '2.5 hours',
      estimatedBudget: 'RM 90-160',
      note: 'Allow extra time during weekend festivals.',
    },
  ],
  bangkok: [
    {
      name: 'Rattanakosin Riverside Run',
      vibe: 'Temples + river views',
      idealFor: 'Culture and photo enthusiasts',
      duration: '2-3 hours',
      estimatedBudget: 'RM 80-130',
      note: 'Wear breathable clothing for midday heat.',
    },
    {
      name: 'Siam Urban Discovery',
      vibe: 'Shopping and lifestyle',
      idealFor: 'Friends and couples',
      duration: '2 hours',
      estimatedBudget: 'RM 120-220',
      note: 'Plan indoor breaks during peak sun hours.',
    },
    {
      name: 'Yaowarat Night Food Route',
      vibe: 'Street food adventure',
      idealFor: 'Food-focused groups',
      duration: '2 hours',
      estimatedBudget: 'RM 90-150',
      note: 'Arrive after 7:00 PM for full street activation.',
    },
  ],
};

export default function TravelerHome() {
  const navigate = useNavigate();
  const {
    user,
    notifications,
    packages,
    countries,
    cities,
    activities,
    tripPlan,
    createTripPlan,
    addActivityToPlan,
    updateTripPlan,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [view, setView] = useState<HomeView>('all');
  const [activeTripDetails, setActiveTripDetails] = useState<RecommendedTrip | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([
    {
      id: 'ai-welcome',
      role: 'assistant',
      text: 'How can we make the Trip you like happen? Ask for plans, places, or activity ideas and I will build a sample itinerary from our listed destinations and supplier packages.',
    },
  ]);

  if (!user) return null;

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const citiesForCountry = selectedCountry
    ? cities.filter((city) => city.country === selectedCountry)
    : [];

  const citySlug = (cityName: string) => cityName.toLowerCase().trim().replace(/\s+/g, '-');

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const byCountry = selectedCountry ? pkg.country === selectedCountry : true;
      const byCity = selectedCity ? pkg.city === selectedCity : true;
      const bySearch = searchQuery.trim()
        ? [pkg.title, pkg.description, pkg.city, pkg.country].join(' ').toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return byCountry && byCity && bySearch;
    });
  }, [packages, selectedCountry, selectedCity, searchQuery]);

  const filteredRecommendedActivities = useMemo(() => {
    return activities
      .filter((activity) => {
        const byCountry = selectedCountry ? activity.country === selectedCountry : true;
        const byCity = selectedCity ? activity.city === selectedCity : true;
        const bySearch = searchQuery.trim()
          ? [activity.name, activity.title, activity.description, activity.city, activity.country]
              .join(' ')
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true;
        return byCountry && byCity && bySearch;
      })
      .slice(0, 24);
  }, [activities, selectedCountry, selectedCity, searchQuery]);

  const recommendedTrips = useMemo<RecommendedTrip[]>(() => {
    const grouped = new Map<string, Activity[]>();
    filteredRecommendedActivities.forEach((activity) => {
      const key = `${activity.country}-${activity.city}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(activity);
    });

    return Array.from(grouped.values())
      .filter((group) => group.length >= 2)
      .slice(0, 8)
      .map((group, index) => {
        const city = group[0].city;
        const country = group[0].country || 'Malaysia';
        const picked = group.slice(0, 3);
        const totalPrice = picked.reduce((sum, item) => sum + item.estimatedPrice, 0);
        const totalDuration = picked.reduce((sum, item) => sum + item.duration, 0);

        return {
          id: `rec-trip-${citySlug(city)}-${index + 1}`,
          title: `${city} Curated Starter Route`,
          city,
          country,
          activities: picked,
          totalPrice,
          totalDuration,
        };
      });
  }, [filteredRecommendedActivities]);

  const getRecommendedPlaces = (city: string): RecommendedPlace[] => {
    return RECOMMENDED_PLACES_BY_CITY[city.toLowerCase()] || DEFAULT_RECOMMENDED_PLACES;
  };

  const popularSupplierTrips = filteredPackages.slice(0, 6);
  const recommendedSupplierTrips = filteredPackages.slice(6, 12);

  const handlePackageClick = (pkg: typeof packages[number]) => {
    navigate(`/traveler/package/${pkg.id}`, { state: { package: pkg } });
  };

  const addRecommendedToPlan = (activity: Activity) => {
    if (!tripPlan || tripPlan.city !== activity.city) {
      createTripPlan(activity.city);
      updateTripPlan({
        requestTitle: `${activity.city} Personal Plan`,
        city: activity.city,
        country: activity.country,
      });
    }
    addActivityToPlan(activity);
    navigate('/traveler/trip-plan?step=2');
  };

  const requestFromRecommended = (activity: Activity) => {
    if (!tripPlan || tripPlan.city !== activity.city) {
      createTripPlan(activity.city);
    }
    addActivityToPlan(activity);
    updateTripPlan({
      requestTitle: `Request for ${activity.title || activity.name}`,
      city: activity.city,
      country: activity.country,
    });
    navigate('/traveler/trip-plan?step=3');
  };

  const syncRecommendedTripToPlan = (trip: RecommendedTrip) => {
    if (!tripPlan || tripPlan.city !== trip.city) {
      createTripPlan(trip.city);
    }

    trip.activities.forEach((activity) => addActivityToPlan(activity));
    updateTripPlan({
      requestTitle: trip.title,
      city: trip.city,
      country: trip.country,
    });
  };

  const checkoutRecommendedTrip = (trip: RecommendedTrip) => {
    syncRecommendedTripToPlan(trip);
    navigate('/traveler/trip-plan?step=3');
  };

  const openRecommendedTripDetails = (trip: RecommendedTrip) => {
    setActiveTripDetails(trip);
  };

  const openTripPlan = () => {
    navigate('/traveler/trip-plan');
  };

  const parseRequestedDays = (query: string): number => {
    const matched = query.match(/(\d+)\s*day/i);
    if (!matched) return 3;
    return Math.min(14, Math.max(1, Number(matched[1])));
  };

  const inferQueryCity = (query: string): string => {
    const normalized = query.toLowerCase();
    const matchedCity = cities.find((entry) => normalized.includes(entry.name.toLowerCase()));
    if (matchedCity) return matchedCity.name;
    if (selectedCity) return selectedCity;
    if (tripPlan?.city) return tripPlan.city;
    return 'Kuala Lumpur';
  };

  const inferCountryByCity = (city: string): string => {
    return cities.find((entry) => entry.name.toLowerCase() === city.toLowerCase())?.country || selectedCountry || 'Malaysia';
  };

  const buildAIPlans = (query: string): AIPlanOption[] => {
    const requestedDays = parseRequestedDays(query);
    const targetCity = inferQueryCity(query);
    const targetCountry = inferCountryByCity(targetCity);

    const cityPackages = packages
      .filter((pkg) => pkg.city.toLowerCase() === targetCity.toLowerCase())
      .slice(0, 3);

    const cityActivities = activities
      .filter((activity) => activity.city.toLowerCase() === targetCity.toLowerCase())
      .slice(0, 9);

    const packagePlans = cityPackages.map((pkg, idx) => ({
      id: `ai-supplier-plan-${pkg.id}`,
      title: `${requestedDays}D ${targetCity} Supplier Plan ${idx + 1}`,
      city: targetCity,
      country: targetCountry,
      days: requestedDays,
      estimatedCost: Math.round(pkg.price * Math.max(1, requestedDays / 2)),
      source: 'supplier' as const,
      highlights: [
        pkg.title,
        `Supplier: ${pkg.supplierName}`,
        `${pkg.duration} format`,
      ],
      packageIds: [pkg.id],
      activityIds: [],
    }));

    const curatedPlans = [0, 1].map((index) => {
      const selectedActivities = cityActivities.slice(index * 3, index * 3 + 3);
      return {
        id: `ai-curated-plan-${targetCity.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
        title: `${requestedDays}D ${targetCity} Curated Plan ${index + 1}`,
        city: targetCity,
        country: targetCountry,
        days: requestedDays,
        estimatedCost: selectedActivities.reduce((sum, item) => sum + item.estimatedPrice, 0),
        source: 'curated' as const,
        highlights: selectedActivities.map((item) => item.title || item.name).slice(0, 3),
        packageIds: [],
        activityIds: selectedActivities.map((item) => item.id),
      };
    });

    return [...packagePlans, ...curatedPlans].slice(0, 3);
  };

  const handleAskAI = (promptText: string) => {
    const prompt = promptText.trim();
    if (!prompt) return;

    const plans = buildAIPlans(prompt);
    const targetCity = inferQueryCity(prompt);
    const assistantText = `I prepared ${plans.length} sample option(s) for ${targetCity}. These are demo AI suggestions based on listed destinations and supplier packages in your app.`;

    setAiMessages((prev) => [
      ...prev,
      {
        id: `ai-user-${Date.now()}`,
        role: 'user',
        text: prompt,
      },
      {
        id: `ai-assistant-${Date.now() + 1}`,
        role: 'assistant',
        text: assistantText,
        plans,
      },
    ]);

    setAiPrompt('');
  };

  const checkoutAIPlan = (plan: AIPlanOption) => {
    if (!tripPlan || tripPlan.city !== plan.city) {
      createTripPlan(plan.city);
    }

    const selectedPlanActivities = activities.filter((activity) => plan.activityIds.includes(activity.id));
    selectedPlanActivities.forEach((activity) => addActivityToPlan(activity));

    const selectedPlanPackages = packages.filter((pkg) => plan.packageIds.includes(pkg.id));

    updateTripPlan({
      requestTitle: plan.title,
      city: plan.city,
      country: plan.country,
      selectedPackages: selectedPlanPackages,
      estimatedBudget: plan.estimatedCost,
    });

    navigate('/traveler/trip-plan?step=3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 pb-20">
      <Header
        title="Traveler Home"
        showMenu
        onMenuClick={() => setSidebarOpen(true)}
        showNotifications
        notificationCount={unreadNotifications}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user.role}
        userName={user.name}
        userAvatar={user.avatar}
        userRating={user.rating}
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-orange-600 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Plan Your Next Trip</h1>
          <p className="text-orange-100 mb-5">Select destination first, then book supplier trips or build a custom request.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-orange-100 mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity('');
                }}
                className="w-full rounded-xl border border-white/30 bg-white/90 text-gray-900 px-3 py-3"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-orange-100 mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/90 text-gray-900 px-3 py-3"
              >
                <option value="">All Cities</option>
                {(selectedCountry ? citiesForCountry : cities).map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setView('supplier')}
                className={`rounded-xl py-2.5 font-semibold ${view === 'supplier' ? 'bg-white text-blue-700' : 'bg-blue-900/30 text-white border border-orange-200/50'}`}
            >
              Ready Trip/Activity Packages
            </button>
            <button
              onClick={() => setView('recommended')}
                className={`rounded-xl py-2.5 font-semibold ${view === 'recommended' ? 'bg-white text-orange-600' : 'bg-blue-900/30 text-white border border-orange-200/50'}`}
            >
              Recommendations
            </button>
            <button
              onClick={() => setView('ai')}
              className={`rounded-xl py-2.5 font-semibold flex items-center justify-center gap-2 ${view === 'ai' ? 'bg-white text-blue-700' : 'bg-blue-900/30 text-white border border-orange-200/50'}`}
            >
              <Bot className="w-4 h-4" /> AI
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-blue-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search trips, activities, destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-200 text-gray-900"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-white via-blue-50 to-orange-50 rounded-2xl p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                Custom Request Cart
              </h2>
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">
                {tripPlan?.selectedActivities.length || 0} selected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-3">
              <div className="rounded-lg bg-white p-2 border border-blue-100">
                <p className="text-gray-500">Title</p>
                <p className="font-semibold text-gray-900 truncate">{tripPlan?.requestTitle || 'Not set'}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-blue-100">
                <p className="text-gray-500">Destination</p>
                <p className="font-semibold text-gray-900">{tripPlan?.city || selectedCity || 'Not selected'}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-orange-100">
                <p className="text-gray-500">Estimated Cost</p>
                <p className="font-semibold text-gray-900">RM {tripPlan?.totalEstimatedCost || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={openTripPlan}
                className="w-full py-3 rounded-lg border border-blue-600 text-blue-700 font-bold hover:bg-blue-50 flex items-center justify-center gap-2 sm:col-span-2"
              >
                <Send className="w-4 h-4" /> Review & Upload Request
              </button>
            </div>
          </div>

          {(view === 'all' || view === 'supplier') && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-blue-900">Supplier Published Trips</h2>
                  <span className="text-sm text-gray-500">Book immediately</span>
                </div>
                {popularSupplierTrips.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                    <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-900">No supplier trips found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {popularSupplierTrips.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} onClick={() => handlePackageClick(pkg)} />
                    ))}
                  </div>
                )}
              </div>

              {recommendedSupplierTrips.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-blue-900">More Supplier Options</h2>
                    <button className="text-blue-600 text-sm font-semibold flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {recommendedSupplierTrips.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} onClick={() => handlePackageClick(pkg)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {(view === 'all' || view === 'recommended') && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-orange-700">Platform Recommended Trips</h2>
                  <span className="text-sm text-gray-500">Curated by TripuLike</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {recommendedTrips.map((trip) => (
                    <div key={trip.id} className="bg-white border border-orange-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{trip.title}</h3>
                          <p className="text-sm text-gray-600">{trip.city}, {trip.country}</p>
                          <p className="text-xs text-blue-700 mt-1 font-semibold">Includes {trip.activities.length} curated activities</p>
                        </div>
                        <span className="text-sm font-bold text-orange-600">RM {trip.totalPrice}</span>
                      </div>
                      <div className="mt-3 text-xs text-gray-600">
                        Duration: {Math.floor(trip.totalDuration / 60)}h {trip.totalDuration % 60}m
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        <button
                          onClick={() => checkoutRecommendedTrip(trip)}
                          className="py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                        >
                          Checkout & Request
                        </button>
                        <button
                          onClick={() => openRecommendedTripDetails(trip)}
                          className="py-2 rounded-lg border border-blue-200 text-blue-700 font-semibold hover:bg-blue-50"
                        >
                          View Plan Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {activeTripDetails && (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-blue-900">View Trip Details Panel</h3>
                        <p className="text-sm text-gray-700">{activeTripDetails.title} • {activeTripDetails.city}, {activeTripDetails.country}</p>
                      </div>
                      <button
                        onClick={() => setActiveTripDetails(null)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white"
                        aria-label="Close trip details"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="rounded-lg bg-white border border-blue-100 p-3">
                        <p className="text-gray-500">Activities</p>
                        <p className="font-bold text-blue-900">{activeTripDetails.activities.length}</p>
                      </div>
                      <div className="rounded-lg bg-white border border-orange-100 p-3">
                        <p className="text-gray-500">Estimated Cost</p>
                        <p className="font-bold text-orange-700">RM {activeTripDetails.totalPrice}</p>
                      </div>
                      <div className="rounded-lg bg-white border border-blue-100 p-3">
                        <p className="text-gray-500">Total Duration</p>
                        <p className="font-bold text-blue-900">{Math.floor(activeTripDetails.totalDuration / 60)}h {activeTripDetails.totalDuration % 60}m</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-orange-700 mb-2">Recommended Places (Sample Dummy Data)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {getRecommendedPlaces(activeTripDetails.city).map((place) => (
                          <div key={place.name} className="rounded-xl bg-white border border-gray-200 p-3">
                            <p className="font-semibold text-blue-900">{place.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{place.vibe}</p>
                            <div className="mt-2 space-y-1 text-xs text-gray-700">
                              <p><span className="font-semibold text-orange-700">Ideal for:</span> {place.idealFor}</p>
                              <p><span className="font-semibold text-orange-700">Duration:</span> {place.duration}</p>
                              <p><span className="font-semibold text-orange-700">Budget:</span> {place.estimatedBudget}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{place.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => checkoutRecommendedTrip(activeTripDetails)}
                        className="py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
                      >
                        Checkout & Request
                      </button>
                      <button
                        onClick={() => {
                          syncRecommendedTripToPlan(activeTripDetails);
                          navigate('/traveler/trip-plan?step=2');
                        }}
                        className="py-2 rounded-lg border border-blue-600 text-blue-700 font-semibold hover:bg-blue-50"
                      >
                        Review in Request Builder
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-orange-700">Recommended Activities</h2>
                  <span className="text-sm text-gray-500">Request service from suppliers</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {filteredRecommendedActivities.map((activity) => (
                    <div key={activity.id} className="bg-white border border-blue-200 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{activity.title || activity.name}</h3>
                          <p className="text-sm text-gray-600">{activity.city}, {activity.country}</p>
                          <p className="text-xs text-gray-500 mt-1">Platform recommendation • {activity.category.replace('_', ' ')}</p>
                        </div>
                        <span className="text-sm font-bold text-blue-700">RM {activity.estimatedPrice}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {activity.highlights.slice(0, 3).map((highlight) => (
                          <span key={highlight} className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">{highlight}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                        <button
                          onClick={() => addRecommendedToPlan(activity)}
                          className="py-2 rounded-lg border border-blue-600 text-blue-700 font-semibold hover:bg-blue-50 flex items-center justify-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add to Plan
                        </button>
                        <button
                          onClick={() => requestFromRecommended(activity)}
                          className="py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
                        >
                          Request Trip
                        </button>
                        <button
                          onClick={() => navigate(`/traveler/activity/${activity.id}`, { state: { activity, destination: { name: activity.city, id: citySlug(activity.city) } } })}
                          className="py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {view === 'ai' && (
            <div className="bg-white rounded-3xl border border-blue-200 shadow-sm overflow-hidden">
              <div className="bg-[radial-gradient(circle_at_top_left,_#1d4ed8,_#1e3a8a_45%,_#ea580c_100%)] p-5 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> AI Trip Assistant
                </h2>
                <p className="text-sm text-orange-100 mt-1">How can we make the Trip you like happen?</p>
              </div>

              <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto bg-[linear-gradient(145deg,_rgba(219,234,254,0.5),_rgba(255,237,213,0.5))]">
                {aiMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[92%] rounded-2xl p-3 ${message.role === 'user' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-orange-200 text-gray-900 shadow-sm'}`}>
                      <p className="text-sm">{message.text}</p>

                      {message.plans && message.plans.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.plans.map((plan) => (
                            <div key={plan.id} className="rounded-2xl border border-blue-200 bg-white p-3 shadow-sm">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-blue-900">{plan.title}</p>
                                  <p className="text-xs text-gray-700">{plan.city}, {plan.country} • {plan.days} day(s)</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${plan.source === 'supplier' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {plan.source === 'supplier' ? 'Supplier-based' : 'Curated'}
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-gray-700 space-y-1 bg-blue-50/60 border border-blue-100 rounded-xl p-2">
                                {plan.highlights.map((highlight) => (
                                  <p key={highlight}>- {highlight}</p>
                                ))}
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <p className="text-sm font-bold text-orange-700">RM {plan.estimatedCost}</p>
                                <button
                                  onClick={() => checkoutAIPlan(plan)}
                                  className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
                                >
                                  Checkout & Request Trip
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-blue-100 bg-white space-y-2">
                <div className="flex flex-wrap gap-2">
                  {[
                    'Give me plans for 3 days trip in KL',
                    'Recommend common places in Tokyo for 2 days',
                    'Suggest family activities in Bangkok',
                  ].map((samplePrompt) => (
                    <button
                      key={samplePrompt}
                      onClick={() => handleAskAI(samplePrompt)}
                      className="px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-xs font-semibold hover:bg-orange-100"
                    >
                      {samplePrompt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask for places, recommendations, or full trip plans..."
                    className="flex-1 px-3 py-3 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAskAI(aiPrompt)}
                    className="px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                  >
                    Ask AI
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">Demo view only: AI responses are mock suggestions for presentation and testing.</p>
              </div>
            </div>
          )}

          {filteredPackages.length === 0 && filteredRecommendedActivities.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <Compass className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">No results for this destination</p>
              <p className="text-sm text-gray-600">Try changing country/city or search query.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
