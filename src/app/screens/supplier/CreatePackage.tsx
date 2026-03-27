import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import { MapPin, Plus, X, DollarSign, ChevronDown } from 'lucide-react';
import { ItineraryDay, Package } from '../../types';

export default function CreatePackage() {
  const navigate = useNavigate();
  const { user, createPackage, countries, cities } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // SECTION 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // SECTION 2: Destination
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const citiesForCountry = country ? cities.filter(c => c.country === country) : [];

  // SECTION 3: Pricing
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');

  // SECTION 4: Services
  const [includedServices, setIncludedServices] = useState<string[]>([]);
  const serviceOptions = ['accommodation', 'meals', 'transportation', 'guide', 'activities', 'equipment'];

  // SECTION 5: Itinerary (Day-based)
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { day: 1, title: 'Day 1', description: '', activities: [], duration: '8 hours' }
  ]);

  // SECTION 6: Inclusions
  const [included, setIncluded] = useState<string[]>(['']);

  // SECTION 7: Exclusions
  const [notIncluded, setNotIncluded] = useState<string[]>(['']);

  // SECTION 8: Meeting/Dropoff Points
  const [meetingPoint, setMeetingPoint] = useState('');
  const [dropoffPoint, setDropoffPoint] = useState('');

  // SECTION 9: Images
  const [images, setImages] = useState<string[]>(['']);

  // SECTION 10: Requirements
  const [requirements, setRequirements] = useState('');

  // SECTION 11: Cancellation Policy
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [groupSizeMin, setGroupSizeMin] = useState('1');
  const [groupSizeMax, setGroupSizeMax] = useState('10');
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'challenging'>('easy');

  // Role-based Access Control
  if (!user || user.role === 'traveler') {
    navigate('/');
    return null;
  }

  // TRANSLATOR CANNOT CREATE PACKAGES
  if (user.role === 'translator') {
    navigate('/supplier/services');
    return null;
  }

  const sections = [
    { id: 0, label: '📝 Basic Info', icon: '1️⃣' },
    { id: 1, label: '🌍 Destination', icon: '2️⃣' },
    { id: 2, label: '💰 Pricing', icon: '3️⃣' },
    { id: 3, label: '🎯 Services', icon: '4️⃣' },
    { id: 4, label: '📅 Itinerary', icon: '5️⃣' },
    { id: 5, label: '✅ Included', icon: '6️⃣' },
    { id: 6, label: '❌ Excluded', icon: '7️⃣' },
    { id: 7, label: '📍 Meeting Points', icon: '8️⃣' },
    { id: 8, label: '🖼️ Images', icon: '9️⃣' },
    { id: 9, label: '⚠️ Requirements', icon: '🔟' },
    { id: 10, label: '📋 Cancellation', icon: '1️⃣1️⃣' },
  ];

  const validateSection = (sectionId: number): boolean => {
    switch (sectionId) {
      case 0:
        return title.trim() !== '' && description.trim() !== '';
      case 1:
        return country !== '' && city !== '';
      case 2:
        return price !== '' && parseInt(price) > 0;
      case 3:
        return includedServices.length > 0;
      case 4:
        return itinerary.length > 0 && itinerary.every(d => d.title && d.duration);
      case 5:
        return included.filter(i => i.trim()).length > 0;
      case 6:
        return notIncluded.filter(i => i.trim()).length > 0;
      case 7:
        return meetingPoint.trim() !== '' && dropoffPoint.trim() !== '';
      case 8:
        return images.filter(i => i.trim()).length > 0;
      case 9:
        return true; // Optional
      case 10:
        return cancellationPolicy.trim() !== '';
      default:
        return true;
    }
  };

  const handleAddDay = () => {
    const newDay: ItineraryDay = {
      day: Math.max(...itinerary.map(d => d.day), 0) + 1,
      title: `Day ${Math.max(...itinerary.map(d => d.day), 0) + 1}`,
      description: '',
      activities: [],
      duration: '8 hours'
    };
    setItinerary([...itinerary, newDay]);
  };

  const handleRemoveDay = (dayNum: number) => {
    if (itinerary.length > 1) {
      setItinerary(itinerary.filter(d => d.day !== dayNum));
    } else {
      alert('At least one day is required');
    }
  };

  const handleUpdateItineraryDay = (dayNum: number, updates: Partial<ItineraryDay>) => {
    setItinerary(itinerary.map(d => (d.day === dayNum ? { ...d, ...updates } : d)));
  };

  const handleSubmit = () => {
    // Validate all sections
    for (let i = 0; i < sections.length; i++) {
      if (!validateSection(i)) {
        alert(`Please complete Section ${i + 1}: ${sections[i].label}`);
        setActiveSection(i);
        return;
      }
    }

    const packageData: Omit<Package, 'id' | 'createdAt'> = {
      supplierId: user.id,
      supplierName: user.name,
      supplierRole: user.role,
      supplierRating: user.rating || 0,
      supplierReviewCount: user.reviewCount || 0,
      supplierAvatar: user.avatar,
      title,
      description,
      country,
      city,
      price: parseFloat(price),
      currency,
      duration: `${itinerary.length} days`,
      durationUnit: 'days',
      groupSizeMin: parseInt(groupSizeMin),
      groupSizeMax: parseInt(groupSizeMax),
      category: user.role === 'driver' ? 'transport' : 'activities',
      difficulty,
      includedServices: includedServices as any,
      itinerary,
      included: included.filter(i => i.trim()),
      notIncluded: notIncluded.filter(i => i.trim()),
      meetingPoint,
      dropoffPoint,
      images: images.filter(i => i.trim()),
      requirements: requirements.trim() || undefined,
      cancellationPolicy,
      highlights: [],
      tags: [],
      bookings: 0,
      rating: 0,
      reviews: [],
    };

    try {
      createPackage(packageData);
      navigate('/supplier/packages');
    } catch (error) {
      alert('Error creating package: ' + (error as any).message);
    }
  };

  const unreadNotifications = 3;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Create Package"
        showBack
        onBack={() => navigate('/supplier/packages')}
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

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">📦 Create Traveler-Grade Package</h2>
          <p className="opacity-90">Design a complete travel experience with 11 sections</p>
          <div className="mt-4 text-sm">
            Section {activeSection + 1} of {sections.length}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {sections.map((section, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSection(idx)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  activeSection === idx
                    ? 'bg-blue-600 text-white'
                    : validateSection(idx)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {section.icon} {section.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 1: Basic Info */}
        {activeSection === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">📝 Basic Information</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Package Title *
              </label>
              <input
                type="text"
                placeholder="e.g., 3-Day Bali Diving Adventure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                placeholder="Describe the complete travel experience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* SECTION 2: Destination */}
        {activeSection === 1 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">🌍 Global Destination</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country *
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity(''); // Reset city when country changes
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Country...</option>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {country && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select City...</option>
                  {citiesForCountry.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: Pricing */}
        {activeSection === 2 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">💰 Pricing Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="IDR">IDR</option>
                  <option value="MYR">MYR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Group Size
                </label>
                <input
                  type="number"
                  min="1"
                  value={groupSizeMin}
                  onChange={(e) => setGroupSizeMin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Group Size
                </label>
                <input
                  type="number"
                  min="1"
                  value={groupSizeMax}
                  onChange={(e) => setGroupSizeMax(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Services */}
        {activeSection === 3 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">🎯 Included Services *</h3>
            <p className="text-sm text-gray-600">Select at least one service</p>
            
            <div className="grid grid-cols-2 gap-3">
              {serviceOptions.map(service => (
                <label key={service} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includedServices.includes(service)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setIncludedServices([...includedServices, service]);
                      } else {
                        setIncludedServices(includedServices.filter(s => s !== service));
                      }
                    }}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700 capitalize">{service}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: Itinerary Builder */}
        {activeSection === 4 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">📅 Day-by-Day Itinerary *</h3>
            
            {itinerary.map((day, idx) => (
              <div key={day.day} className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-blue-600">Day {day.day}</h4>
                  {itinerary.length > 1 && (
                    <button
                      onClick={() => handleRemoveDay(day.day)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Beginners Dive Course"
                    value={day.title}
                    onChange={(e) => handleUpdateItineraryDay(day.day, { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Description</label>
                  <textarea
                    placeholder="What happens this day?"
                    value={day.description}
                    onChange={(e) => handleUpdateItineraryDay(day.day, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Activities (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Swimming, Coral reef tour, Photos"
                    value={day.activities.join(', ')}
                    onChange={(e) => handleUpdateItineraryDay(day.day, { activities: e.target.value.split(',').map(a => a.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 8 hours, full day"
                    value={day.duration}
                    onChange={(e) => handleUpdateItineraryDay(day.day, { duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleAddDay}
              className="w-full py-3 border-2 border-dashed border-blue-400 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Another Day
            </button>
          </div>
        )}

        {/* SECTION 6: Inclusions */}
        {activeSection === 5 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">✅ What's Included</h3>
            
            {included.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Inclusion ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const newIncluded = [...included];
                    newIncluded[idx] = e.target.value;
                    setIncluded(newIncluded);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                {included.length > 1 && (
                  <button
                    onClick={() => setIncluded(included.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => setIncluded([...included, ''])}
              className="w-full py-2 border border-blue-300 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Inclusion
            </button>
          </div>
        )}

        {/* SECTION 7: Exclusions */}
        {activeSection === 6 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">❌ What's NOT Included</h3>
            
            {notIncluded.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Exclusion ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const newExcluded = [...notIncluded];
                    newExcluded[idx] = e.target.value;
                    setNotIncluded(newExcluded);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                {notIncluded.length > 1 && (
                  <button
                    onClick={() => setNotIncluded(notIncluded.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => setNotIncluded([...notIncluded, ''])}
              className="w-full py-2 border border-blue-300 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Exclusion
            </button>
          </div>
        )}

        {/* SECTION 8: Meeting & Dropoff Points */}
        {activeSection === 7 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">📍 Meeting & Drop-off Points</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting Point *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g., Kuta Beach Main Entrance"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Drop-off Point *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g., Kuta Beach Main Entrance"
                  value={dropoffPoint}
                  onChange={(e) => setDropoffPoint(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9: Images */}
        {activeSection === 8 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">🖼️ Package Images</h3>
            <p className="text-sm text-gray-600">Add image URLs (minimum 1)</p>
            
            {images.map((img, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={img}
                  onChange={(e) => {
                    const newImages = [...images];
                    newImages[idx] = e.target.value;
                    setImages(newImages);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                {images.length > 1 && (
                  <button
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => setImages([...images, ''])}
              className="w-full py-2 border border-blue-300 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Image
            </button>
          </div>
        )}

        {/* SECTION 10: Requirements */}
        {activeSection === 9 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">⚠️ Requirements</h3>
            <p className="text-sm text-gray-600">Physical, skill, or age requirements (optional)</p>
            
            <textarea
              placeholder="e.g., Must be able to swim, No heart conditions, Age 18+, Bring own snorkel gear"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'moderate' | 'challenging')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
              </select>
            </div>
          </div>
        )}

        {/* SECTION 11: Cancellation Policy */}
        {activeSection === 10 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">📋 Cancellation Policy</h3>
            
            <textarea
              placeholder="e.g., Free cancellation up to 48 hours before. 50% refund 24-48 hours before. No refund within 24 hours."
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => activeSection > 0 && setActiveSection(activeSection - 1)}
            disabled={activeSection === 0}
            className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          {activeSection < sections.length - 1 ? (
            <button
              onClick={() => validateSection(activeSection) && setActiveSection(activeSection + 1)}
              disabled={!validateSection(activeSection)}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/supplier/packages')}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                ✅ Create Package
              </button>
            </>
          )}
        </div>
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
