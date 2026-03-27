import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, Clock, DollarSign, Star, Users, MapPin, Calendar, 
  Info, CheckCircle, AlertCircle, Backpack, Sun, ShoppingCart 
} from 'lucide-react';
import { Activity } from '../../types';

export default function ActivityDetails() {
  const navigate = useNavigate();
  const { activityId } = useParams<{ activityId: string }>();
  const location = useLocation();
  const { addActivityToPlan, tripPlan } = useApp();
  
  const activity: Activity = location.state?.activity;
  const destination = location.state?.destination;
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedToast, setShowAddedToast] = useState(false);

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Activity not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isInPlan = tripPlan?.selectedActivities.some(a => a.id === activity.id);

  const handleAddToPlan = () => {
    addActivityToPlan(activity);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3000);
  };

  const handleGoToCart = () => {
    navigate('/traveler/trip-plan');
  };

  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    challenging: 'bg-red-100 text-red-800',
  };

  const serviceIcons: Record<string, string> = {
    driver: '🚗',
    guide: '🎒',
    translator: '🌐',
    activity_provider: '⚡',
  };

  const serviceLabels: Record<string, string> = {
    driver: 'Driver',
    guide: 'Tour Guide',
    translator: 'Translator',
    activity_provider: 'Activity Provider',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button
            onClick={handleGoToCart}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6 text-gray-900" />
            {tripPlan && tripPlan.selectedActivities.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {tripPlan.selectedActivities.length}
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Image Gallery */}
        <div className="relative">
          <div className="relative h-80 bg-gray-200">
            <img
              src={activity.images[selectedImage]}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
            {/* Image Counter */}
            {activity.images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full">
                {selectedImage + 1} / {activity.images.length}
              </div>
            )}
          </div>
          
          {/* Image Thumbnails */}
          {activity.images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
              {activity.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-blue-600 scale-105' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Title & Rating */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {activity.category === 'sightseeing' && '🏛️'}
                {activity.category === 'adventure' && '🏔️'}
                {activity.category === 'cultural' && '🎭'}
                {activity.category === 'food' && '🍜'}
                {activity.category === 'nature' && '🌿'}
                {activity.category === 'water_sports' && '🏄'}
                {activity.category === 'shopping' && '🛍️'}
                {activity.category === 'nightlife' && '🌃'}
                {activity.category === 'wellness' && '🧘'}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 flex-1">{activity.name}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">{activity.rating}</span>
                <span className="text-gray-600">({activity.reviewCount.toLocaleString()} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{activity.city}</span>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Duration</span>
              </div>
              <p className="font-bold text-gray-900">{activity.duration} minutes</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Price</span>
              </div>
              <p className="font-bold text-gray-900">RM {activity.estimatedPrice}</p>
            </div>

            {activity.difficulty && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">Difficulty</span>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${difficultyColor[activity.difficulty]}`}>
                  {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
                </span>
              </div>
            )}

            {activity.maxGroupSize && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Max Group</span>
                </div>
                <p className="font-bold text-gray-900">{activity.maxGroupSize} people</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              About This Activity
            </h3>
            <p className="text-gray-700 leading-relaxed">{activity.description}</p>
          </div>

          {/* Highlights */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Highlights
            </h3>
            <div className="space-y-2">
              {activity.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-700">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services Needed */}
          {activity.servicesNeeded.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-3">Services Needed</h3>
              <div className="flex flex-wrap gap-2">
                {activity.servicesNeeded.map((service, idx) => (
                  <div key={idx} className="bg-white border border-blue-300 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">{serviceIcons[service]}</span>
                    <span className="font-medium text-blue-900">{serviceLabels[service]}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-blue-800 mt-3">
                These services will be provided by verified suppliers when you book this activity.
              </p>
            </div>
          )}

          {/* Practical Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-gray-900">Practical Information</h3>
            
            {activity.operatingHours && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Operating Hours</span>
                </div>
                <p className="text-gray-700 ml-6">{activity.operatingHours}</p>
              </div>
            )}

            {activity.bestTimeToVisit && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Best Time to Visit</span>
                </div>
                <p className="text-gray-700 ml-6">{activity.bestTimeToVisit}</p>
              </div>
            )}

            {activity.whatToBring && activity.whatToBring.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Backpack className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">What to Bring</span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {activity.whatToBring.map((item, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activity.minAge && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Minimum Age</span>
                </div>
                <p className="text-gray-700 ml-6">{activity.minAge}+ years old</p>
              </div>
            )}

            {activity.entranceFee !== undefined && activity.entranceFee > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Entrance Fee</span>
                </div>
                <p className="text-gray-700 ml-6">RM {activity.entranceFee} (included in price)</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {activity.tags.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 text-white">
            <h3 className="font-bold mb-3">Price Breakdown</h3>
            <div className="space-y-2">
              {activity.entranceFee !== undefined && activity.entranceFee > 0 && (
                <div className="flex justify-between">
                  <span className="opacity-90">Entrance Fee</span>
                  <span className="font-semibold">RM {activity.entranceFee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="opacity-90">Estimated Service Cost</span>
                <span className="font-semibold">RM {activity.estimatedPrice - (activity.entranceFee || 0)}</span>
              </div>
              <div className="border-t border-white/30 pt-2 flex justify-between text-lg">
                <span className="font-bold">Total Estimated</span>
                <span className="font-bold">RM {activity.estimatedPrice}</span>
              </div>
            </div>
            <p className="text-sm opacity-80 mt-3">
              * Final price will be confirmed after supplier quotes
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-600">Starting from</p>
            <p className="text-2xl font-bold text-gray-900">RM {activity.estimatedPrice}</p>
          </div>
          {isInPlan ? (
            <button
              onClick={handleGoToCart}
              className="px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              View My Plan
            </button>
          ) : (
            <button
              onClick={handleAddToPlan}
              className="px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              Add to Plan
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showAddedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Added to your trip plan!</span>
          </div>
        </div>
      )}
    </div>
  );
}
