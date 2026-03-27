import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Plus, ShoppingCart, MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { Activity, ActivityCategory } from '../../types';

export default function DiscoverActivities() {
  const navigate = useNavigate();
  const { cityId } = useParams<{ cityId: string }>();
  const location = useLocation();
  const { tripPlan, activities, addActivityToPlan, createTripPlan } = useApp();
  
  const destination = location.state?.destination || { name: cityId, id: cityId };
  
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');

  // Categories
  const categories: { id: ActivityCategory | 'all'; icon: string; label: string }[] = [
    { id: 'all', icon: '🌟', label: 'All' },
    { id: 'sightseeing', icon: '🏛️', label: 'Sightseeing' },
    { id: 'adventure', icon: '🏔️', label: 'Adventure' },
    { id: 'cultural', icon: '🎭', label: 'Cultural' },
    { id: 'food', icon: '🍜', label: 'Food' },
    { id: 'nature', icon: '🌿', label: 'Nature' },
    { id: 'water_sports', icon: '🏄', label: 'Water Sports' },
  ];

  const cityName = destination?.name || cityId || '';
  const cityActivities = activities.filter((activity) => activity.city.toLowerCase() === cityName.toLowerCase());
  const filteredActivities = selectedCategory === 'all'
    ? cityActivities
    : cityActivities.filter((act) => act.category === selectedCategory);

  const cartCount = tripPlan?.selectedActivities.length || 0;

  const handleAddToCart = (activity: Activity) => {
    if (!tripPlan) {
      createTripPlan(activity.city);
    }
    addActivityToPlan(activity);
  };

  const handleViewDetails = (activity: Activity) => {
    navigate(`/traveler/activity/${activity.id}`, { state: { activity, destination } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-900">{destination.name}</h1>
            <p className="text-sm text-gray-600">{filteredActivities.length} activities</p>
          </div>
          <button
            onClick={() => navigate('/traveler/trip-plan')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6 text-gray-900" />
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </div>
            )}
          </button>
        </div>

        {/* Categories */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600 text-sm">Try selecting a different category</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all"
            >
              {/* Activity Image */}
              <div className="relative h-48">
                <img
                  src={activity.images[0]}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                    {categories.find(c => c.id === activity.category)?.icon} {categories.find(c => c.id === activity.category)?.label}
                  </span>
                </div>
                {activity.difficulty && (
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      activity.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      activity.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Activity Details */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{activity.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>

                {/* Info Row */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{activity.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>RM {activity.estimatedPrice}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{activity.rating} ({activity.reviewCount})</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {activity.highlights.slice(0, 3).map((highlight, idx) => (
                    <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      ✓ {highlight}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(activity)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(activity)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate('/traveler/trip-plan')}
              className="w-full px-6 py-4 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
            >
              Checkout My Trip ({cartCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
