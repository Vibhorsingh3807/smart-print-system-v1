import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios.js';
import { useAuth } from '../context/AuthContext.js';
import { UploadCloud, FileText, CheckCircle2, DollarSign, Printer, Sliders, AlertCircle, Trash2, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { PaperSize, Orientation, ColorMode, DuplexMode, PaymentMethod } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Multiple Files State
  const [files, setFiles] = useState<File[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Print Configuration Options
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<Orientation>('PORTRAIT');
  const [colorMode, setColorMode] = useState<ColorMode>('BW');
  const [duplex, setDuplex] = useState<DuplexMode>('SINGLE');
  const [copies, setCopies] = useState<number>(1);
  const [pageRange, setPageRange] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');

  // Payment Gateway Modal
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'PROCESSING' | 'SUCCESS'>('PROCESSING');

  // Status
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles((prev) => [...prev, ...acceptedFiles]);
      setError('');
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (activePreviewIndex >= updated.length) {
        setActivePreviewIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    multiple: true,
  });

  useEffect(() => {
    if (files.length > 0 && files[activePreviewIndex]) {
      const activeFile = files[activePreviewIndex];
      if (activeFile.type === 'application/pdf') {
        const url = URL.createObjectURL(activeFile);
        setFilePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
    setFilePreviewUrl(null);
  }, [files, activePreviewIndex]);

  useEffect(() => {
    const calculateCost = async () => {
      if (files.length === 0) {
        setEstimatedCost(0);
        return;
      }
      try {
        const res = await api.post('/jobs/estimate', {
          pageCount: 1,
          copies,
          paperSize,
          colorMode,
          duplex,
          fileCount: files.length,
        });
        setEstimatedCost(res.data.data.estimatedCost);
      } catch (_err) {
        let rate = colorMode === 'COLOR' ? 10.0 : 2.0;
        if (paperSize === 'A3') rate *= 2.0;
        if (duplex === 'DOUBLE') rate *= 0.85;
        setEstimatedCost(parseFloat((copies * rate * files.length).toFixed(2)));
      }
    };

    calculateCost();
  }, [files.length, copies, paperSize, colorMode, duplex]);

  const executeSubmission = async (selectedMethod: PaymentMethod) => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach((f) => {
        formData.append('files', f);
      });
      formData.append('paperSize', paperSize);
      formData.append('orientation', orientation);
      formData.append('colorMode', colorMode);
      formData.append('duplex', duplex);
      formData.append('copies', copies.toString());
      formData.append('pageRange', pageRange);
      formData.append('paymentMethod', selectedMethod);

      const res = await api.post('/jobs/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        if (selectedMethod === 'ONLINE') {
          const createdJobs = res.data.data.jobs || [];
          const totalAmount = createdJobs.reduce((sum: number, j: any) => sum + (j.cost || 0), 0) || estimatedCost || 2.0;
          const mainJobId = createdJobs[0]?.id;

          try {
            // STEP 1: Backend - Create Order
            const orderRes = await api.post('/payments/create-order', {
              amount: totalAmount,
              currency: 'INR',
              jobId: mainJobId,
            });

            const orderData = orderRes.data.data;

            // STEP 2: Frontend - Open Razorpay Modal
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.keyId || 'rzp_test_TOxIcmh98AiASe',
              amount: orderData.amount, // in paise
              currency: orderData.currency || 'INR',
              name: 'SRM Smart Print System',
              description: `Print Payment - ${createdJobs.length} Document(s)`,
              order_id: orderData.orderId,
              handler: async function (response: any) {
                setShowPaymentModal(true);
                setPaymentStep('PROCESSING');
                try {
                  // STEP 3: Backend - Verify Signature
                  await api.post('/payments/verify-payment', {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    jobId: mainJobId,
                  });
                  setPaymentStep('SUCCESS');
                  setTimeout(() => {
                    setShowPaymentModal(false);
                    navigate('/track');
                  }, 1800);
                } catch (verifyErr: any) {
                  setShowPaymentModal(false);
                  setError(verifyErr.response?.data?.message || 'Payment verification failed.');
                }
              },
              prefill: {
                name: user?.fullName || '',
                email: user?.email || '',
              },
              theme: {
                color: '#4f46e5',
              },
              modal: {
                ondismiss: function () {
                  setLoading(false);
                  setShowPaymentModal(false);
                  setError('Razorpay payment cancelled by user.');
                },
              },
            };

            const triggerCheckout = () => {
              const rzp = new (window as any).Razorpay(options);
              rzp.on('payment.failed', function (response: any) {
                setShowPaymentModal(false);
                setError(`Payment Failed: ${response.error?.description || 'Transaction declined'}`);
              });
              rzp.open();
            };

            if (typeof (window as any).Razorpay !== 'undefined') {
              triggerCheckout();
            } else {
              const script = document.createElement('script');
              script.src = 'https://checkout.razorpay.com/v1/checkout.js';
              script.async = true;
              script.onload = triggerCheckout;
              document.body.appendChild(script);
            }
          } catch (orderErr: any) {
            setError(orderErr.response?.data?.message || 'Failed to create Razorpay payment order');
          }
        } else {
          navigate('/track');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit print job');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please upload at least one document to proceed');
      return;
    }
    executeSubmission(paymentMethod);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Submit Print Jobs</h1>
          <p className="text-xs text-slate-400 mt-1">Upload PDF or DOCX documents for automated campus printing</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">A4 B&W: <strong className="text-white">₹2/pg</strong></span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
            <Printer className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-300">Color: <strong className="text-white">₹10/pg</strong></span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Multi-File Dropzone & List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-indigo-400" /> Upload Documents
              </h3>
              {files.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {files.length} file(s) selected
                </span>
              )}
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                  : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-indigo-400 shadow-xl">
                <UploadCloud className="h-7 w-7" />
              </div>
              <p className="text-xs font-bold text-white mb-1">
                Drag & Drop PDF or DOCX files (Multiple allowed)
              </p>
              <p className="text-[11px] text-slate-400">or click to browse from computer (Max 50MB per file)</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-semibold text-slate-300">Selected Batch Files:</p>
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {files.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePreviewIndex(idx)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        activePreviewIndex === idx
                          ? 'bg-indigo-950/40 border-indigo-500/40'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div className="truncate max-w-xs">
                          <p className="text-xs font-bold text-white truncate">{f.name}</p>
                          <p className="text-[10px] text-slate-400">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filePreviewUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-72">
                <iframe src={filePreviewUrl} title="Document Preview" className="w-full h-full border-none" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Options & Payment Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-purple-400" /> Print Configuration
            </h3>

            {/* Paper Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Paper Size</label>
              <div className="grid grid-cols-2 gap-3">
                {(['A4', 'A3'] as PaperSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPaperSize(size)}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                      paperSize === size
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {size} Standard
                  </button>
                ))}
              </div>
            </div>

            {/* Color Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Color Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setColorMode('BW')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                    colorMode === 'BW'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Monochrome (B&W)
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode('COLOR')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                    colorMode === 'COLOR'
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Full Color
                </button>
              </div>
            </div>

            {/* Duplex Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Sides</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDuplex('SINGLE')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                    duplex === 'SINGLE'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Single-Sided
                </button>
                <button
                  type="button"
                  onClick={() => setDuplex('DOUBLE')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition ${
                    duplex === 'DOUBLE'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Double-Sided (Duplex)
                </button>
              </div>
            </div>

            {/* Copies */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Copies / Document</label>
              <input
                type="number"
                min="1"
                max="100"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Payment Option</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/50 ring-1 ring-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <CreditCard className={`h-5 w-5 ${paymentMethod === 'ONLINE' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <p className={`text-xs font-bold ${paymentMethod === 'ONLINE' ? 'text-white' : 'text-slate-400'}`}>Pay Online Now</p>
                    <p className="text-[10px] text-emerald-400">⚡ Auto Instant Print</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                    paymentMethod === 'CASH'
                      ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500/50 ring-1 ring-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Banknote className={`h-5 w-5 ${paymentMethod === 'CASH' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <p className={`text-xs font-bold ${paymentMethod === 'CASH' ? 'text-white' : 'text-slate-400'}`}>Pay Cash Counter</p>
                    <p className="text-[10px] text-amber-400">⏳ Staff Approval Required</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Total Cost Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/20 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Total Cost ({files.length} doc)</p>
                <p className="text-2xl font-black text-emerald-400">₹{estimatedCost.toFixed(2)}</p>
              </div>
              <button
                type="submit"
                disabled={loading || files.length === 0}
                className={`py-3 px-5 rounded-xl text-white font-bold text-xs shadow-xl transition disabled:opacity-50 flex items-center gap-2 ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                }`}
              >
                {loading
                  ? 'Processing...'
                  : paymentMethod === 'ONLINE'
                  ? 'Pay Now & Print ⚡'
                  : 'Submit Order (Cash) ⏳'}
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Simulated Online Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-8 max-w-sm w-full border border-slate-800 text-center space-y-5">
            {paymentStep === 'PROCESSING' ? (
              <>
                <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-white">Processing Instant Payment...</h3>
                  <p className="text-xs text-slate-400 mt-1">Connecting to SRM Campus UPI Gateway (₹{estimatedCost.toFixed(2)})</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                  <ShieldCheck className="h-10 w-10 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Payment Successful! 🎉</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">Prepaid Order Verified</p>
                  <p className="text-[11px] text-slate-400 mt-2">Your document has been sent directly to the automatic printer queue.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
