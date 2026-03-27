import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation } from '../../components/design-system/Navigation';
import { CommissionIndicator } from '../../components/design-system/Badges';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const { user, bookings } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings'>('overview');

  if (!user) return null;

  // Mock earnings data
  const totalRevenue = 8450.00;
  const commission = totalRevenue * 0.175;
  const netPayout = totalRevenue - commission;
  const thisMonthRevenue = 2100.00;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Dashboard" />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'earnings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Earnings
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm opacity-90">This Month</span>
                </div>
                <p className="text-3xl font-bold">RM {thisMonthRevenue.toFixed(0)}</p>
                <p className="text-xs opacity-75 mt-1">+15% from last month</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm opacity-90">Total Earned</span>
                </div>
                <p className="text-3xl font-bold">RM {netPayout.toFixed(0)}</p>
                <p className="text-xs opacity-75 mt-1">{user.completedTrips} trips</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-gray-900">{user.completedTrips}</p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-gray-900">{user.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-600 mt-1">Rating</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
                <p className="text-2xl font-bold text-gray-900">98%</p>
                <p className="text-xs text-gray-600 mt-1">On-time</p>
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Upcoming Schedule</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No upcoming bookings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/supplier/booking/${booking.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{booking.trip.city}</p>
                        <p className="text-sm text-gray-600">{booking.trip.startDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          RM {booking.supplierPayout.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Payout</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Performance</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-semibold text-gray-900">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Acceptance Rate</span>
                    <span className="font-semibold text-gray-900">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-semibold text-gray-900">{(user.rating / 5 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${user.rating / 5 * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'earnings' && (
          <>
            {/* Total Earnings */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
              <p className="text-sm opacity-90 mb-2">Total Net Earnings</p>
              <p className="text-4xl font-bold mb-4">RM {netPayout.toFixed(2)}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-90">From {user.completedTrips} completed trips</span>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <CommissionIndicator
              totalRevenue={totalRevenue}
              commission={commission}
              netPayout={netPayout}
            />

            {/* Monthly Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">February 2026</p>
                    <p className="text-sm text-gray-600">12 trips</p>
                  </div>
                  <p className="font-semibold text-gray-900">RM {thisMonthRevenue.toFixed(2)}</p>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">January 2026</p>
                    <p className="text-sm text-gray-600">15 trips</p>
                  </div>
                  <p className="font-semibold text-gray-900">RM 1,825.00</p>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">December 2025</p>
                    <p className="text-sm text-gray-600">18 trips</p>
                  </div>
                  <p className="font-semibold text-gray-900">RM 2,450.00</p>
                </div>
              </div>
            </div>

            {/* Payout Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Payout Schedule</h4>
              <p className="text-sm text-blue-800">
                Earnings are released 24 hours after trip completion and review submission.
                Payouts are processed weekly every Monday.
              </p>
            </div>
          </>
        )}
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
