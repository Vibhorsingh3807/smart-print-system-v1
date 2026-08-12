import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12">
      <div className="max-w-4xl mx-auto glass-card p-8 rounded-2xl border border-slate-800">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-6 hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4" /> Back to SRM Print System
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-indigo-500" />
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        </div>
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p><strong>Effective Date:</strong> August 12, 2026</p>
          <p>SRM Smart Print System ("we", "our", or "us") is committed to protecting the privacy of students and staff using our college print management portal.</p>
          
          <h2 className="text-sm font-bold text-white mt-4">1. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Personal Data:</strong> Full Name, SRM Student Roll Number, SRM Email Address.</li>
            <li><strong>Document Data:</strong> Files uploaded for printing (PDF, DOCX, Images). Files are securely stored temporarily during printing and automatically purged after job fulfillment.</li>
            <li><strong>Transaction Data:</strong> Payment order IDs, transaction timestamps, and print logs. We do not store raw card numbers or UPI PINs.</li>
          </ul>

          <h2 className="text-sm font-bold text-white mt-4">2. Use of Information</h2>
          <p>We use your information strictly to process print orders, calculate printing fees, communicate print job statuses, and prevent unauthorized service abuse.</p>

          <h2 className="text-sm font-bold text-white mt-4">3. Data Security</h2>
          <p>All communications are encrypted over HTTPS/TLS. Documents are strictly accessible by authorized campus print operators and automated print agents.</p>

          <h2 className="text-sm font-bold text-white mt-4">4. Third-Party Services</h2>
          <p>Online payments are processed securely via <strong>Razorpay Payment Gateway</strong>. Payment details are handled under Razorpay's PCI-DSS compliant infrastructure.</p>

          <h2 className="text-sm font-bold text-white mt-4">5. Contact Us</h2>
          <p>For privacy inquiries, reach us at: <code>support@srmprint.ac.in</code></p>
        </div>
      </div>
    </div>
  );
};
