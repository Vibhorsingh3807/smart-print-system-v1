import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12">
      <div className="max-w-4xl mx-auto glass-card p-8 rounded-2xl border border-slate-800">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-6 hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4" /> Back to Print Helper System
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-indigo-500" />
          <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
        </div>
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p><strong>Effective Date:</strong> August 12, 2026</p>
          <p>Welcome to Print Helper System. By accessing or using our print system, you agree to comply with the following terms:</p>
          
          <h2 className="text-sm font-bold text-white mt-4">1. Service Description</h2>
          <p>Print Helper System facilitates cloud document submission, automated cost estimation, queue management, and print dispatch to authorized campus stationery counters.</p>

          <h2 className="text-sm font-bold text-white mt-4">2. User Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Users must provide accurate college email credentials during registration.</li>
            <li>Users are strictly prohibited from submitting copyrighted illegal material or objectionable documents for printing.</li>
            <li>Users are responsible for verifying document formatting before submitting print orders.</li>
          </ul>

          <h2 className="text-sm font-bold text-white mt-4">3. Pricing & Payment</h2>
          <p>Print rates are calculated based on paper size (A4/A3), color mode (B&W/Color), and duplex settings. Payments must be completed online via Razorpay or at the cash counter prior to document release.</p>

          <h2 className="text-sm font-bold text-white mt-4">4. Governing Law</h2>
          <p>These terms are governed by the laws of India and subject to the jurisdiction of Chennai courts.</p>
        </div>
      </div>
    </div>
  );
};
