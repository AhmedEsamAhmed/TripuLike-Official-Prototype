import React from 'react';
import { MapPin, Star, Clock, Users } from 'lucide-react';
import { Package } from '../../types';

interface PackageCardProps {
  pkg: Package;
  onClick?: () => void;
  variant?: 'compact' | 'expanded';
}

export default function PackageCard({ pkg, onClick, variant = 'compact' }: PackageCardProps) {
  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group"
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
            {pkg.rating ? `★ ${pkg.rating.toFixed(1)}` : '★ New'}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-left line-clamp-2">{pkg.title}</h3>
          
          <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            <span>{pkg.city}, {pkg.country}</span>
          </div>

          <div className="flex items-center gap-2 mt-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{pkg.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{pkg.groupSizeMin}-{pkg.groupSizeMax}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">
                {pkg.currency || '$'}{pkg.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">per person</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
              View Details
            </button>
          </div>
        </div>
      </button>
    );
  }

  // Expanded variant for details page
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      <div className="relative h-80">
        <img
          src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
          alt={pkg.title}
          className="w-full h-full object-cover"
        />
        {pkg.rating && (
          <div className="absolute top-4 right-4 bg-white/95 px-4 py-2 rounded-lg font-bold text-gray-900 flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            {pkg.rating.toFixed(1)} ({pkg.reviews?.length || 0} reviews)
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pkg.title}</h1>
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">{pkg.city}, {pkg.country}</span>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-gray-600 text-sm font-semibold">Price</p>
            <p className="text-2xl font-bold text-gray-900">{pkg.currency || '$'}{pkg.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">per person</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-gray-600 text-sm font-semibold">Duration</p>
            <p className="text-2xl font-bold text-gray-900">{pkg.duration}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-gray-600 text-sm font-semibold">Group Size</p>
            <p className="text-2xl font-bold text-gray-900">{pkg.groupSizeMin}-{pkg.groupSizeMax}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">About this package</h3>
          <p className="text-gray-700 leading-relaxed">{pkg.description}</p>
        </div>

        {/* Supplier Info */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Organized by</h3>
          <div className="flex items-center gap-3">
            {pkg.supplierAvatar && (
              <img src={pkg.supplierAvatar} alt={pkg.supplierName} className="w-12 h-12 rounded-full" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{pkg.supplierName}</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {pkg.supplierRating.toFixed(1)} ({pkg.supplierReviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        {pkg.itinerary.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Itinerary</h3>
            <div className="space-y-3">
              {pkg.itinerary.map((day, idx) => (
                <div key={idx} className="border-l-4 border-blue-600 pl-4 py-2">
                  <p className="font-bold text-gray-900">{day.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{day.description}</p>
                  {day.activities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-700">Activities:</p>
                      <p className="text-xs text-gray-600">{day.activities.join(', ')}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">⏱️ {day.duration}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">✅ Included</h3>
            <ul className="space-y-1">
              {pkg.included.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">❌ Not Included</h3>
            <ul className="space-y-1">
              {pkg.notIncluded.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Meeting Points */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs font-bold text-gray-900">📍 Meeting Point</p>
            <p className="text-xs text-gray-700 mt-1">{pkg.meetingPoint}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs font-bold text-gray-900">📍 Drop-off Point</p>
            <p className="text-xs text-gray-700 mt-1">{pkg.dropoffPoint}</p>
          </div>
        </div>

        {/* Requirements */}
        {pkg.requirements && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">⚠️ Requirements</h3>
            <p className="text-sm text-gray-700">{pkg.requirements}</p>
          </div>
        )}

        {/* Cancellation Policy */}
        {pkg.cancellationPolicy && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">📋 Cancellation Policy</h3>
            <p className="text-sm text-gray-700">{pkg.cancellationPolicy}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
          <button className="py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            Add to Trip Plan
          </button>
          <button className="py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
