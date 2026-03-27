import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import PackageCard from '../../components/design-system/PackageCard';
import { Search, MapPin, ChevronRight } from 'lucide-react';

export default function TravelerHome() {
  const navigate = useNavigate();
  const { user, notifications, packages, countries, cities } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  if (!user) return null;

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Filter cities based on selected country
  const citiesForCountry = selectedCountry 
    ? cities.filter(c => c.country === selectedCountry)
    : [];

  // Package filtering and categorization
  const popular = packages.slice(0, 4); // Most booked/highest rated
  const exploreBYDestination = selectedCity 
    ? packages.filter(p => p.city === selectedCity).slice(0, 4)
    : packages.slice(4, 8);
  const recommended = packages.slice(8, 12); // Based on user preferences
  const newPackages = packages.slice(12, 16); // Recently added

  // Search filtering
  let searchResults = packages;
  if (searchQuery.trim()) {
    searchResults = packages.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handlePackageClick = (pkg: typeof packages[0]) => {
    navigate(`/traveler/package/${pkg.id}`, { state: { package: pkg } });
  };

  const handleCreateTrip = () => {
    navigate('/traveler/create-trip');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="TripuLike Packages"
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

      <div className="max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Discover Packages</h1>
          <p className="text-lg opacity-90 mb-6">
            Browse complete travel experiences from local suppliers
          </p>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search packages by name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
          </div>
        </div>

        <div className="p-4 space-y-8">
          {/* Filter Section */}
          {!searchQuery && (
            <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-900">Filter by Destination</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedCity('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Countries</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              {selectedCountry && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Cities</option>
                    {citiesForCountry.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Search Results ({searchResults.length})
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onClick={() => handlePackageClick(pkg)}
                  />
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No packages found</h3>
              <p className="text-gray-600 text-sm">Try a different search term</p>
            </div>
          )}

          {/* Only show sections if not searching */}
          {!searchQuery && (
            <>
              {/* Popular Packages */}
              {popular.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">🔥 Popular</h2>
                    <button className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {popular.map(pkg => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onClick={() => handlePackageClick(pkg)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Explore by Destination */}
              {exploreBYDestination.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      🌍 {selectedCity ? `Explore ${selectedCity}` : 'Explore by Destination'}
                    </h2>
                    <button className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {exploreBYDestination.map(pkg => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onClick={() => handlePackageClick(pkg)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended for You */}
              {recommended.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">💡 Recommended for You</h2>
                    <button className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {recommended.map(pkg => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onClick={() => handlePackageClick(pkg)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* New Packages */}
              {newPackages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">✨ New</h2>
                    <button className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {newPackages.map(pkg => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onClick={() => handlePackageClick(pkg)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No packages */}
              {popular.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No packages available yet</h3>
                  <p className="text-gray-600 text-sm mb-4">Suppliers are creating amazing experiences for you!</p>
                  <button
                    onClick={handleCreateTrip}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Create a Trip Request
                  </button>
                </div>
              )}

              {/* CTA Section */}
              {packages.length > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Ready to book?</h3>
                  <p className="opacity-90 mb-4">Add packages to your trip plan and book directly</p>
                  <button
                    onClick={handleCreateTrip}
                    className="w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                  >
                    Create Trip Plan
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNavigation role={user.role} />
    </div>
  );
}
