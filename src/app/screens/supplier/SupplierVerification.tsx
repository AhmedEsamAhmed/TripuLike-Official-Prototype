import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/design-system/Badges';
import { Button, Input } from '../../components/design-system/Inputs';
import { Upload, CheckCircle2, Clock } from 'lucide-react';

export default function SupplierVerification() {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const [step, setStep] = useState<'upload' | 'pending' | 'approved' | 'rejected'>(
    user?.verificationStatus === 'pending' ? 'pending' :
    user?.verificationStatus === 'verified' ? 'approved' :
    user?.verificationStatus === 'rejected' ? 'rejected' : 'upload'
  );

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    dateOfBirth: '',
    operatingLocation: user?.operatingLocation || user?.location || '',
    idNumber: '',
    licenseNumber: '',
    vehicleType: user?.vehicleInfo?.type || '',
    vehicleModel: user?.vehicleInfo?.model || '',
    plateNumber: user?.vehicleInfo?.plateNumber || '',
    guideSpecialtiesInput: (user?.guideSpecialties || []).join(', '),
    yearsOfExperience: '',
    languageFrom: '',
    languageTo: '',
    languagePairs: user?.languages || [],
    activityTypes: [] as string[],
    groupSize: '8',
    docs: {
      motacOrTobtab: false,
      psv: false,
      tourismVehicleLicense: false,
      idPassport: false,
      insuranceProof: false,
    },
  });

  const activityTypeOptions = ['sea', 'indoor', 'outdoor', 'adventure', 'wellness', 'family'];

  const toggleActivityType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      activityTypes: prev.activityTypes.includes(type)
        ? prev.activityTypes.filter((item) => item !== type)
        : [...prev.activityTypes, type],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const docs = formData.docs;
    const requiresDrivingLicenses = user?.role === 'driver';
    const missingRequiredDocs = [
      !docs.idPassport,
      !docs.insuranceProof,
      !docs.motacOrTobtab,
      requiresDrivingLicenses && !docs.psv,
      requiresDrivingLicenses && !docs.tourismVehicleLicense,
    ].some(Boolean);

    if (missingRequiredDocs) {
      alert('Please complete all required verification documents before submission.');
      return;
    }

    const guideSpecialties = formData.guideSpecialtiesInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const mergedLanguages = formData.languagePairs;

    updateUser({
      name: formData.fullName || user?.name,
      serviceType:
        user?.role === 'driver'
          ? 'driver'
          : user?.role === 'guide'
          ? 'guide'
          : user?.role === 'translator'
          ? 'translator'
          : 'activity_provider',
      licenseNumber: formData.licenseNumber,
      vehicleInfo:
        user?.role === 'driver'
          ? {
              type: formData.vehicleType,
              model: formData.vehicleModel,
              plateNumber: formData.plateNumber,
            }
          : user?.vehicleInfo,
      guideSpecialties: user?.role === 'guide' ? guideSpecialties : user?.guideSpecialties,
      languages: user?.role === 'translator' ? mergedLanguages : user?.languages,
      activityTypes: user?.role === 'activity_operator' ? formData.activityTypes : user?.activityTypes,
      operatingLocation: formData.operatingLocation,
      location: formData.operatingLocation,
      bio:
        user?.role === 'translator'
          ? `Translator with ${formData.yearsOfExperience || 'several'} years experience.`
          : user?.bio,
      specialties: [
        user?.role === 'driver' ? 'driver' : '',
        ...(user?.role === 'guide' ? guideSpecialties : []),
        user?.role === 'translator' ? 'translator' : '',
        user?.role === 'activity_operator' ? 'activity_provider' : '',
        ...formData.activityTypes,
      ].filter(Boolean),
      verificationStatus: 'pending',
    });
    setStep('pending');
  };

  const addLanguagePair = () => {
    if (!formData.languageFrom || !formData.languageTo) {
      return;
    }

    const pair = { from: formData.languageFrom, to: formData.languageTo };
    const exists = formData.languagePairs.some(
      (item) => item.from === pair.from && item.to === pair.to
    );

    if (exists) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      languagePairs: [...prev.languagePairs, pair],
      languageFrom: '',
      languageTo: '',
    }));
  };

  const removeLanguagePair = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languagePairs: prev.languagePairs.filter((_, idx) => idx !== index),
    }));
  };

  const simulateApproval = () => {
    updateUser({ verificationStatus: 'verified' });
    setStep('approved');
  };

  const simulateRejection = () => {
    updateUser({
      verificationStatus: 'rejected',
      verificationRejectionReason: 'License document is not clear. Please upload a higher quality image.',
    });
    setStep('rejected');
  };

  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Verification In Progress
          </h1>
          
          <p className="text-gray-600 mb-6">
            We're reviewing your documents. This usually takes 24-48 hours. We'll notify you once approved.
          </p>

          <StatusBadge status="pending" />

          <div className="mt-8 space-y-3">
            <Button variant="primary" onClick={simulateApproval} className="w-full">
              🎬 Simulate Approval
            </Button>
            <Button variant="secondary" onClick={simulateRejection} className="w-full">
              🎬 Simulate Rejection
            </Button>
          </div>

          <button
            onClick={() => navigate('/supplier')}
            className="mt-6 text-blue-600 font-medium hover:text-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (step === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Verification Approved! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Congratulations! You can now accept bookings and start earning.
          </p>

          <StatusBadge status="verified" />

          <Button
            variant="primary"
            onClick={() => navigate('/supplier')}
            className="w-full mt-8"
          >
            Start Exploring
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Verification Rejected
          </h1>
          
          <p className="text-gray-600 mb-4">
            Unfortunately, we couldn't verify your documents.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-red-900 mb-1">Reason:</h3>
            <p className="text-sm text-red-700">{user?.verificationRejectionReason}</p>
          </div>

          <StatusBadge status="rejected" />

          <Button
            variant="primary"
            onClick={() => {
              updateUser({ verificationStatus: 'pending' });
              setStep('upload');
            }}
            className="w-full mt-8"
          >
            Resubmit Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <button
          onClick={() => navigate('/supplier')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supplier Verification
          </h1>
          <p className="text-gray-600">
            Upload your documents to get verified and start accepting bookings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />

          <Input
            label="Preferred Operating Location"
            placeholder="e.g., Kuala Lumpur"
            value={formData.operatingLocation}
            onChange={(e) => setFormData({ ...formData, operatingLocation: e.target.value })}
            required
          />

          {/* ID Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Government ID
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload ID</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <Input
            label="ID Number"
            placeholder="Enter your ID number"
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            required
          />

          {/* License Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {user?.role === 'driver' ? 'PSV / Driver License' : 'MOTAC / TOBTAB License'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload license</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <Input
            label="License Number"
            placeholder="Enter your license number"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            required
          />

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Required Compliance Documents</p>
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.docs.motacOrTobtab}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      docs: { ...prev.docs, motacOrTobtab: e.target.checked },
                    }))
                  }
                />
                MOTAC / TOBTAB license uploaded
              </label>
              {user?.role === 'driver' && (
                <>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.docs.psv}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          docs: { ...prev.docs, psv: e.target.checked },
                        }))
                      }
                    />
                    PSV license uploaded
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.docs.tourismVehicleLicense}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          docs: { ...prev.docs, tourismVehicleLicense: e.target.checked },
                        }))
                      }
                    />
                    Tourism vehicle license uploaded
                  </label>
                </>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.docs.idPassport}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      docs: { ...prev.docs, idPassport: e.target.checked },
                    }))
                  }
                />
                ID / Passport uploaded
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.docs.insuranceProof}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      docs: { ...prev.docs, insuranceProof: e.target.checked },
                    }))
                  }
                />
                Insurance proof uploaded
              </label>
            </div>
            <p className="text-xs text-amber-700 mt-3">Incomplete document sets remain in Pending Approval.</p>
          </div>

          {user?.role === 'driver' && (
            <>
              <Input
                label="Vehicle Type"
                placeholder="e.g., MPV"
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                required
              />
              <Input
                label="Model"
                placeholder="e.g., Toyota Alphard 2023"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                required
              />
              <Input
                label="Plate Number"
                placeholder="e.g., WXY 1832"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                required
              />
            </>
          )}

          {user?.role === 'translator' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language Pair</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    value={formData.languageFrom}
                    onChange={(e) => setFormData({ ...formData, languageFrom: e.target.value })}
                    placeholder="From language"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                  <input
                    value={formData.languageTo}
                    onChange={(e) => setFormData({ ...formData, languageTo: e.target.value })}
                    placeholder="To language"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={addLanguagePair}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Add Language Pair
                </button>
                <div className="mt-3 space-y-2">
                  {formData.languagePairs.map((pair, idx) => (
                    <div key={`${pair.from}-${pair.to}-${idx}`} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                      <span className="text-sm text-blue-900 font-medium">{pair.from} {'->'} {pair.to}</span>
                      <button
                        type="button"
                        onClick={() => removeLanguagePair(idx)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <Input
                label="Years of Experience"
                type="number"
                min="1"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                required
              />
            </>
          )}

          {user?.role === 'guide' && (
            <>
              <Input
                label="Specialties (comma separated)"
                placeholder="e.g., Heritage tours, food tours, hiking"
                value={formData.guideSpecialtiesInput}
                onChange={(e) => setFormData({ ...formData, guideSpecialtiesInput: e.target.value })}
                required
              />
              <Input
                label="Years of Experience"
                type="number"
                min="1"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                required
              />
            </>
          )}

          {user?.role === 'activity_operator' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {activityTypeOptions.map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleActivityType(type)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize ${
                        formData.activityTypes.includes(type)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Group Size"
                type="number"
                min="1"
                value={formData.groupSize}
                onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                required
              />
            </>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Privacy Notice:</strong> Your documents are encrypted and only used for verification purposes.
            </p>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Submit for Verification
          </Button>
        </form>
      </div>
    </div>
  );
}
