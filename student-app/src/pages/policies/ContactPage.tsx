import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ArrowLeft } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12">
      <div className="max-w-4xl mx-auto glass-card p-8 rounded-2xl border border-slate-800">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-6 hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4" /> Back to Print Helper System
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <Mail className="h-8 w-8 text-indigo-500" />
          <h1 className="text-2xl font-bold text-white">Contact Us</h1>
        </div>
        <div className="space-y-6 text-xs text-slate-300">
          <p>Have questions or need assistance with your print jobs? Reach out to our campus support team.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white text-xs">Campus Address</h3>
                <p className="text-slate-400 mt-1">
                  Print Helper Center, Main Tech Park Ground Floor,<br />
                  Campus Main Block,<br />
                  Tech Campus - 603203
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <Mail className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white text-xs">Email Support</h3>
                <p className="text-slate-400 mt-1">support@printhelper.ac.in</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Responses within 24 hours</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <Phone className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white text-xs">Support Helpline</h3>
                <p className="text-slate-400 mt-1">+91 044 2741 7000</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Mon - Sat: 8:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
