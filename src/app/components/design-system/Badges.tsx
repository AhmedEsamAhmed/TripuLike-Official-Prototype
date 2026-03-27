import React from 'react';
import { TripStatus, VerificationStatus } from '../../types';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TripStatus | VerificationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    // Trip statuses
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
    open: { label: 'Open', className: 'bg-blue-100 text-blue-700' },
    negotiating: { label: 'Negotiating', className: 'bg-yellow-100 text-yellow-700' },
    price_locked: { label: 'Price Locked', className: 'bg-purple-100 text-purple-700' },
    booked: { label: 'Booked', className: 'bg-green-100 text-green-700' },
    started: { label: 'Started', className: 'bg-emerald-100 text-emerald-700' },
    completed: { label: 'Completed', className: 'bg-teal-100 text-teal-700' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
    reviewed: { label: 'Reviewed', className: 'bg-indigo-100 text-indigo-700' },
    
    // Verification statuses
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    verified: { label: 'Verified', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  };

  const { label, className } = config[status] || config.draft;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {status === 'verified' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'rejected' && <XCircle className="w-3 h-3" />}
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {label}
    </span>
  );
}

interface VerificationBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md';
}

export function VerificationBadge({ verified, size = 'md' }: VerificationBadgeProps) {
  if (!verified) return null;

  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="inline-flex items-center gap-1 text-green-600">
      <CheckCircle2 className={sizeClass} />
      {size === 'md' && <span className="text-xs font-medium">Verified</span>}
    </div>
  );
}

interface EmergencyAlertProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function EmergencyAlert({ onClose, onConfirm }: EmergencyAlertProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold">Emergency Alert</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to trigger an emergency alert? This will notify our support team and log the current trip details.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium"
          >
            Trigger Alert
          </button>
        </div>
      </div>
    </div>
  );
}

interface EscrowIndicatorProps {
  amount: number;
}

export function EscrowIndicator({ amount }: EscrowIndicatorProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Secure Escrow Payment</h3>
          <p className="text-sm text-gray-600 mb-2">
            Your payment of RM {amount.toFixed(2)} is held securely until trip completion.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Payment released after successful trip</li>
            <li>• Full refund protection</li>
            <li>• 24/7 support available</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface PaymentSummaryBoxProps {
  finalPrice: number;
  depositAmount?: number;
  commission?: number;
  supplierPayout?: number;
  showSupplierView?: boolean;
}

export function PaymentSummaryBox({
  finalPrice,
  depositAmount,
  commission,
  supplierPayout,
  showSupplierView = false,
}: PaymentSummaryBoxProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Payment Summary</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Trip Price</span>
          <span className="font-medium">RM {finalPrice.toFixed(2)}</span>
        </div>
        
        {depositAmount && (
          <div className="flex justify-between">
            <span className="text-gray-600">Deposit (50%)</span>
            <span className="font-medium">RM {depositAmount.toFixed(2)}</span>
          </div>
        )}
        
        {showSupplierView && commission && (
          <div className="flex justify-between text-red-600">
            <span>Platform Commission (17.5%)</span>
            <span className="font-medium">- RM {commission.toFixed(2)}</span>
          </div>
        )}
        
        {showSupplierView && supplierPayout && (
          <>
            <div className="border-t border-gray-300 pt-2 mt-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Your Payout</span>
              <span className="text-green-600">RM {supplierPayout.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface CommissionIndicatorProps {
  totalRevenue: number;
  commission: number;
  netPayout: number;
}

export function CommissionIndicator({ totalRevenue, commission, netPayout }: CommissionIndicatorProps) {
  const commissionPercentage = (commission / totalRevenue) * 100;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-600 mb-3">Earnings Breakdown</h3>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Total Revenue</span>
            <span className="font-semibold">RM {totalRevenue.toFixed(2)}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-600">Commission ({commissionPercentage.toFixed(1)}%)</span>
            <span className="font-medium text-red-600">- RM {commission.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Net Payout</span>
            <span className="font-bold text-green-600 text-lg">RM {netPayout.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
