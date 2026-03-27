import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Input, OTPInput, Button } from '../../components/design-system/Inputs';
import { UserRole } from '../../types';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as UserRole || 'traveler';
  const { login } = useApp();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('otp');
      }, 1000);
    }
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setLoading(true);
      setTimeout(() => {
        login(email, role);
        
        // Navigate based on role
        if (role === 'traveler') {
          navigate('/traveler');
        } else {
          // Supplier goes to verification if pending
          navigate('/supplier/verification');
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <button
          onClick={() => step === 'otp' ? setStep('email') : navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-md mx-auto w-full">
        {step === 'email' ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">
                Enter your email or phone number to continue
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email or Phone"
                placeholder="john@example.com or +60123456789"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
              >
                Continue
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span className="font-medium text-gray-700">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span className="font-medium text-gray-700">Apple</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h1>
              <p className="text-gray-600">
                We sent a code to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  6-Digit Code
                </label>
                <OTPInput value={otp} onChange={setOtp} />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={otp.length !== 6}
                className="w-full"
              >
                Verify & Continue
              </Button>

              <button
                type="button"
                className="w-full text-center text-blue-600 font-medium hover:text-blue-700"
              >
                Resend Code
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
