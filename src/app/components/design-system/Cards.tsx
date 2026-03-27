import React from 'react';
import { Trip, Offer } from '../../types';
import { StatusBadge, VerificationBadge } from './Badges';
import { MapPin, Users, Calendar, Star } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const serviceTags = trip.requiredServices?.length
    ? trip.requiredServices.map((service) =>
        service.type === 'translator' &&
        (service.translatorDetails?.fromLanguage || service.details?.fromLanguage) &&
        (service.translatorDetails?.toLanguage || service.details?.toLanguage)
          ? `translator: ${service.translatorDetails?.fromLanguage || service.details?.fromLanguage} -> ${service.translatorDetails?.toLanguage || service.details?.toLanguage}`
          : service.type
      )
    : (trip.servicesNeeded || []);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {trip.featuredImage && (
        <div className="h-48 overflow-hidden">
          <img
            src={trip.featuredImage}
            alt={trip.title || trip.city}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {trip.title || `${trip.city} Trip`}
            </h3>
            <p className="text-sm text-gray-500">
              Posted by {trip.isPreDesigned ? 'Supplier' : 'Traveler'}
            </p>
          </div>
          <StatusBadge status={trip.status} />
        </div>

        {trip.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{trip.duration}d</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{trip.stops.length} stops</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{trip.groupSize} people</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Services:</span>
          <div className="flex gap-1">
            {serviceTags.map((service) => (
              <span
                key={service}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize"
              >
                {service.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
          <div>
            {trip.fixedPrice ? (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  RM {trip.fixedPrice}
                </span>
                {trip.isNegotiable && (
                  <span className="text-xs text-gray-500">(negotiable)</span>
                )}
              </div>
            ) : (
              <span className="text-sm font-medium text-blue-600">
                Awaiting offers
              </span>
            )}
          </div>
          
          {trip.capacity && (
            <span className="text-xs text-gray-500">
              Up to {trip.capacity} people
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface OfferCardProps {
  offer: Offer;
  tripTitle?: string;
  showRoundCounter?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCounter?: () => void;
}

export function OfferCard({
  offer,
  tripTitle,
  showRoundCounter = false,
  onAccept,
  onDecline,
  onCounter,
}: OfferCardProps) {
  const canCounter = offer.round < 3;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-4">
      {tripTitle && (
        <div className="pb-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{tripTitle}</h3>
        </div>
      )}

      <div className="flex items-start gap-3">
        <img
          src={offer.supplierAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
          alt={offer.supplierName}
          className="w-12 h-12 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{offer.supplierName}</h4>
            {offer.supplierVerified && <VerificationBadge verified={true} size="sm" />}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{offer.supplierRating}</span>
            </div>
            <span>•</span>
            <span>{offer.supplierReviewCount} reviews</span>
            <span>•</span>
            <span className="capitalize">{offer.supplierRole}</span>
          </div>
        </div>
      </div>

      {showRoundCounter && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <p className="text-xs text-yellow-800">
            Negotiation Round {offer.round} of 3
            {!canCounter && ' (Final offer)'}
          </p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-gray-600">Offer Price</span>
          <span className="text-2xl font-bold text-gray-900">
            RM {offer.price.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Valid until {new Date(offer.validUntil).toLocaleDateString()}
        </p>
      </div>

      {offer.notes && (
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-sm text-gray-700">{offer.notes}</p>
        </div>
      )}

      {offer.status === 'pending' && (onAccept || onDecline || onCounter) && (
        <div className="flex gap-2">
          {onDecline && (
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Decline
            </button>
          )}
          {onCounter && canCounter && (
            <button
              onClick={onCounter}
              className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
            >
              Counter
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Accept
            </button>
          )}
        </div>
      )}

      {offer.status === 'accepted' && (
        <div className="bg-green-100 text-green-700 rounded-xl p-3 text-center font-medium">
          Offer Accepted ✓
        </div>
      )}

      {offer.status === 'declined' && (
        <div className="bg-red-100 text-red-700 rounded-xl p-3 text-center font-medium">
          Offer Declined
        </div>
      )}

      {offer.status === 'countered' && (
        <div className="bg-yellow-100 text-yellow-700 rounded-xl p-3 text-center font-medium">
          Counter Offer Sent
        </div>
      )}
    </div>
  );
}

interface SupplierCardProps {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  completedTrips: number;
  verified: boolean;
  onClick?: () => void;
}

export function SupplierCard({
  name,
  role,
  avatar,
  rating,
  reviewCount,
  completedTrips,
  verified,
  onClick,
}: SupplierCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <img
          src={avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {verified && <VerificationBadge verified={true} size="sm" />}
          </div>
          
          <p className="text-sm text-gray-600 capitalize mb-2">{role}</p>
          
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
              <span>({reviewCount})</span>
            </div>
            <span>•</span>
            <span>{completedTrips} trips</span>
          </div>
        </div>
      </div>
    </div>
  );
}
