import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: 'driver',
      icon: '🚗',
      title: 'Driver',
      description: 'Provide transport services and create tour packages',
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'guide',
      icon: '🎒',
      title: 'Tour Guide',
      description: 'Lead tours, share knowledge, and create packages',
      color: 'from-green-600 to-green-700',
    },
    {
      id: 'translator',
      icon: '🌐',
      title: 'Translator',
      description: 'Provide language support and create packages',
      color: 'from-indigo-600 to-indigo-700',
    },
    {
      id: 'activity_operator',
      icon: '🌊',
      title: 'Activity Operator',
      description: 'Provide sea, indoor, and outdoor activity experiences',
      color: 'from-orange-600 to-orange-700',
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      login(`demo-${selectedRole}@tripulike.com`, selectedRole);
      navigate('/supplier');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex flex-col p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="self-start p-2 bg-white/20 backdrop-blur-sm text-white rounded-xl mb-8"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col">
        <div className="text-white mb-8">
          <h1 className="text-4xl font-bold mb-3">Choose Your Role</h1>
          <p className="text-lg opacity-90">
            All suppliers can create packages and offer services
          </p>
        </div>

        <div className="space-y-3 flex-1">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id as UserRole)}
              className={`w-full bg-white/95 backdrop-blur-sm rounded-2xl p-5 text-left transition-all ${
                selectedRole === role.id
                  ? 'ring-4 ring-white shadow-2xl scale-105'
                  : 'hover:bg-white shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{role.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    selectedRole === role.id
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedRole === role.id && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
          <p className="text-sm text-white">
            <strong>✓ All suppliers can:</strong> Create packages, accept requests, manage bookings, and earn income
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-6">
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full px-6 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg disabled:bg-white/50 disabled:text-gray-400 transition-all shadow-xl hover:shadow-2xl"
        >
          Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'Supplier'}
        </button>
      </div>
    </div>
  );
}
