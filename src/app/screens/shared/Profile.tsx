import React from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation } from '../../components/design-system/Navigation';
import { VerificationBadge, StatusBadge } from '../../components/design-system/Badges';
import { Star, Calendar, Shield, LogOut, MapPin, Languages, Briefcase } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, reviews } = useApp();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper function to get supplier type display name and badge
  const getSupplierTypeBadge = (role: string) => {
    const types = {
      'driver': { name: 'Driver', icon: '🚗', color: 'bg-blue-100 text-blue-700' },
      'guide': { name: 'Tour Guide', icon: '🎒', color: 'bg-green-100 text-green-700' },
      'translator': { name: 'Translator', icon: '🌐', color: 'bg-indigo-100 text-indigo-700' },
      'activity_operator': { name: 'Activity Operator', icon: '🌊', color: 'bg-orange-100 text-orange-700' },
    };
    return types[role as keyof typeof types] || { name: role, icon: '👤', color: 'bg-gray-100 text-gray-700' };
  };

  const supplierBadge = user.role !== 'traveler' ? getSupplierTypeBadge(user.role) : null;

  // Mock additional supplier data
  const supplierDetails = user.role !== 'traveler' ? {
    yearsOfExperience: 5,
    languages: ['English', 'Malay', 'Mandarin'],
    operatingAreas: ['Kuala Lumpur', 'Selangor', 'Putrajaya'],
  } : null;

  // Get user's reviews (as supplier)
  const userReviews = user.role !== 'traveler' 
    ? reviews.filter(r => r.reviewedUserId === user.id).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Profile" />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                {user.verificationStatus === 'verified' && (
                  <VerificationBadge verified={true} size="sm" />
                )}
              </div>
              
              {/* Supplier Type Badge */}
              {supplierBadge && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-2 ${supplierBadge.color}`}>
                  <span>{supplierBadge.icon}</span>
                  <span>{supplierBadge.name}</span>
                </div>
              )}
              
              {!supplierBadge && (
                <p className="text-gray-600 capitalize mb-2">{user.role}</p>
              )}
              
              {user.verificationStatus !== 'verified' && (
                <StatusBadge status={user.verificationStatus} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">{user.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-600">Rating</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 mb-1">{user.reviewCount}</p>
              <p className="text-xs text-gray-600">Reviews</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 mb-1">{user.completedTrips}</p>
              <p className="text-xs text-gray-600">Trips</p>
            </div>
          </div>
        </div>

        {/* Supplier Professional Profile */}
        {supplierDetails && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Professional Profile</h3>
            
            <div className="space-y-4">
              {/* Years of Experience */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-semibold text-gray-900">{supplierDetails.yearsOfExperience} years</p>
                </div>
              </div>

              {/* Languages */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Languages className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {supplierDetails.languages.map((lang) => (
                      <span key={lang} className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Operating Areas */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Operating Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {supplierDetails.operatingAreas.map((area) => (
                      <span key={area} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Account Information</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium text-gray-900">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium text-gray-900">
                {new Date(user.joinedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Supplier Info */}
        {user.role !== 'traveler' && (
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Professional Details</h3>
            </div>
            <div className="p-4 space-y-3">
              {user.licenseNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">License Number</span>
                  <span className="font-medium text-gray-900">{user.licenseNumber}</span>
                </div>
              )}
              {user.vehicleInfo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium text-gray-900">
                    {`${user.vehicleInfo.type} ${user.vehicleInfo.model} (${user.vehicleInfo.plateNumber})`}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Verification</span>
                <StatusBadge status={user.verificationStatus} />
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {userReviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Reviews & Comments</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{user.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-600">({user.reviewCount} Reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {userReviews.map((review) => (
                <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3 mb-2">
                    <img
                      src={review.reviewerAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                      alt={review.reviewerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.serviceRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">My Bookings</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-200">
            <Shield className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Safety Center</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}