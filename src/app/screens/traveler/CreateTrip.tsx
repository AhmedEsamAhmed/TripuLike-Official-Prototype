import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/design-system/Navigation';
import { Input, TextArea, Select, Button } from '../../components/design-system/Inputs';
import { ServiceType, Stop } from '../../types';
import { Plus, Trash2, MapPin } from 'lucide-react';

export default function CreateTrip() {
  const navigate = useNavigate();
  const { user, createTrip } = useApp();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    city: 'Kuala Lumpur',
    startDate: '',
    endDate: '',
    duration: 1,
    stops: [{ id: '1', name: '', duration: 60, location: { lat: 3.1579, lng: 101.7116 } }] as Stop[],
    servicesNeeded: [] as ServiceType[],
    groupSize: 1,
    notes: '',
  });

  const recommendationsByCity: Record<string, string[]> = {
    'Kuala Lumpur': ['Petronas Twin Towers', 'Batu Caves', 'Jalan Alor Food Street'],
    Penang: ['Georgetown Street Art', 'Gurney Drive', 'Kek Lok Si Temple'],
    'Johor Bahru': ['Legoland Malaysia', 'Sultan Abu Bakar Mosque', 'Danga Bay'],
  };

  const addRecommendedStop = (place: string) => {
    const emptyStop = formData.stops.find((stop) => !stop.name.trim());

    if (emptyStop) {
      handleUpdateStop(emptyStop.id, { name: place });
      return;
    }

    const newStop: Stop = {
      id: Date.now().toString(),
      name: place,
      duration: 60,
      location: { lat: 3.1579, lng: 101.7116 },
    };

    setFormData((prev) => ({ ...prev, stops: [...prev.stops, newStop] }));
  };

  const handleAddStop = () => {
    const newStop: Stop = {
      id: Date.now().toString(),
      name: '',
      duration: 60,
      location: { lat: 3.1579, lng: 101.7116 },
    };
    setFormData({ ...formData, stops: [...formData.stops, newStop] });
  };

  const handleRemoveStop = (id: string) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((s) => s.id !== id),
    });
  };

  const handleUpdateStop = (id: string, updates: Partial<Stop>) => {
    setFormData({
      ...formData,
      stops: formData.stops.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const toggleService = (service: ServiceType) => {
    const services = formData.servicesNeeded.includes(service)
      ? formData.servicesNeeded.filter((s) => s !== service)
      : [...formData.servicesNeeded, service];
    setFormData({ ...formData, servicesNeeded: services });
  };

  const handleSubmit = () => {
    const tripId = createTrip({
      city: formData.city,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: formData.duration,
      stops: formData.stops,
      requiredServices: formData.servicesNeeded.map((service) => ({ type: service })),
      servicesNeeded: formData.servicesNeeded,
      groupSize: formData.groupSize,
      notes: formData.notes,
      isPreDesigned: false,
      isNegotiable: true,
      createdByRole: user?.role || 'traveler',
    });

    navigate(`/traveler/trip/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Create Custom Trip"
        showBack
        onBack={() => step > 1 ? setStep(step - 1) : navigate(-1)}
      />

      <div className="max-w-md mx-auto p-4">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {step} of 4
          </p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Where and When?
            </h2>

            <Select
              label="City"
              options={[
                { value: 'Kuala Lumpur', label: 'Kuala Lumpur' },
                { value: 'Penang', label: 'Penang' },
                { value: 'Johor Bahru', label: 'Johor Bahru' },
              ]}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Recommended places in {formData.city}</p>
              <div className="flex flex-wrap gap-2">
                {(recommendationsByCity[formData.city] || []).map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => addRecommendedStop(place)}
                    className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100"
                  >
                    + {place}
                  </button>
                ))}
              </div>
            </div>

            <Input
              type="date"
              label="Start Date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />

            <Input
              type="date"
              label="End Date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />

            <Input
              type="number"
              label="Duration (days)"
              value={formData.duration.toString()}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
              min="1"
              required
            />

            <Button
              variant="primary"
              onClick={() => setStep(2)}
              className="w-full mt-6"
              disabled={!formData.startDate || !formData.endDate}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Route & Stops */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Plan Your Route
            </h2>

            <div className="space-y-3">
              {formData.stops.map((stop, index) => (
                <div key={stop.id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Stop {index + 1}</span>
                    {formData.stops.length > 1 && (
                      <button
                        onClick={() => handleRemoveStop(stop.id)}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <Input
                    placeholder="Location name"
                    value={stop.name}
                    onChange={(e) => handleUpdateStop(stop.id, { name: e.target.value })}
                    className="mb-2"
                  />

                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={stop.duration.toString()}
                    onChange={(e) =>
                      handleUpdateStop(stop.id, { duration: parseInt(e.target.value) || 60 })
                    }
                    min="15"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleAddStop}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Stop
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <p className="text-sm text-blue-800">
                💡 Tip: Add all the places you want to visit. Suppliers will plan the best route.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                className="flex-1"
                disabled={formData.stops.some((s) => !s.name)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What Services Do You Need?
            </h2>

            <div className="space-y-3">
              {(['driver', 'guide', 'translator', 'activity_provider'] as ServiceType[]).map(
                (service) => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.servicesNeeded.includes(service)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize mb-1">
                          {service.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {service === 'driver' && 'Transportation for your group'}
                          {service === 'guide' && 'Local expert to show you around'}
                          {service === 'translator' && 'Language assistance'}
                          {service === 'activity_provider' && 'Specialized activity coach/operator'}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          formData.servicesNeeded.includes(service)
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {formData.servicesNeeded.includes(service) && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>

            <Input
              type="number"
              label="Group Size"
              value={formData.groupSize.toString()}
              onChange={(e) =>
                setFormData({ ...formData, groupSize: parseInt(e.target.value) || 1 })
              }
              min="1"
              max="20"
              required
            />

            <TextArea
              label="Additional Notes (Optional)"
              placeholder="Any special requirements or preferences..."
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(4)}
                className="flex-1"
                disabled={formData.servicesNeeded.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Review & Publish
            </h2>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Destination</h3>
                <p className="text-lg font-semibold text-gray-900">{formData.city}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Duration</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.duration} day{formData.duration > 1 ? 's' : ''} • {formData.stops.length} stops
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Dates</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.startDate} to {formData.endDate}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Services</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.servicesNeeded.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize"
                    >
                      {service.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Group Size</h3>
                <p className="text-lg font-semibold text-gray-900">{formData.groupSize} people</p>
              </div>

              {formData.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Notes</h3>
                  <p className="text-gray-700">{formData.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                ✓ Your trip will be published and verified suppliers will send you offers within 24 hours.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button variant="primary" onClick={handleSubmit} className="flex-1">
                Publish Trip
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
