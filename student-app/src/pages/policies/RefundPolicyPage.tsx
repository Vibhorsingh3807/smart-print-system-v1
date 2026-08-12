import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12">
      <div className="max-w-4xl mx-auto glass-card p-8 rounded-2xl border border-slate-800">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-6 hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4" /> Back to Print Helper System
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw className="h-8 w-8 text-indigo-500" />
          <h1 className="text-2xl font-bold text-white">Refund & Cancellation Policy</h1>
        </div>
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p><strong>Effective Date:</strong> August 12, 2026</p>
          <p>At Print Helper System, we strive for 100% printing accuracy and student satisfaction. This policy outlines our cancellation and refund procedures:</p>
          
          <h2 className="text-sm font-bold text-white mt-4">1. Order Cancellations</h2>
          <p>Print jobs in <code>WAITING</code> status can be cancelled prior to operator approval. Once a print job status changes to <code>PRINTING</code> or <code>COMPLETED</code>, cancellation is no longer possible as physical paper resources have been used.</p>

          <h2 className="text-sm font-bold text-white mt-4">2. Eligible Refund Scenarios</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Printer Hardware Faults:</strong> Paper jam, ink smear, or illegible print output caused by hardware failure.</li>
            <li><strong>Order Rejection:</strong> Job rejected by stationery staff due to technical incompatibility after online payment was deducted.</li>
            <li><strong>Duplicate Charges:</strong> Accidental double charge for a single print job.</li>
          </ul>

          <h2 className="text-sm font-bold text-white mt-4">3. Refund Processing Timeline</h2>
          <p>Approved refunds are credited back automatically to the original payment source (UPI / Debit Card / NetBanking) via Razorpay within <strong>5 to 7 working days</strong>.</p>

          <h2 className="text-sm font-bold text-white mt-4">4. Requesting a Refund</h2>
          <p>To request a refund, report the job issue at the campus counter or email support at <code>support@printhelper.ac.in</code> with your Job ID and Student Roll Number.</p>
        </div>
      </div>
    </div>
  );
};
