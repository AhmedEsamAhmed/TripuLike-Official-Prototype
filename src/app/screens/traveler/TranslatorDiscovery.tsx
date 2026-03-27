import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';

export default function TranslatorDiscovery() {
  const navigate = useNavigate();
  const { users, createTripPlan, updateTripPlan } = useApp();

  const [location, setLocation] = useState('');
  const [fromLanguage, setFromLanguage] = useState('English');
  const [toLanguage, setToLanguage] = useState('Mandarin');

  const translators = useMemo(
    () => users.filter((user) => user.role === 'translator' && user.verificationStatus === 'verified'),
    [users]
  );

  const filteredTranslators = useMemo(
    () =>
      translators.filter((translator) => {
        const locationMatch =
          !location ||
          (translator.operatingLocation || translator.location || '')
            .toLowerCase()
            .includes(location.toLowerCase());

        const languageMatch = (translator.languages || []).some(
          (pair) => pair.from === fromLanguage && pair.to === toLanguage
        );

        return locationMatch && languageMatch;
      }),
    [translators, location, fromLanguage, toLanguage]
  );

  const handleRequestService = (translatorId: string, operatingLocation: string) => {
    const city = operatingLocation || 'Kuala Lumpur';
    createTripPlan(city);
    updateTripPlan({
      city,
      selectedServices: ['translator'],
      requiredServices: [
        {
          type: 'translator',
          translatorDetails: {
            fromLanguage,
            toLanguage,
            context: 'tourism',
            durationHours: 4,
            groupType: 'family',
          },
          details: {
            fromLanguage,
            toLanguage,
          },
        },
      ],
      translatorRequirement: {
        fromLanguage,
        toLanguage,
      },
      prefilledTranslatorId: translatorId,
    });
    navigate('/traveler/trip-plan');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Find Translators" showBack onBack={() => navigate(-1)} />

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Filter Translators</h2>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">From</label>
              <select
                value={fromLanguage}
                onChange={(e) => setFromLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {['English', 'Mandarin', 'Arabic', 'Malay', 'Japanese', 'Korean'].map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">To</label>
              <select
                value={toLanguage}
                onChange={(e) => setToLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {['English', 'Mandarin', 'Arabic', 'Malay', 'Japanese', 'Korean'].map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by location"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="space-y-3">
          {filteredTranslators.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200">
              <p className="font-semibold text-gray-900">No translator matches</p>
              <p className="text-sm text-gray-600 mt-1">Try changing language pair or location.</p>
            </div>
          )}

          {filteredTranslators.map((translator) => (
            <div key={translator.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{translator.name}</h3>
                  <p className="text-sm text-gray-600">{translator.operatingLocation || translator.location}</p>
                </div>
                <span className="text-sm font-semibold text-amber-600">{translator.rating.toFixed(1)}★</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {(translator.languages || []).map((pair, idx) => (
                  <span key={`${pair.from}-${pair.to}-${idx}`} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                    {pair.from} {'->'} {pair.to}
                  </span>
                ))}
              </div>
              

              <button
                onClick={() => handleRequestService(translator.id, translator.operatingLocation || translator.location || 'Kuala Lumpur')}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Request Service
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
