import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import { StatusBadge } from '../../components/design-system/Badges';
import { Plus, AlertCircle, TrendingUp, Calendar, DollarSign, Briefcase, Users, MapPin } from 'lucide-react';

export default function SupplierHome() {
  const navigate = useNavigate();
  const { user, notifications } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const canOperate = user.verificationStatus === 'verified';
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Mock stats
  const stats = {
    newRequests: 8,
    activeTrips: 2,
    pendingOffers: 3,
    monthlyEarnings: 12450,
    upcomingBookings: 5,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="TripuLike"
        showMenu
        onMenuClick={() => setSidebarOpen(true)}
        showNotifications
        notificationCount={unreadNotifications}
        action={
          canOperate ? (
            <button
              onClick={() => navigate('/supplier/create-package')}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : undefined
        }
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user.role}
        userName={user.name}
        userAvatar={user.avatar}
        userRating={user.rating}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Verification Status Banner */}
        {user.verificationStatus !== 'verified' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  {user.verificationStatus === 'pending' && 'Verification Pending'}
                  {user.verificationStatus === 'rejected' && 'Verification Rejected'}
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  {user.verificationStatus === 'pending' &&
                    'Your documents are being reviewed. This usually takes 24-48 hours.'}
                  {user.verificationStatus === 'rejected' &&
                    'Your verification was rejected. Please resubmit your documents.'}
                </p>
                <button
                  onClick={() => navigate('/supplier/verification')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium text-sm hover:bg-yellow-700 transition-colors"
                >
                  View Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        {canOperate && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/supplier/create-package')}
              className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-5 text-white text-left hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-1">Create Package</h3>
              <p className="text-sm opacity-90">Design new tour</p>
            </button>
            
            <button
              onClick={() => navigate('/supplier/operations')}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white text-left hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-1">Operations</h3>
              <p className="text-sm opacity-90">{stats.newRequests} new requests</p>
            </button>

            <button
              onClick={() => navigate('/supplier/bookings')}
              className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white text-left hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-1">Bookings</h3>
              <p className="text-sm opacity-90">{stats.upcomingBookings} upcoming</p>
            </button>

            <button
              onClick={() => navigate('/supplier/dashboard')}
              className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-5 text-white text-left hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-1">Earnings</h3>
              <p className="text-sm opacity-90">RM {stats.monthlyEarnings.toLocaleString()}</p>
            </button>
          </div>
        )}

        {/* Performance Stats */}
        {canOperate && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Your Performance</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-600 mt-1">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.completedTrips}</p>
                <p className="text-xs text-gray-600 mt-1">Trips</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.reviewCount}</p>
                <p className="text-xs text-gray-600 mt-1">Reviews</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Summary */}
        {canOperate && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900">Today's Overview</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              <button
                onClick={() => navigate('/supplier/operations')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">New Trip Requests</p>
                    <p className="text-sm text-gray-600">{stats.newRequests} available in your area</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {stats.newRequests}
                </div>
              </button>

              <button
                onClick={() => navigate('/supplier/operations?tab=offers')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Pending Offers</p>
                    <p className="text-sm text-gray-600">Awaiting customer response</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
                  {stats.pendingOffers}
                </div>
              </button>

              <button
                onClick={() => navigate('/supplier/operations?tab=active')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Active Trips</p>
                    <p className="text-sm text-gray-600">Currently in progress</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                  {stats.activeTrips}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Recent Bookings Preview */}
        {canOperate && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
              <button
                onClick={() => navigate('/supplier/bookings')}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {/* Booking Card 1 */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">TM-2045</p>
                      <StatusBadge status="confirmed" />
                    </div>
                    <p className="font-semibold text-gray-900">Kuala Lumpur City Tour</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>👤</span>
                  <span>Sarah Lee</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>📅</span>
                  <span>18 March 2026</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium text-green-700">Paid</span>
                  </div>
                  <button
                    onClick={() => navigate('/supplier/bookings')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Booking Card 2 */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">TM-2046</p>
                      <StatusBadge status="pending" />
                    </div>
                    <p className="font-semibold text-gray-900">Genting Highlands</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>👤</span>
                  <span>Ahmed Rahman</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>📅</span>
                  <span>20 March 2026</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-sm font-medium text-yellow-700">Awaiting Confirmation</span>
                  </div>
                  <button
                    onClick={() => navigate('/supplier/bookings')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action for Unverified */}
        {!canOperate && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Complete Verification First
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              You need to be verified before you can view and accept trip requests.
            </p>
            <button
              onClick={() => navigate('/supplier/verification')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Complete Verification
            </button>
          </div>
        )}
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}