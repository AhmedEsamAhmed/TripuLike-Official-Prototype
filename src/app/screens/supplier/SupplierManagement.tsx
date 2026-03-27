import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import { Wallet, TrendingUp, Calendar, Package, Network, Settings, DollarSign, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SupplierManagement() {
  const navigate = useNavigate();
  const { user, bookings } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role === 'traveler') {
    navigate('/');
    return null;
  }

  // Calculate earnings
  const completedBookings = bookings.filter(
    (b) => b.supplierId === user.id && b.trip.status === 'completed'
  );
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.supplierPayout, 0);
  const platformCommission = completedBookings.reduce((sum, b) => sum + b.commission, 0);
  const pendingPayouts = bookings
    .filter((b) => b.supplierId === user.id && b.trip.status === 'booked')
    .reduce((sum, b) => sum + b.supplierPayout, 0);

  const monthlyEarnings = 4850; // Mock data
  const monthlyGrowth = 12.5;

  const unreadNotifications = 3;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Management"
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

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Management Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">💼 Business Management</h2>
          <p className="opacity-90">Track earnings, manage schedule, and grow your business</p>
        </div>

        {/* Wallet Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Wallet Overview
            </h3>
            <button
              onClick={() => navigate('/supplier/dashboard')}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              View All →
            </button>
          </div>

          <div className="space-y-4">
            {/* Total Earnings */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-sm text-green-700 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-green-900">RM {totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-2">From {completedBookings.length} completed trips</p>
            </div>

            {/* Pending Payouts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700 mb-1">Pending</p>
                <p className="text-xl font-bold text-blue-900">RM {pendingPayouts.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-700 mb-1">This Month</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-purple-900">RM {monthlyEarnings}</p>
                  {monthlyGrowth > 0 && (
                    <span className="flex items-center text-xs text-green-600 font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      {monthlyGrowth}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Commission Info */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Platform Commission (17.5%)</span>
                <span className="font-semibold text-gray-900">RM {platformCommission.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/supplier/packages')}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-300 transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">My Packages</h4>
            <p className="text-xs text-gray-500">Manage pre-designed tours</p>
          </button>

          <button
            onClick={() => navigate('/supplier/availability')}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-300 transition-all text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Availability</h4>
            <p className="text-xs text-gray-500">Set your schedule</p>
          </button>

          <button
            onClick={() => navigate('/supplier/network')}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-300 transition-all text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Network className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Network</h4>
            <p className="text-xs text-gray-500">Connect with suppliers</p>
          </button>

          <button
            onClick={() => navigate('/supplier/dashboard')}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-300 transition-all text-left"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <PieChart className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Analytics</h4>
            <p className="text-xs text-gray-500">View detailed stats</p>
          </button>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Performance This Month
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed Trips</span>
              <span className="font-bold text-gray-900">{completedBookings.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Rating</span>
              <span className="font-bold text-gray-900 flex items-center gap-1">
                ⭐ {user.rating.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="font-bold text-gray-900">2.3 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Acceptance Rate</span>
              <span className="font-bold text-green-600">85%</span>
            </div>
          </div>
        </div>

        {/* Calendar Preview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Schedule
            </h3>
            <button
              onClick={() => navigate('/supplier/bookings')}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              View Calendar →
            </button>
          </div>

          <div className="space-y-3">
            {bookings
              .filter((b) => b.supplierId === user.id && b.trip.status === 'booked')
              .slice(0, 3)
              .map((booking) => (
                <div key={booking.id} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {booking.trip.title || `${booking.trip.city} Trip`}
                    </h4>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-semibold">
                      {booking.trip.duration}D
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(booking.trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}

            {bookings.filter((b) => b.supplierId === user.id && b.trip.status === 'booked').length === 0 && (
              <p className="text-center text-gray-500 py-4">No upcoming bookings</p>
            )}
          </div>
        </div>

        {/* Business Tools */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Business Tools</h3>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/supplier/create-package')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Create Package</p>
                  <p className="text-xs text-gray-500">Design pre-planned tours</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Settings</p>
                  <p className="text-xs text-gray-500">Manage preferences</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
