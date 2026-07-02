"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CustomerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: 13.0425, lng: 80.2451 });

  // Initialize and render the authentic Google Sign-In button
  useEffect(() => {
    if (step === 1 && !isGoogleConnected && typeof window !== "undefined") {
      const initializeGoogleBtn = () => {
        if (!(window as any).google?.accounts?.id) {
          setTimeout(initializeGoogleBtn, 150);
          return;
        }

        try {
          (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "820214489167-d3770kbe7f3udv0f7nmgq2261ru170dc.apps.googleusercontent.com",
            callback: (response: any) => {
              // Decode Google JWT Credential payload
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              
              const profile = JSON.parse(jsonPayload);
              if (profile && profile.email) {
                setEmail(profile.email);
                setIsGoogleConnected(true);
              }
            }
          });

          (window as any).google.accounts.id.renderButton(
            document.getElementById("google-signin-btn"),
            { theme: "outline", size: "large", width: 340, shape: "pill" }
          );
        } catch (err) {
          console.error("Failed to initialize Google SDK:", err);
        }
      };

      const timer = setTimeout(initializeGoogleBtn, 200);
      return () => clearTimeout(timer);
    }
  }, [step, isGoogleConnected]);

  const handleRetrieveGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "en"
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            setAddress(data.display_name || `${latitude}, ${longitude}`);
          } else {
            setAddress(`Coordinates resolved: ${latitude}, ${longitude}`);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          setAddress(`Coordinates: ${latitude}, ${longitude}`);
        } finally {
          setIsGpsLoading(false);
        }
      },
      (error) => {
        setIsGpsLoading(false);
        console.error("GPS Error:", error);
        alert("GPS Location is mandatory to access ProxiHub! Please allow location permissions in your browser settings to proceed.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleComplete = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          role: "CUSTOMER",
          address: address
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to complete onboarding.");
        return;
      }
      
      localStorage.setItem("customerEmail", email || "buyer.google@gmail.com");
      localStorage.setItem("customerAddress", address || "Plot 12A, Shanti Colony Main Road, Anna Nagar, Chennai 600040");
      localStorage.setItem("customerOnboarded", "true");
      
      alert("Onboarding successful! Redirecting to login page...");
      router.push("/?role=customer&login=true");
    } catch (err) {
      console.error(err);
      alert("Error saving onboarding details.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090a16] text-slate-100 font-sans flex items-center justify-center p-4 sm:p-10 text-sm">
      {/* Dynamic Form Card */}
      <div className="w-full max-w-md bg-[#0d121f] rounded-3xl border border-slate-900 p-5 sm:p-8 shadow-2xl flex flex-col gap-6 transition-all duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🚀</span>
            <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              ProxiHub Onboarding
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/")} 
            className="text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Button>
        </div>

        {/* Stepper progress */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Step {step} of 2</span>
            <span className="text-indigo-400">{step === 1 ? "Google Verification" : "GPS Location Address"}</span>
          </div>
          <div className="w-full h-1 bg-[#161a30] rounded-full overflow-hidden flex gap-1">
            <div className={`h-full rounded-full transition-all duration-300 ${step >= 1 ? "bg-gradient-to-r from-blue-500 to-indigo-500 w-1/2" : "w-0"}`}></div>
            <div className={`h-full rounded-full transition-all duration-300 ${step >= 2 ? "bg-gradient-to-r from-indigo-500 to-purple-500 w-1/2" : "w-0"}`}></div>
          </div>
        </div>

        {/* Step Contents */}
        <div className="flex flex-col gap-5 py-2">
          {step === 1 && (
            <div className="flex flex-col gap-5 w-full">
              <div>
                <h2 className="text-xl font-black text-slate-100 tracking-tight">Connect Google Account</h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                  Verify your identity and link your Google Account to unlock geofenced discoveries.
                </p>
              </div>

              {!isGoogleConnected ? (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-slate-350 text-left">Choose Password</Label>
                    <Input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-950 border border-slate-900 focus-visible:ring-[#d4af37] text-sm h-11 w-full text-slate-100 placeholder-slate-600 rounded-xl"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2 items-center w-full mt-2">
                    <Label className="text-xs font-bold text-slate-350 self-start">Authenticate Google Account</Label>
                    <div id="google-signin-btn" className="w-full flex justify-center mt-1"></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-slate-350 text-left">Google Email ID</Label>
                    <Input
                      type="email"
                      value={email}
                      readOnly
                      className="bg-slate-950/80 border border-slate-900 text-sm h-11 w-full text-slate-400 rounded-xl cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-slate-350 text-left">Password</Label>
                    <Input
                      type="password"
                      value={password}
                      readOnly
                      className="bg-slate-950/80 border border-slate-900 text-sm h-11 w-full text-slate-400 rounded-xl cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-emerald-450 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Google Authentication Successful</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-purple-955/10 border border-purple-500/10 flex items-start gap-3 mt-1">
                <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                  We use secure OAuth links. ProxiHub does not access your search queries or personal media profiles.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5 w-full">
              <div>
                <h2 className="text-xl font-black text-slate-100 tracking-tight">Select GPS Address</h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                  We need your coordinates to show live cart updates and stores within a 5km radius.
                </p>
              </div>

              {!address ? (
                <Button
                  type="button"
                  disabled={isGpsLoading}
                  onClick={handleRetrieveGps}
                  className="w-full bg-[#1e2445] text-slate-200 border border-indigo-500/10 hover:bg-[#1e2445]/80 text-xs font-bold h-12 rounded-xl flex items-center justify-center gap-2"
                >
                  {isGpsLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-350 border-t-indigo-500 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>Retrieve GPS Coordinates & Address</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex flex-col gap-2 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-450 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Coordinates Verified</span>
                  </div>
                  <p className="text-slate-300 font-semibold pl-6">{address}</p>
                  <p className="text-[10px] text-slate-500 font-semibold pl-6 mt-0.5">GPS: {coords.lat}° N, {coords.lng}° E</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-4 mt-2">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              className="bg-transparent border border-slate-900 text-slate-300 font-bold px-5 h-11 rounded-xl flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <Button 
              onClick={() => setStep(2)}
              disabled={!isGoogleConnected}
              className={`flex-grow font-black uppercase tracking-wider h-11 rounded-xl flex items-center justify-center gap-2 ${
                isGoogleConnected 
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                  : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-905"
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={!address}
              className={`flex-grow font-black uppercase tracking-wider h-11 rounded-xl flex items-center justify-center gap-2 ${
                address 
                  ? "bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-650 text-white shadow-lg" 
                  : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-905"
              }`}
            >
              <span>Finish Onboarding</span>
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
