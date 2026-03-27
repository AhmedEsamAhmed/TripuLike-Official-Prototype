import React from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { login } = useApp();

  const handleContinueAsTraveler = () => {
    // Direct entry without authentication
    login('demo-traveler@tripulike.com', 'traveler');
    navigate('/traveler');
  };

  const handleContinueAsSupplier = () => {
    // Direct entry to supplier type selection
    navigate('/auth/role-selection?mode=supplier');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex flex-col">
      {/* Logo & Branding */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-5xl">🧳</span>
          </div>
          <h1 className="text-5xl font-bold mb-3">
            Trip<span className="text-orange-400">u</span>Like
          </h1>
          <p className="text-xl opacity-90 max-w-sm mx-auto leading-relaxed">
            Your trusted tourism experience platform
          </p>
        </div>

        <div className="mt-12 space-y-3 text-center">
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-2xl">✓</span>
            <span>Verified suppliers</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-2xl">✓</span>
            <span>Secure escrow payments</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-2xl">✓</span>
            <span>24/7 safety support</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-3 bg-white/10 backdrop-blur-lg">
        <button
          onClick={handleContinueAsTraveler}
          className="w-full px-6 py-4 bg-white text-blue-700 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
        >
          Continue as Traveler
        </button>
        
        <button
          onClick={handleContinueAsSupplier}
          className="w-full px-6 py-4 bg-blue-800 text-white border-2 border-white/30 rounded-2xl font-semibold text-lg hover:bg-blue-900 transition-colors"
        >
          Register as Supplier
        </button>
      </div>
    </div>
  );
}