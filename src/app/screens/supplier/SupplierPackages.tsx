import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import PackageCard from '../../components/design-system/PackageCard';
import { Package, Plus, Star, Users, MapPin } from 'lucide-react';

export default function SupplierPackages() {
  const navigate = useNavigate();
  const { user, packages, getSupplierPackages } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role === 'traveler') {
    navigate('/');
    return null;
  }

  // Translator cannot create packages
  if (user.role === 'translator') {
    navigate('/supplier/services');
    return null;
  }

  const myPackages = getSupplierPackages(user.id);
  const unreadNotifications = 3;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="My Packages"
        showBack
        onBack={() => navigate('/supplier/management')}
        showMenu
        onMenuClick={() => setSidebarOpen(true)}
        showNotifications
        notificationCount={unreadNotifications}
        action={
          <button
            onClick={() => navigate('/supplier/create-package')}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
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

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">📦 My Packages</h2>
          <p className="opacity-90">Create and manage your travel experiences</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="opacity-80">Total Packages</p>
              <p className="text-2xl font-bold">{myPackages.length}</p>
            </div>
            <div>
              <p className="opacity-80">Total Bookings</p>
              <p className="text-2xl font-bold">{myPackages.reduce((sum, p) => sum + (p.bookings || 0), 0)}</p>
            </div>
            <div>
              <p className="opacity-80">Avg Rating</p>
              <p className="text-2xl font-bold">
                {myPackages.length > 0 
                  ? (myPackages.reduce((sum, p) => sum + (p.rating || 0), 0) / myPackages.length).toFixed(1)
                  : '-'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={() => navigate('/supplier/create-package')}
          className="w-full py-4 border-2 border-dashed border-blue-400 rounded-xl text-blue-600 font-bold hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Create New Package
        </button>

        {/* Packages List */}
        {myPackages.length > 0 ? (
          <div className="space-y-4">
            {myPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/supplier/package/${pkg.id}`)}
              >
                <div className="p-4 flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200'}
                      alt={pkg.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-gray-900">{pkg.title}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{pkg.city}, {pkg.country}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      {pkg.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{pkg.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {pkg.bookings && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">{pkg.bookings} bookings</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">{pkg.description}</p>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex-shrink-0 text-right space-y-2">
                    <p className="text-xl font-bold text-gray-900">
                      {pkg.currency || '$'}{pkg.price.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/supplier/edit-package/${pkg.id}`);
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement delete
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No packages created yet</p>
            <p className="text-gray-500 text-sm mb-4">Start selling travel experiences by creating your first package</p>
            <button
              onClick={() => navigate('/supplier/create-package')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Package
            </button>
          </div>
        )}

        {/* Info Box */}
        {myPackages.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h3 className="font-bold text-blue-900 mb-2">💡 Package Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Add high-quality images to attract travelers</li>
              <li>✓ Write detailed itineraries for each day</li>
              <li>✓ Be clear about what's included and excluded</li>
              <li>✓ Set realistic group sizes and pricing</li>
              <li>✓ Respond quickly to booking inquiries</li>
            </ul>
          </div>
        )}
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
