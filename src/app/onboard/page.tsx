"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ArrowRight, ShieldCheck, Store, MapPin, Mail, Lock, Phone, 
  FileText, Building2, CheckCircle2, AlertCircle, Upload, Video, Image, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MerchantOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
    contactName: "",
    storeName: "",
    storeType: "stationary", // stationary | mobile
    description: "",
    taxId: "", // (GST optional)
    aadharNumber: "",
    address: ""
  });

  // Simulated Media State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string>("");
  const [imageConsent, setImageConsent] = useState(false);

  // Validation / OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    special: false
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });
    setPasswordCriteria({
      length: val.length >= 8,
      number: /[0-9]/.test(val),
      special: /[^A-Za-z0-9]/.test(val)
    });
  };

  const handleSendOtp = () => {
    if (formData.phone.length < 10) return;
    setOtpSent(true);
    setOtpError("");
    alert("Mock OTP Sent via WhatsApp! Enter '1234' to verify.");
  };

  const handleVerifyOtp = () => {
    if (formData.otp === "1234") {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Invalid code. Use '1234' for verification.");
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/");
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1200);
  };

  const isStepValid = () => {
    if (step === 1) {
      return (
        formData.email.includes("@") &&
        passwordCriteria.length &&
        passwordCriteria.number &&
        passwordCriteria.special &&
        otpVerified &&
        formData.contactName.trim().length > 1
      );
    }
    if (step === 2) {
      return (
        formData.storeName.trim().length > 2 && 
        formData.description.trim().length > 5 &&
        uploadedImages.length >= 5 &&
        imageConsent
      );
    }
    if (step === 3) {
      return (
        formData.aadharNumber.trim().length === 12 && 
        formData.address.trim().length > 8
      );
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#090a16] text-slate-100 font-sans flex text-sm">
      {/* Left Column: Branding / Value Prop (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-[#141834] via-[#0f1228] to-[#090a16] flex-col justify-between relative overflow-hidden border-r border-indigo-500/10">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Logo strip */}
        <div className="relative z-10 px-24 pt-24 pb-0">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚀</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-none">
                ProxiHub Partner
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/60 mt-1.5">
                Merchant Network
              </span>
            </div>
          </div>
        </div>

        {/* Main value proposition */}
        <div className="relative z-10 px-24 py-20 flex flex-col gap-12">
          {/* Eyebrow tag */}
          <span className="inline-flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Hyperlocal Commerce Platform
          </span>

          <h1 className="text-[2.6rem] font-black tracking-tight leading-[1.15] text-slate-100">
            Connect directly with customers in your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              neighborhood.
            </span>
          </h1>

          <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
            Onboard in under 5 minutes to launch collective pools, broadcast your live cart routes, and publish geofenced ads to 10,000+ local buyers.
          </p>

          {/* Feature cards */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-6 bg-white/[0.03] hover:bg-white/[0.05] transition-colors p-8 rounded-2xl border border-indigo-500/10">
              <span className="text-2xl mt-0.5 flex-shrink-0">🗺️</span>
              <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-sm text-slate-100">5km Geofenced Visibility</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Show up instantly on local discovery radars and route maps.</p>
              </div>
            </div>
            <div className="flex items-start gap-6 bg-white/[0.03] hover:bg-white/[0.05] transition-colors p-8 rounded-2xl border border-indigo-500/10">
              <span className="text-2xl mt-0.5 flex-shrink-0">🎙️</span>
              <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-sm text-slate-100">Voice-First Broadcasts</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Announce daily specials in Tamil, Hindi, Telugu or English.</p>
              </div>
            </div>
            <div className="flex items-start gap-6 bg-white/[0.03] hover:bg-white/[0.05] transition-colors p-8 rounded-2xl border border-indigo-500/10">
              <span className="text-2xl mt-0.5 flex-shrink-0">📦</span>
              <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-sm text-slate-100">Collective Group Pools</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Drive bulk orders from the neighborhood at discounted rates.</p>
              </div>
            </div>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center gap-12 pt-8 border-t border-slate-800/50 mt-4">
            <div className="flex flex-col gap-1">
              <span className="text-xl font-black text-slate-100">10,000+</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Local Buyers</span>
            </div>
            <div className="w-px h-9 bg-slate-800"></div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-black text-slate-100">5 min</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">To Go Live</span>
            </div>
            <div className="w-px h-9 bg-slate-800"></div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-black text-slate-100">5km</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Radius Reach</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-24 pb-20">
          <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
            &copy; 2026 ProxiHub Technologies. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column: Dynamic Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 sm:px-16 sm:py-20 md:px-24 md:py-24 relative bg-[#090a16] overflow-y-auto">
        {/* Mobile Header */}
        <div className="w-full flex lg:hidden items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">ProxiHub</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-xs font-bold text-slate-400 hover:text-slate-200">
            Cancel
          </Button>
        </div>

        <div className="w-full max-w-md flex flex-col gap-9">
          {/* Progress Timeline Stepper */}
          {step < 4 && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>Step {step} of 3</span>
                <span className="text-indigo-455">{step === 1 ? "Account Setup" : step === 2 ? "Store profile" : "Verification"}</span>
              </div>
              <div className="w-full h-1.5 bg-[#161a30] rounded-full overflow-hidden flex gap-1">
                <div className={`h-full rounded-full transition-all duration-300 ${step >= 1 ? "bg-gradient-to-r from-blue-500 to-indigo-500 w-1/3" : "w-0"}`}></div>
                <div className={`h-full rounded-full transition-all duration-300 ${step >= 2 ? "bg-gradient-to-r from-indigo-500 to-purple-500 w-1/3" : "w-0"}`}></div>
                <div className={`h-full rounded-full transition-all duration-300 ${step >= 3 ? "bg-gradient-to-r from-purple-500 to-pink-500 w-1/3" : "w-0"}`}></div>
              </div>
            </div>
          )}

          {/* Form Step Headers */}
          {step < 4 && (
            <div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                {step === 1 ? "Create Merchant Account" : step === 2 ? "Configure Storefront" : "Register Business Verification"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                {step === 1 ? "Start by configuring credentials for your business entry point." : 
                 step === 2 ? "Describe store parameters to customize buyer viewports." : 
                 "Provide legal registration context to satisfy local dispatch codes."}
              </p>
            </div>
          )}

          {/* Form Content Panel */}
          <div className="flex flex-col gap-5">
            {step === 4 && (
              <div className="w-full bg-[#0d121f] rounded-3xl border border-slate-900 overflow-hidden shadow-2xl flex flex-col transition-all duration-300">
                {/* Green Header */}
                <div className="bg-[#10b981] p-8 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">✓</span>
                  </div>
                  <h3 className="text-lg font-black tracking-widest text-white uppercase mt-1">SUCCESS</h3>
                </div>

                {/* Body Content */}
                <div className="p-8 flex flex-col items-center text-center gap-6">
                  <p className="text-sm text-slate-350 font-semibold leading-relaxed max-w-xs">
                    Congratulations, your account has been successfully created.
                  </p>
                  <Button
                    onClick={() => {
                      localStorage.setItem("merchantEmail", formData.email);
                      localStorage.setItem("merchantName", formData.storeName);
                      localStorage.setItem("merchantOnboarded", "true");
                      router.push(`/?role=vendor&login=true`);
                    }}
                    className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold h-11 px-8 rounded-full transition-all duration-200 shadow-lg shadow-emerald-500/10"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4 w-full">
                {/* Google Sign-in Option */}
                <div className="flex flex-col gap-2.5 pb-2 border-b border-indigo-500/10 w-full">
                  <Button 
                    type="button"
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        email: "merchant.google@gmail.com",
                        contactName: "Google Partner Business"
                      });
                      alert("Successfully connected with Google! Email collected: merchant.google@gmail.com");
                    }}
                    className="w-full bg-[#161a30] hover:bg-[#1e2445] text-slate-200 border border-indigo-500/20 text-xs font-bold h-11 rounded-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">Contact Person Name</Label>
                  <Input 
                    type="text" 
                    placeholder="Full legal name" 
                    value={formData.contactName} 
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} 
                    className="bg-[#0e1227] border border-indigo-500/10 focus-visible:ring-[#6366f1] text-sm h-11 w-full text-slate-100 px-4 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">Business Email</Label>
                  <Input 
                    type="email" 
                    placeholder="store@gmail.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    className="bg-[#0e1227] border border-indigo-500/10 focus-visible:ring-[#6366f1] text-sm h-11 w-full text-slate-100 px-4 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">Account Password</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter strong password" 
                    value={formData.password} 
                    onChange={handlePasswordChange}
                    className="bg-[#0e1227] border border-indigo-500/10 focus-visible:ring-[#6366f1] text-sm h-11 w-full text-slate-100 px-4 rounded-xl"
                  />
                  
                  {/* Password Checklist UI */}
                  <div className="flex flex-wrap gap-2.5 mt-1.5 pl-1">
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${passwordCriteria.length ? "text-emerald-450" : "text-slate-500"}`}>
                      {passwordCriteria.length ? "✓" : "○"} Min 8 characters
                    </span>
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${passwordCriteria.number ? "text-emerald-450" : "text-slate-500"}`}>
                      {passwordCriteria.number ? "✓" : "○"} 1 Number
                    </span>
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${passwordCriteria.special ? "text-emerald-450" : "text-slate-500"}`}>
                      {passwordCriteria.special ? "✓" : "○"} 1 Special character
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">WhatsApp Number Only (for verification)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="tel" 
                      placeholder="WhatsApp Mobile Number" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })} 
                      className="bg-[#0e1227] border border-indigo-500/10 focus-visible:ring-[#6366f1] text-sm h-11 w-full text-slate-100 px-4 rounded-xl"
                      maxLength={10}
                    />
                    <Button 
                      type="button" 
                      onClick={handleSendOtp}
                      disabled={formData.phone.length < 10}
                      className={`text-xs font-bold h-11 px-4 rounded-xl transition-all duration-200 ${otpSent ? "bg-slate-800 text-slate-500" : "bg-[#1e2445] text-slate-200 border border-indigo-500/10 hover:bg-[#1e2445]/80"}`}
                    >
                      {otpSent ? "Resend" : "Send WhatsApp OTP"}
                    </Button>
                  </div>
                </div>

                {otpSent && !otpVerified && (
                  <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/10 w-full animate-fadeIn">
                    <Label className="text-[10px] font-black uppercase text-indigo-400">Enter verification OTP Code (sent via WhatsApp)</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="text" 
                        placeholder="Enter '1234'" 
                        value={formData.otp} 
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })} 
                        className="bg-[#0e1227] border border-indigo-500/10 text-center font-bold text-sm h-11 rounded-xl flex-grow"
                      />
                      <Button onClick={handleVerifyOtp} className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold h-11 px-5 rounded-xl text-xs">
                        Verify
                      </Button>
                    </div>
                    {otpError && <p className="text-[10px] text-red-450 font-bold flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {otpError}</p>}
                  </div>
                )}

                {otpVerified && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-450 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Mobile number verified successfully.</span>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-2.5 w-full">
                  <Label className="text-xs font-bold text-slate-350">Store Layout configuration</Label>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div 
                      onClick={() => setFormData({ ...formData, storeType: "stationary" })}
                      className={`p-4 rounded-2xl cursor-pointer border text-center transition-all flex flex-col items-center gap-2 ${formData.storeType === "stationary" ? "bg-indigo-950/40 border-indigo-500 text-white glow-primary" : "bg-[#0e1227] border-indigo-500/10 text-slate-400 hover:bg-[#161a30]/50"}`}
                    >
                      <Building2 className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="font-bold text-xs">Stationary Shop</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Fixed physical geofence</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => setFormData({ ...formData, storeType: "mobile" })}
                      className={`p-4 rounded-2xl cursor-pointer border text-center transition-all flex flex-col items-center gap-2 ${formData.storeType === "mobile" ? "bg-indigo-950/40 border-indigo-500 text-white glow-primary" : "bg-[#0e1227] border-indigo-500/10 text-slate-400 hover:bg-[#161a30]/50"}`}
                    >
                      <Store className="w-5 h-5 text-indigo-400 animate-pulse" />
                      <div>
                        <p className="font-bold text-xs">Mobile Cart</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Live routing broadcaster</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">Store storefront name</Label>
                  <Input 
                    type="text" 
                    placeholder="Saravana Grocery Store" 
                    value={formData.storeName} 
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} 
                    className="bg-[#0e1227] border border-indigo-500/10 focus-visible:ring-[#6366f1] text-sm h-11 w-full text-slate-100 px-4 rounded-xl"
                  />
                </div>

                {/* Symmetrical fluid image and video upload section */}
                <div className="flex flex-col gap-3.5 w-full bg-[#0d121f]/50 p-4 rounded-2xl border border-indigo-500/10">
                  <div>
                    <Label className="text-xs font-bold text-slate-200">Upload Store Images (Min 5 Required)</Label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Please upload photos showing your store, items, or registration board.</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="button"
                      onClick={() => {
                        setUploadedImages([
                          "storefront_view.jpg", "product_aisle_1.jpg", 
                          "billing_counter.jpg", "stock_room.jpg", "license_board.jpg"
                        ]);
                      }}
                      className="text-xs font-bold h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Select 5 Mock Images
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setUploadedImages([])} 
                      variant="ghost" 
                      className="text-xs font-semibold text-slate-450 hover:text-slate-250 h-10 px-3"
                    >
                      Reset
                    </Button>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1.5 w-full">
                      <div className="flex flex-wrap gap-1.5">
                        {uploadedImages.map((img, idx) => (
                          <span key={idx} className="text-[10px] font-bold py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                            <Image className="w-3 h-3 text-slate-500" /> {img}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-start gap-2.5 mt-2 p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/10 text-xs">
                        <input 
                          type="checkbox" 
                          id="imageConsent" 
                          checked={imageConsent} 
                          onChange={(e) => setImageConsent(e.target.checked)} 
                          className="mt-0.5 accent-indigo-500"
                        />
                        <label htmlFor="imageConsent" className="text-slate-400 font-medium leading-relaxed select-none">
                          I consent to display these store/product images publicly to ProxiHub buyers for local discovery search.
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3.5 w-full bg-[#0d121f]/50 p-4 rounded-2xl border border-indigo-500/10">
                  <div>
                    <Label className="text-xs font-bold text-slate-200">Upload Store Video Promo (Optional)</Label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Short video showcasing store products (mp4, webm).</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button"
                      onClick={() => setUploadedVideo("promo_reel_intro.mp4")}
                      className="text-xs font-bold h-10 px-4 rounded-xl bg-slate-850 hover:bg-slate-750 text-slate-200 flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5 text-indigo-400" /> Select Mock Video
                    </Button>
                    {uploadedVideo && (
                      <span className="text-[10px] font-bold py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-450" /> {uploadedVideo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">Store Description (Visible to buyers)</Label>
                  <textarea 
                    placeholder="Describe special products, delivery options..." 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    className="bg-[#0e1227] border border-indigo-500/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#6366f1] focus:border-[#6366f1] h-24"
                    maxLength={150}
                  />
                  <p className="text-[10px] text-right font-bold text-slate-500 pr-1">{formData.description.length}/150 characters</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">GSTIN / GST Number (Optional)</Label>
                  <Input 
                    type="text" 
                    placeholder="GSTIN Code (33AAAAA1111A1Z1)" 
                    value={formData.taxId} 
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value.toUpperCase() })} 
                    className="bg-[#0e1227] border border-indigo-500/10 focus-visible:ring-[#6366f1] text-sm h-11 w-full text-slate-100 px-4 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">Aadhar KYC verification ID Number</Label>
                  <Input 
                    type="text" 
                    placeholder="12-digit Aadhar Number" 
                    value={formData.aadharNumber} 
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, "") })} 
                    className="bg-[#0e1227] border border-indigo-500/10 focus-visible:ring-[#6366f1] text-sm h-11 w-full text-slate-100 px-4 rounded-xl"
                    maxLength={12}
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-xs font-bold text-slate-350">Official Business Address</Label>
                  <Input 
                    type="text" 
                    placeholder="Shop building, street name, block..." 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                    className="bg-[#0e1227] border border-indigo-500/10 focus-visible:ring-[#6366f1] text-sm h-11 w-full text-slate-100 px-4 rounded-xl"
                  />
                  <Button 
                    type="button"
                    onClick={() => setFormData({ ...formData, address: "Saravana Building, 42 Anna Nagar Central, Chennai 600040" })}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 w-fit self-end mt-1 bg-transparent hover:bg-transparent px-1 h-auto"
                  >
                    📍 Use Current Location GPS
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-purple-955/15 border border-purple-500/15 flex items-start gap-3 mt-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-purple-300">Security Verification Check</h5>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      By submitting, you authorize ProxiHub to check coordinates matching coordinates database listings.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {step < 4 && (
            <div className="flex items-center justify-between gap-4 mt-4 w-full">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="bg-transparent border border-slate-900 text-slate-300 font-bold px-5 py-2.5 rounded-xl h-11 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                className={`flex-grow font-black uppercase tracking-wider py-2.5 rounded-xl h-11 transition-all duration-200 flex items-center justify-center gap-2 ${isStepValid() ? "bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-650 hover:opacity-90 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-500/10" : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-900"}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{step === 3 ? "Complete Registration" : "Continue"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
