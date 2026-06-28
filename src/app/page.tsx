"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, Store, Wrench, Search, Volume2, Mic, MicOff, Star, ShieldAlert, BadgeCheck, 
  MapIcon, Clock, Users, MessageSquare, Play, Sparkles, Send, Bell, User, Plus, Trash2, 
  Edit2, X, Power, BarChart, Target, QrCode, Radio, Truck, CreditCard, DollarSign, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// ==========================================
// MOCK DATA - CENTRAL SYNCHRONIZED STORAGE
// ==========================================

const INITIAL_VENDORS = [
  { id: 1, name: "Saravana Grocery Store", category: "Grocery", lat: 13.042, lng: 80.245, priceRange: "₹50 - ₹500", rating: 4.8, status: "Open Now", items: ["Fresh Milk", "Ponni Rice 5kg", "Country Tomatoes", "Sunflower Oil"], distance: 0.8, type: "stationary" },
  { id: 2, name: "Ooty Veggie Cart", category: "Vegetables", lat: 13.048, lng: 80.252, priceRange: "₹20 - ₹150", rating: 4.6, status: "Moving Route", items: ["Potatoes", "Bangalore Tomatoes", "Carrots", "Ooty Onions"], distance: 1.5, type: "mobile" },
  { id: 3, name: "Priya Electrical Services", category: "Electrical", lat: 13.038, lng: 80.238, priceRange: "₹199 Base", rating: 4.9, status: "Available", items: ["Fan Repair", "Wiring", "AC Callout", "Inverter Fix"], distance: 0.6, type: "service" }
];

const INITIAL_COLLECTIVES = [
  { id: 101, storeName: "Saravana Grocery Store", title: "Ponni Rice Bulk Buy", item: "Ponni Rice 25kg Bag", price: 1250, originalPrice: 1500, discount: "16% OFF", joined: 7, target: 10, deadline: "4 hours" },
  { id: 102, storeName: "Farm-Direct Mango Pool", title: "Salem Banganapalli Pool", item: "Salem Mangoes 5kg Box", price: 450, originalPrice: 600, discount: "25% OFF", joined: 12, target: 15, deadline: "8 hours" }
];

const INITIAL_HUB_POSTS = [
  { id: 201, author: "Ramanathan K.", role: "Resident", text: "Electrician Priya fixed my inverter within 30 mins of dispatch request. Highly recommend!", timestamp: "2 hours ago", likes: 14 },
  { id: 202, author: "Meera R.", role: "Resident", text: "Are there any group pools starting for sunflower oil this weekend? Let me know.", timestamp: "5 hours ago", likes: 8 }
];

const INITIAL_GOLD_RUSHES = [
  { id: 301, storeName: "Saravana Grocery Store", title: "Gold Rush Hour!", item: "Fresh Paneer 200g", dealPrice: "₹60", regularPrice: "₹95", remaining: 450, claimsLeft: 4 },
  { id: 302, storeName: "Ooty Veggie Cart", title: "Flash Veggie Sale!", item: "Fresh Brocolli 500g", dealPrice: "₹40", regularPrice: "₹80", remaining: 920, claimsLeft: 9 }
];

const INITIAL_ADS = [
  { id: 401, advertiser: "Green Valley Organics", title: "Pure A2 Cow Milk Premium Delivery", type: "video", rewardAmount: 8.00, duration: 15, mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id: 402, advertiser: "Murugan Sweets", title: "Festive Ghee Laddu Special Discount Offer", type: "image", rewardAmount: 10.00, duration: 10, mediaUrl: "https://images.unsplash.com/photo-1589187151053-5ec8818e661b?w=600&auto=format&fit=crop&q=60" }
];

const INITIAL_JOBS = [
  { id: "job-1", client: "Vikram R.", address: "Anna Nagar, Block H", serviceNeeded: "Kitchen Faucet Leakage Fix", time: "10 mins ago", distance: "1.2 km", audioNote: true, description: "Water leaking heavily from the handle. Photo attached.", quoteStatus: "pending" },
  { id: "job-2", client: "Srinivasan K.", address: "Shanti Colony, Flat 4B", serviceNeeded: "Living Room Fan Regulator Replacement", time: "30 mins ago", distance: "2.4 km", audioNote: false, description: "Fan stays on full speed. Need regular service.", quoteStatus: "pending" }
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
};

export default function ProxiHubDashboard() {
  const router = useRouter();
  // Navigation / Role Switcher States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<"customer" | "vendor" | "service">("customer");
  const [activeTab, setActiveTab] = useState("map"); // customer sub-tabs
  const [customerMapSubTab, setCustomerMapSubTab] = useState<"map" | "list">("map");
  const [vendorActiveTab, setVendorActiveTab] = useState<"dashboard" | "ads">("dashboard");

  // Proximity Map Center & Query States
  const [userLat, setUserLat] = useState(13.040);
  const [userLng, setUserLng] = useState(80.240);
  const [searchRadius, setSearchRadius] = useState(5.0);
  const [searchQuery, setSearchQuery] = useState("");

  // Voice UI States
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [speechResponse, setSpeechResponse] = useState("");

  // Live Database States (Synced across roles!)
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [collectives, setCollectives] = useState(INITIAL_COLLECTIVES);
  const [hubPosts, setHubPosts] = useState(INITIAL_HUB_POSTS);
  const [goldRushes, setGoldRushes] = useState(INITIAL_GOLD_RUSHES);
  const [ads, setAds] = useState(INITIAL_ADS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);

  // Vendor Portal State
  const [selectedVendorId, setSelectedVendorId] = useState(1); // Default Saravana Grocery (1) or Ooty Veggie Cart (2)
  const [isCartRouteActive, setIsCartRouteActive] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<{lat: number, lng: number}[]>([]);
  
  // Custom Profile Config Inputs on Login
  const [loginShopName, setLoginShopName] = useState("");
  const [loginCategory, setLoginCategory] = useState("Grocery");
  const [loginServiceRate, setLoginServiceRate] = useState("199");

  // Goods index - separate list per vendor
  const [vendorGoodsMap, setVendorGoodsMap] = useState<Record<number, { id: number; name: string; price: string }[]>>({
    1: [
      { id: 1, name: "Fresh Cow Milk 1L", price: "₹65" },
      { id: 2, name: "Ponni Rice 5kg", price: "₹340" },
      { id: 3, name: "Country Tomatoes 1kg", price: "₹45" }
    ],
    2: [
      { id: 1, name: "Ooty Potatoes 1kg", price: "₹38" },
      { id: 2, name: "Bangalore Tomatoes 1kg", price: "₹42" }
    ]
  });

  const [newGoodName, setNewGoodName] = useState("");
  const [newGoodPrice, setNewGoodPrice] = useState("");
  
  const [newRushDealName, setNewRushDealName] = useState("");
  const [newRushDuration, setNewRushDuration] = useState("30");
  const [newRushClaims, setNewRushClaims] = useState("15");

  // Route Broadcaster and Voice Broadcast States
  const [cartRouteProgress, setCartRouteProgress] = useState(0);
  const [voiceBroadcastOption, setVoiceBroadcastOption] = useState<"record" | "upload">("record");
  const [uploadedMp3Name, setUploadedMp3Name] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Collective Pool Creator State (Store Initiates Pool)
  const [newPoolTitle, setNewPoolTitle] = useState("");
  const [newPoolItem, setNewPoolItem] = useState("");
  const [newPoolPrice, setNewPoolPrice] = useState("");
  const [newPoolOriginalPrice, setNewPoolOriginalPrice] = useState("");
  const [newPoolTarget, setNewPoolTarget] = useState("10");

  // QR scanner coupon validator
  const [qrCouponInput, setQrCouponInput] = useState("");
  const [qrScanFeedback, setQrScanFeedback] = useState("");

  // Voice Note Broadcast State (Mobile Cart)
  const [isRecordingAnnouncement, setIsRecordingAnnouncement] = useState(false);
  const [voiceAnnouncementsList, setVoiceAnnouncementsList] = useState<string[]>([
    "Fresh organic vegetables loaded near Shanti Junction!",
  ]);

  // Service Provider State
  const [providerOnline, setProviderOnline] = useState(true);
  const [providerDiagnosticRate, setProviderDiagnosticRate] = useState("199");
  const [newSkillText, setNewSkillText] = useState("");
  const [providerSkills, setProviderSkills] = useState(["Ceiling Fan Repair", "Inverter Installation", "Home Re-wiring"]);
  const [quoteInputAmount, setQuoteInputAmount] = useState("");

  // Customer Wallet state
  const [walletBalance, setWalletBalance] = useState(45.00);
  const [earningToday, setEarningToday] = useState(18.00);
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletLogs, setWalletLogs] = useState([
    { id: 1, type: "ad_reward", amount: 8.0, desc: "Watched Green Valley Ad", time: "Today, 10:15 AM" },
    { id: 2, type: "ad_reward", amount: 10.0, desc: "Watched Murugan Sweets Ad", time: "Today, 09:30 AM" },
    { id: 3, type: "withdrawal", amount: 150.0, desc: "Withdrew to UPI", time: "Yesterday, 06:12 PM", status: "Processed" }
  ]);

  // Advertiser campaign state
  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdType, setNewAdType] = useState("video");
  const [newAdBudget, setNewAdBudget] = useState("");
  const [advertiserBalance, setAdvertiserBalance] = useState(1500.00);

  // Ad player Active View States
  const [playingAd, setPlayingAd] = useState<any>(null);
  const [adWatchSeconds, setAdWatchSeconds] = useState(0);
  const [adTimerActive, setAdTimerActive] = useState(false);
  const [canClaimReward, setCanClaimReward] = useState(false);
  const [fraudRiskScore, setFraudRiskScore] = useState(12);
  const [fraudLogs, setFraudLogs] = useState<string[]>([]);
  const [adFeedback, setAdFeedback] = useState("");

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const adProgressRef = useRef<NodeJS.Timeout | null>(null);

  // Filter vendor list based on search and strict 5km fence
  const filteredVendors = vendors.filter(vendor => {
    // If the provider role is toggled offline, hide it from the map search
    if (vendor.id === 3 && !providerOnline) return false;

    const dist = Math.sqrt(
      Math.pow((vendor.lat - userLat) * 110, 2) + 
      Math.pow((vendor.lng - userLng) * 105, 2)
    );
    
    // Add dynamic property distance
    (vendor as any).distance = parseFloat(dist.toFixed(1));
    
    const matchesFence = dist <= searchRadius;
    const matchesSearch = searchQuery === "" || 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFence && matchesSearch;
  });

  // Ticking down Gold Rush timers
  useEffect(() => {
    const timer = setInterval(() => {
      setGoldRushes(prev => 
        prev.map(rush => ({
          ...rush,
          remaining: rush.remaining > 0 ? rush.remaining - 1 : 0
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Geolocation Route Animation Simulation for Mobile Cart (Ooty Veggie Cart - ID 2)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCartRouteActive) {
      interval = setInterval(() => {
        setCartRouteProgress(prevProgress => {
          const nextProgress = (prevProgress + 2) % 100;
          const angle = (nextProgress / 100) * (2 * Math.PI);
          const newLat = 13.048 + Math.sin(angle) * 0.004;
          const newLng = 80.252 + Math.cos(angle) * 0.004;
          setVendors(prev => 
            prev.map(vendor => {
              if (vendor.id === 2) {
                return { ...vendor, lat: newLat, lng: newLng };
              }
              return vendor;
            })
          );
          setRouteCoordinates(trail => {
            const updated = [...trail, {lat: newLat, lng: newLng}];
            return updated.slice(-10);
          });
          return nextProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCartRouteActive]);

  // Tab hidden ad view tracker
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && adTimerActive) {
        setAdTimerActive(false);
        setFraudRiskScore(prev => prev + 25);
        setFraudLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Tab switched while ad playing. Anti-cheat flagged risk.`]);
        setAdFeedback("Ad paused: Tab backgrounding detected.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [adTimerActive]);

  // Heartbeat tracking for anti-cheat verification
  useEffect(() => {
    if (adTimerActive && playingAd) {
      heartbeatRef.current = setInterval(() => {
        setFraudLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Visibility verification ping successful (200ms check).`]);
      }, 2000);
    } else {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    }
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [adTimerActive, playingAd]);

  // Running ad timer increments
  useEffect(() => {
    if (adTimerActive && playingAd) {
      adProgressRef.current = setInterval(() => {
        setAdWatchSeconds(prev => {
          const nextSec = prev + 1;
          if (nextSec >= playingAd.duration) {
            setCanClaimReward(true);
            setAdTimerActive(false);
            setAdFeedback("Verification completed. Reward ready to claim!");
            if (adProgressRef.current) clearInterval(adProgressRef.current);
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (adProgressRef.current) clearInterval(adProgressRef.current);
    }
    return () => {
      if (adProgressRef.current) clearInterval(adProgressRef.current);
    };
  }, [adTimerActive, playingAd]);

  // Start Speech Recognition simulation
  const runVoiceCommand = () => {
    setIsListening(true);
    setSpeechTranscript("Listening to neighborhood query...");
    setSpeechResponse("");
    
    setTimeout(() => {
      const queries = [
        { q: "find organic vegetables", resp: "Matching results: Ooty Veggie Cart is 1.5km away selling Carrots, Tomatoes. Say 'Call' to connect." },
        { q: "where is rice pool", resp: "Saravana Grocery Store has a live 'Ponni Rice Bulk Buy' collective pool with 7/10 target met." },
        { q: "need ceiling fan fix", resp: "Priya Electrical Services base diagnostic fee is ₹199. Say 'Book service' to dispatch request." }
      ];
      
      const selected = queries[Math.floor(Math.random() * queries.length)];
      setSpeechTranscript(`"${selected.q}"`);
      setSpeechResponse(selected.resp);
      setIsListening(false);
    }, 2500);
  };

  // Withdraw flow logic
  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!withdrawUpi || isNaN(amt) || amt <= 0) return;
    if (amt > walletBalance) {
      alert("Insufficient wallet balance.");
      return;
    }
    setWalletBalance(prev => prev - amt);
    setWalletLogs(prev => [
      { id: Date.now(), type: "withdrawal", amount: amt, desc: `Withdrew to ${withdrawUpi}`, time: "Just now", status: "Processed" },
      ...prev
    ]);
    setWithdrawAmount("");
    alert("Withdrawal successfully dispatched.");
  };

  // Ad reward claim flow
  const claimAdReward = () => {
    if (!playingAd) return;
    const reward = playingAd.rewardAmount;
    if (earningToday + reward > 100.00) {
      alert("Daily limit threshold reached! Payout denied.");
      return;
    }
    setWalletBalance(prev => prev + reward);
    setEarningToday(prev => prev + reward);
    setWalletLogs(prev => [
      { id: Date.now(), type: "ad_reward", amount: reward, desc: `Watched ${playingAd.advertiser} Campaign`, time: "Just now" },
      ...prev
    ]);
    setPlayingAd(null);
    setCanClaimReward(false);
    setAdWatchSeconds(0);
    setAdFeedback("");
    alert(`Reward of ₹${reward.toFixed(2)} successfully credited to wallet.`);
  };

  // Advertiser campaign launch
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(newAdBudget);
    if (!newAdTitle || isNaN(budget) || budget <= 0) return;
    if (budget > advertiserBalance) {
      alert("Insufficient advertiser balance.");
      return;
    }
    setAdvertiserBalance(prev => prev - budget);
    const newCampaign = {
      id: Date.now(),
      advertiser: loginShopName || (selectedVendorId === 1 ? "Saravana Grocery Store" : "Ooty Veggie Cart"),
      title: newAdTitle,
      type: newAdType,
      rewardAmount: parseFloat((budget * 0.05).toFixed(2)),
      duration: newAdType === "video" ? 15 : 10,
      mediaUrl: newAdType === "video" ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : "https://images.unsplash.com/photo-1589187151053-5ec8818e661b?w=600&auto=format&fit=crop&q=60"
    };
    setAds(prev => [newCampaign, ...prev]);
    setNewAdTitle("");
    setNewAdBudget("");
    alert("Hyperlocal Ads Campaign published successfully!");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#030407] flex items-center justify-center p-6 sm:p-10 text-slate-100 font-sans">
        <div className="w-full max-w-md bg-[#0d121f] rounded-3xl border border-slate-900 p-8 shadow-2xl flex flex-col gap-7 transition-all duration-200 hover:scale-[1.02] hover:border-slate-800">
          <div className="text-center flex flex-col items-center">
            <span className="text-4xl animate-bounce duration-1000">🚀</span>
            <h1 className="text-2xl font-black text-[#d4af37] tracking-tight mt-3">ProxiHub Portal Access</h1>
            <p className="text-xs text-slate-400 mt-1">Select your role and customize config settings to enter portal.</p>
          </div>

          <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-2xl border border-slate-900 gap-1">
            <Button 
              variant="ghost" 
              onClick={() => { setCurrentRole("customer"); }}
              className={`text-xs font-bold uppercase tracking-wider h-11 px-1 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${currentRole === "customer" ? "bg-[#d4af37] text-slate-950 hover:bg-[#d4af37] hover:text-slate-950" : "text-slate-200 hover:bg-slate-900"}`}
            >
              Customer
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => { setCurrentRole("vendor"); }}
              className={`text-xs font-bold uppercase tracking-wider h-11 px-1 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${currentRole === "vendor" ? "bg-[#d4af37] text-slate-950 hover:bg-[#d4af37] hover:text-slate-950" : "text-slate-200 hover:bg-slate-900"}`}
            >
              Merchant
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => { setCurrentRole("service"); }}
              className={`text-xs font-bold uppercase tracking-wider h-11 px-1 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${currentRole === "service" ? "bg-[#d4af37] text-slate-950 hover:bg-[#d4af37] hover:text-slate-950" : "text-slate-200 hover:bg-slate-900"}`}
            >
              Service
            </Button>
          </div>

          <div className="flex flex-col gap-4 items-center w-full">
            {currentRole === "vendor" && (
              <div className="flex flex-col gap-4 w-full items-center">
                <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-900 gap-1 w-full">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setSelectedVendorId(1); }}
                    className={`h-9 text-[10px] uppercase font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${selectedVendorId === 1 ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900"}`}
                  >
                    Stationary Shop
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setSelectedVendorId(2); }}
                    className={`h-9 text-[10px] uppercase font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${selectedVendorId === 2 ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900"}`}
                  >
                    Mobile Cart
                  </Button>
                </div>

                <div className="flex flex-col gap-2 w-full items-center text-center">
                  <Label className="text-xs font-bold text-slate-350">Store / Business Name</Label>
                  <Input 
                    type="text" 
                    placeholder={selectedVendorId === 1 ? "Saravana Grocery Store" : "Ooty Veggie Cart"} 
                    value={loginShopName} 
                    onChange={(e) => setLoginShopName(e.target.value)} 
                    className="bg-slate-950 border border-slate-900 focus-visible:ring-[#d4af37] text-sm h-11 w-full text-slate-100 placeholder-slate-600 rounded-xl text-center" 
                  />
                </div>
                <div className="flex flex-col gap-2 w-full items-center text-center">
                  <Label className="text-xs font-bold text-slate-350">Category type</Label>
                  <select 
                    value={loginCategory} 
                    onChange={(e) => setLoginCategory(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] h-11 text-center"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy Products</option>
                    <option value="Flowers">Flowers & Greens</option>
                  </select>
                </div>
              </div>
            )}

            {currentRole === "service" && (
              <div className="flex flex-col gap-4 w-full items-center">
                <div className="flex flex-col gap-2 w-full items-center text-center">
                  <Label className="text-xs font-bold text-slate-350">Contractor / Business Name</Label>
                  <Input 
                    type="text" 
                    placeholder="Priya Electrical Services" 
                    value={loginShopName} 
                    onChange={(e) => setLoginShopName(e.target.value)} 
                    className="bg-slate-950 border border-slate-900 focus-visible:ring-[#d4af37] text-sm h-11 w-full text-slate-100 placeholder-slate-600 rounded-xl text-center" 
                  />
                </div>
                <div className="flex flex-col gap-2 w-full items-center text-center">
                  <Label className="text-xs font-bold text-slate-350">Diagnostic Base Callout Rate (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="199" 
                    value={loginServiceRate} 
                    onChange={(e) => setLoginServiceRate(e.target.value)} 
                    className="bg-slate-950 border border-slate-900 focus-visible:ring-[#d4af37] text-sm h-11 w-full text-slate-100 placeholder-slate-600 rounded-xl text-center" 
                  />
                </div>
              </div>
            )}

            {currentRole === "customer" && (
              <p className="text-xs text-slate-400 leading-relaxed text-center py-4 w-full">
                Explore local geofenced maps, neighborhood buy pools, and play rewards campaigns locally.
              </p>
            )}

            <Button 
              onClick={() => {
                if (currentRole === "vendor") {
                  const finalName = loginShopName || (selectedVendorId === 1 ? "Saravana Grocery Store" : "Ooty Veggie Cart");
                  setVendors(prev => prev.map(v => v.id === selectedVendorId ? { ...v, name: finalName, category: loginCategory } : v));
                } else if (currentRole === "service") {
                  const finalName = loginShopName || "Priya Electrical Services";
                  setVendors(prev => prev.map(v => v.id === 3 ? { ...v, name: finalName, priceRange: `₹${loginServiceRate} Base Rate` } : v));
                  setProviderDiagnosticRate(loginServiceRate);
                }
                setIsLoggedIn(true);
              }}
              className="bg-[#d4af37] hover:bg-[#aa841c] text-slate-950 font-bold uppercase tracking-wider py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full mt-2 animate-pulse"
            >
              Enter {currentRole === "customer" ? "Customer" : currentRole === "vendor" ? (selectedVendorId === 1 ? "Stationary Store" : "Mobile Cart") : "Service Pro"} Portal
            </Button>

            {(currentRole === "vendor" || currentRole === "service") && (
              <div className="w-full text-center mt-2.5">
                <Button 
                  variant="link" 
                  onClick={() => router.push("/onboard")} 
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold p-0 h-auto"
                >
                  New merchant? Complete multi-step onboarding &rarr;
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen text-slate-100 flex flex-col lg:flex-row bg-[#030407]">
      
      {/* Sidebar Navigation */}
      <nav className="sidebar-panel glassmorphism flex flex-col px-6 py-8 justify-between border-slate-900/60 shadow-xl">
        <div className="flex flex-col gap-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🚀</span>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                ProxiHub <span className="font-light text-slate-400 text-xs">v4.0</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-550 uppercase tracking-widest font-black leading-none">Unified Dashboard</p>
          </div>

          {/* Customer Sub-tabs (Only show when customer role is active) */}
          {currentRole === "customer" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] text-slate-550 font-black uppercase tracking-wider pl-2 mb-1">Customer Tabs</p>
              
              <Button
                variant={activeTab === "map" && customerMapSubTab === "map" ? "secondary" : "ghost"}
                onClick={() => { setActiveTab("map"); setCustomerMapSubTab("map"); }}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MapIcon className="w-3.5 h-3.5 mr-2" />
                <span>5km Map Discovery</span>
              </Button>

              <Button
                variant={activeTab === "map" && customerMapSubTab === "list" ? "secondary" : "ghost"}
                onClick={() => { setActiveTab("map"); setCustomerMapSubTab("list"); }}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Store className="w-3.5 h-3.5 mr-2" />
                <span>Nearby Vendors</span>
              </Button>

              <Button
                variant={activeTab === "pools" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("pools")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Users className="w-3.5 h-3.5 mr-2" />
                <span>Collective Pools</span>
              </Button>

              <Button
                variant={activeTab === "hub" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("hub")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-2" />
                <span>Neighborhood Hub</span>
              </Button>

              <Button
                variant={activeTab === "goldrush" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("goldrush")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-3.5 h-3.5 mr-2" />
                <span>Local Gold Rush</span>
              </Button>

              <Button
                variant={activeTab === "rewards" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("rewards")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <DollarSign className="w-3.5 h-3.5 mr-2" />
                <span>ProxiRewards Ads</span>
              </Button>

              <Button
                variant={activeTab === "wallet" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("wallet")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <CreditCard className="w-3.5 h-3.5 mr-2" />
                <span>My Wallet</span>
              </Button>
            </div>
          )}

          {currentRole === "vendor" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] text-slate-550 font-black uppercase tracking-wider pl-2 mb-1">Merchant Tabs</p>
              
              <Button
                variant={vendorActiveTab === "dashboard" ? "secondary" : "ghost"}
                onClick={() => setVendorActiveTab("dashboard")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <BarChart className="w-3.5 h-3.5 mr-2" />
                <span>My Dashboard</span>
              </Button>

              <Button
                variant={vendorActiveTab === "ads" ? "secondary" : "ghost"}
                onClick={() => setVendorActiveTab("ads")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Target className="w-3.5 h-3.5 mr-2" />
                <span>Hyperlocal Ads</span>
              </Button>
            </div>
          )}

          {currentRole === "service" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] text-slate-550 font-black uppercase tracking-wider pl-2 mb-1">Service Tabs</p>
              
              <Button
                variant={vendorActiveTab === "dashboard" ? "secondary" : "ghost"}
                onClick={() => setVendorActiveTab("dashboard")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Wrench className="w-3.5 h-3.5 mr-2" />
                <span>Dispatch Console</span>
              </Button>

              <Button
                variant={vendorActiveTab === "ads" ? "secondary" : "ghost"}
                onClick={() => setVendorActiveTab("ads")}
                className="w-full justify-start text-xs font-semibold h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Target className="w-3.5 h-3.5 mr-2" />
                <span>Hyperlocal Ads</span>
              </Button>
            </div>
          )}

        </div>

        <div className="mt-8 flex flex-col gap-4">
          {/* Small Wallet Indicator */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-900/80 flex items-center justify-between shadow-2xl">
            <div>
              <p className="text-[10px] text-slate-650 uppercase tracking-widest font-black">My Balance</p>
              <p className="text-2xl font-bold text-emerald-455 mt-1">₹{walletBalance.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Limits</p>
              <p className="text-xs font-semibold text-slate-350 mt-1">₹{earningToday.toFixed(0)}/₹100</p>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => {
              setIsLoggedIn(false);
              setLoginShopName("");
            }}
            className="w-full bg-slate-950 border border-slate-900 text-[#d4af37] font-bold hover:bg-[#d4af37]/10 h-11 rounded-xl transition-all"
          >
            <Power className="w-4 h-4 mr-2" />
            <span>Logout / Switch Role</span>
          </Button>
        </div>
      </nav>

      {/* Main Viewport */}
      <main className="main-viewport">
        
        {/* Vernacular Voice Bar (Always visible) */}
        <div className="w-full glassmorphism p-5 md:p-6 rounded-3xl border-slate-900/60 flex flex-col md:flex-row gap-5 items-center justify-between shadow-2xl">
          <div className="flex items-center gap-5">
            <div 
              onClick={runVoiceCommand}
              className={`p-4 rounded-full cursor-pointer transition-all border ${
                isListening 
                  ? "bg-purple-650 text-white border-purple-550 pulsing-voice" 
                  : "bg-slate-955 text-slate-300 border-slate-900 hover:bg-slate-900"
              }`}
            >
              {isListening ? <Mic className="w-5.5 h-5.5 animate-pulse" /> : <MicOff className="w-5.5 h-5.5" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-purple-500/20">VoiceFirst UI</span>
                <p className="text-xs text-slate-500 font-semibold font-sans">Supported: Tamil, Hindi, Telugu, English</p>
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-2 leading-relaxed">
                {speechTranscript || 'Click mic & say: "Find organic vegetables" or "Where is idly shop"'}
              </p>
            </div>
          </div>
          {speechResponse && (
            <div className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/15 rounded-2xl px-6 py-4 text-xs text-purple-200 max-w-lg shadow-inner">
              <Volume2 className="w-4 h-4 flex-shrink-0 text-purple-400" />
              <p className="italic font-semibold leading-relaxed">{speechResponse}</p>
            </div>
          )}
        </div>

        {/* Dynamic Panels */}
        <div className="flex-grow flex flex-col">
          
          {/* ======================================= */}
          {/* CUSTOMER PORTAL VIEWS                   */}
          {/* ======================================= */}
          {currentRole === "customer" && (
            <div className="flex-grow flex flex-col">
              
              {/* Map View Sub-tab */}
              {activeTab === "map" && (
                <div className="flex-grow flex flex-col gap-10">
                  <div className="glassmorphism p-7 rounded-3xl border-slate-900 flex flex-wrap gap-6 items-center justify-between shadow-xl">
                    <div className="flex items-center gap-4 flex-grow max-w-xl">
                      <div className="relative flex-grow">
                        <Search className="absolute left-4 top-[12px] w-4 h-4 text-slate-500" />
                        <Input 
                          type="text" 
                          placeholder="Search groceries, electrical services, flowers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-2xl pl-11 pr-5 py-2 text-sm text-slate-101 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Geofence radius</span>
                        <span className="text-blue-400 font-black text-base mt-1">{searchRadius} km Radius</span>
                      </div>
                      <input 
                        type="range" 
                        min="1.0" 
                        max="10.0" 
                        step="0.5"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(parseFloat(e.target.value))}
                        className="w-40 accent-blue-500"
                      />
                    </div>
                  </div>

                  {/* Sub-tab Toggle buttons for small screens (hidden on lg screens) */}
                  <div className="flex lg:hidden bg-slate-950 p-1.5 rounded-2xl border border-slate-900 gap-2.5 max-w-xs mx-auto w-full">
                    <Button 
                      variant="ghost" 
                      onClick={() => setCustomerMapSubTab("map")}
                      className={`flex-1 text-xs font-bold uppercase tracking-wider h-10 px-4 rounded-xl transition-all ${customerMapSubTab === "map" ? "bg-[#d4af37] text-slate-950 hover:bg-[#d4af37] hover:text-slate-950" : "text-slate-200"}`}
                    >
                      <MapIcon className="w-3.5 h-3.5 mr-2" />
                      <span>Map View</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setCustomerMapSubTab("list")}
                      className={`flex-1 text-xs font-bold uppercase tracking-wider h-10 px-4 rounded-xl transition-all ${customerMapSubTab === "list" ? "bg-[#d4af37] text-slate-950 hover:bg-[#d4af37] hover:text-slate-950" : "text-slate-200"}`}
                    >
                      <Search className="w-3.5 h-3.5 mr-2" />
                      <span>List View</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                    {/* Live geofenced map block (visible on lg, or when active sub-tab is 'map' on mobile) */}
                    <div className={`lg:col-span-2 glassmorphism rounded-3xl border-slate-900 p-8 min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl ${customerMapSubTab === "map" ? "flex" : "hidden lg:flex"}`}>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-6 flex items-center gap-2">
                        <MapIcon className="w-4 h-4 text-blue-400" />
                        <span>Live geofenced discovery map</span>
                      </h3>
                      
                      <div className="flex-grow rounded-2xl bg-slate-950 border border-slate-900 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute rounded-full border border-slate-800/10" style={{ width: '130px', height: '130px' }}></div>
                        <div className="absolute rounded-full border border-slate-800/10" style={{ width: '260px', height: '260px' }}></div>
                        <div className="absolute rounded-full border border-blue-500/15 bg-blue-500/[0.008]" style={{ width: `${searchRadius * 72}px`, height: `${searchRadius * 72}px` }}>
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest bg-blue-950 text-blue-300 px-3.5 py-1 rounded-full border border-blue-800/25">
                            {searchRadius}km Boundary
                          </span>
                        </div>

                        {/* User Pin */}
                        <div className="absolute z-10 flex flex-col items-center">
                          <div className="w-6.5 h-6.5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center glow-primary">
                            <User className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-full shadow-2xl mt-2.5">
                            My GPS
                          </span>
                        </div>

                        {/* Animated simulated Cart route trace overlay */}
                        {isCartRouteActive && routeCoordinates.length > 1 && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-60">
                            <polyline
                              fill="none; stroke=#8b5cf6"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                              points={routeCoordinates.map(coord => {
                                const x = (coord.lng - userLng) * 3500 + 400; // rough canvas mapping offsets
                                const y = 250 - (coord.lat - userLat) * 3500;
                                return `${x},${y}`;
                              }).join(" ")}
                            />
                          </svg>
                        )}

                        {/* Dynamic Vendor Map Pins */}
                        {filteredVendors.map((v) => {
                          const xOffset = (v.lng - userLng) * 3500;
                          const yOffset = (userLat - v.lat) * 3500;
                          
                          let colorClass = "bg-blue-500";
                          let iconLabel = "🏪";
                          if (v.type === "mobile") {
                            colorClass = "bg-purple-500 animate-pulse";
                            iconLabel = "🚚";
                          }
                          if (v.type === "service") {
                            colorClass = "bg-cyan-500";
                            iconLabel = "🔧";
                          }

                          return (
                            <div 
                              key={v.id} 
                              className="absolute transition-all duration-1000 flex flex-col items-center cursor-pointer group z-20"
                              style={{ transform: `translate(${xOffset}px, ${yOffset}px)` }}
                            >
                              <div className={`w-9.5 h-9.5 rounded-full border-2 border-slate-900 flex items-center justify-center text-sm shadow-xl ${colorClass}`}>
                                {iconLabel}
                              </div>
                              
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-11 bg-slate-950 border border-slate-850 text-slate-101 text-[10px] p-3 rounded-2xl shadow-2xl w-44 pointer-events-none transition-opacity flex flex-col gap-0.5">
                                <p className="font-bold text-slate-200">{v.name}</p>
                                <p className="text-slate-400 capitalize">{v.category} • {v.distance}km</p>
                                <p className="text-slate-300 font-medium">Est. Price: {v.priceRange}</p>
                                <p className="text-emerald-455 font-bold mt-1 uppercase tracking-wider text-[8px]">{v.status}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-8 mt-5 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                        <span className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full bg-blue-500"></span> Stationary Shop</span>
                        <span className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full bg-purple-500"></span> Mobile Cart</span>
                        <span className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full bg-cyan-500"></span> Service Contractor</span>
                      </div>
                    </div>

                    {/* Listings Sidebar (visible on lg, or when active sub-tab is 'list' on mobile) */}
                    <div className={`glassmorphism rounded-3xl border-slate-900 p-7 flex flex-col h-[580px] shadow-2xl ${customerMapSubTab === "list" ? "flex" : "hidden lg:flex"}`}>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-5 pb-4 border-b border-slate-900/60 flex items-center justify-between">
                        <span>Nearby Vendors ({filteredVendors.length})</span>
                      </h3>
                      
                      <div className="flex-grow overflow-y-auto flex flex-col gap-4.5 pr-1">
                        {filteredVendors.map((vendor) => (
                          <Card key={vendor.id} className="border border-slate-900 hover:border-slate-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] cursor-pointer shadow-lg">
                            <CardHeader className="p-5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-sm font-bold text-slate-200 leading-snug">{vendor.name}</CardTitle>
                                  <p className="text-xs text-slate-550 mt-1 font-semibold">{vendor.category} • {vendor.distance} km</p>
                                </div>
                                <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">
                                  {vendor.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-4 pt-0 flex flex-col gap-3">
                              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                                <div>
                                  <p className="text-[9px] text-slate-600 uppercase tracking-widest font-black">Typical Price Range</p>
                                  <p className="font-bold text-slate-250 mt-1">{vendor.priceRange}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {vendor.items.slice(0, 3).map((item, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[9px] font-bold uppercase tracking-wider">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between text-[11px] font-semibold border-t-0 bg-transparent">
                              <span className="text-slate-500">⭐ {vendor.rating} Ratings</span>
                              <Button variant="link" className="text-blue-450 font-bold uppercase tracking-wider text-[10px] p-0 h-auto transition-all duration-200 hover:scale-[1.05]">
                                Call or Chat &rarr;
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Collective Pools Sub-tab */}
              {activeTab === "pools" && (
                <div className="flex-grow flex flex-col gap-10">
                  <div className="glassmorphism p-8 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/20 shadow-md">
                    <h2 className="text-lg font-bold text-cyan-405 flex items-center gap-2">
                      <Users className="w-5.5 h-5.5" />
                      <span>Neighborhood Collective Pools</span>
                    </h2>
                    <p className="text-xs text-slate-405 max-w-2xl leading-relaxed">
                      Join active bulk pricing pools started by local shops. No delivery pipeline - coordinate directly with the store upon fulfillment threshold clearance!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {collectives.map((c) => {
                      const percent = Math.floor((c.joined / c.target) * 100);
                      return (
                        <Card key={c.id} className="shadow-xl bg-[#0d121f] border border-slate-900 flex flex-col transition-all duration-200 hover:scale-[1.02] hover:border-slate-800">
                          <CardHeader className="p-7">
                            <div className="flex justify-between items-start mb-3">
                              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {c.discount}
                              </Badge>
                              <span className="text-xs text-slate-500 flex items-center gap-1 font-bold">
                                <Clock className="w-3.5 h-3.5 text-slate-655" /> {c.deadline} left
                              </span>
                            </div>
                            <CardTitle className="font-bold text-slate-105 text-base">{c.title}</CardTitle>
                            <CardDescription className="text-xs text-slate-450 mt-1 font-medium">Merchant: {c.storeName}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-7 pt-0 flex-grow">
                            <p className="text-xs text-slate-300 font-bold mb-4">Item: {c.item}</p>
                            <div className="my-5 bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
                              <div>
                                <p className="text-[9px] text-slate-555 uppercase font-black">Group Price</p>
                                <p className="text-xl font-black text-cyan-400 mt-1">₹{c.price}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] text-slate-555 uppercase font-black">Retail price</p>
                                <p className="text-xs text-slate-500 line-through mt-1.5">₹{c.originalPrice}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2.5 mt-2">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-400">Pool Progress</span>
                                <span className="text-cyan-400 font-black">{c.joined} / {c.target} Bags Joined</span>
                              </div>
                              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900 shadow-inner">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-7 pt-0 border-t-0 bg-transparent">
                            <Button 
                              onClick={() => {
                                setCollectives(prev => prev.map(p => p.id === c.id ? { ...p, joined: p.joined + 1 } : p));
                                alert(`Joined pool for ${c.item}!`);
                              }}
                              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] h-11"
                            >
                              Join Collective Pool
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Neighborhood Hub Sub-tab */}
              {activeTab === "hub" && (
                <div className="flex-grow flex flex-col gap-10 max-w-3xl mx-auto w-full">
                  <Card className="shadow-xl bg-[#0d121f] border border-slate-900 p-7 flex flex-col gap-6">
                    <CardHeader className="p-0 pb-4 border-b border-slate-900 flex flex-row justify-between items-center">
                      <CardTitle className="text-sm font-bold text-slate-202 flex items-center gap-2"><MessageSquare className="w-4.5 h-4.5 text-blue-400" /> Share Neighborhood Update</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const text = formData.get("postText") as string;
                        if (!text) return;
                        const newPost = {
                          id: Date.now(),
                          author: "You (Verified)",
                          role: "Resident",
                          text: text,
                          timestamp: "Just now",
                          likes: 0
                        };
                        setHubPosts(prev => [newPost, ...prev]);
                        e.currentTarget.reset();
                      }} className="flex flex-col gap-4">
                        <textarea name="postText" placeholder="Water logging at junction? Mobile cart arrived? Post updates here..." className="w-full min-h-[100px] bg-slate-950 border border-slate-900 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-550 focus:outline-none focus:border-blue-500 resize-none font-medium" />
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl self-end px-6 h-10 flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Post Update</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-6">
                    {hubPosts.map((post) => (
                      <Card key={post.id} className="shadow-xl bg-[#0d121f] border border-slate-900 p-7 flex flex-col gap-4 hover:border-slate-800 transition-all">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center text-xs">👤</div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{post.author}</p>
                              <p className="text-[9px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">{post.role}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-550 font-bold">{post.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed font-medium mt-1">{post.text}</p>
                        <div className="flex items-center gap-4 border-t border-slate-900/60 pt-3 mt-1.5 text-[10px] font-bold text-slate-500">
                          <button 
                            onClick={() => {
                              setHubPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p));
                            }} 
                            className="flex items-center gap-2.5 hover:text-blue-400 transition-colors"
                          >
                            <span>👍</span> {post.likes} Upvotes
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Gold Rush Sub-tab */}
              {activeTab === "goldrush" && (
                <div className="flex-grow flex flex-col gap-10">
                  <div className="glassmorphism p-8 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 shadow-md">
                    <h2 className="text-lg font-bold text-[#d4af37] flex items-center gap-2">
                      <Zap className="w-5.5 h-5.5 text-amber-500" />
                      <span>Local Gold Rush Deals</span>
                    </h2>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1.5">
                      Claim real-time flash discounts published by local shops nearby. Claims expire when target limit counts are hit. Run to claim!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {goldRushes.map((rush) => (
                      <Card key={rush.id} className="shadow-xl bg-[#0d121f] border border-slate-900 flex flex-col hover:border-amber-500/20 transition-all">
                        <CardHeader className="p-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-black uppercase tracking-wider border border-amber-500/20">Flash Deal</span>
                            <span className="text-xs font-mono font-bold text-red-405 flex items-center gap-1">
                              ⏱️ {formatTime(rush.remaining)}
                            </span>
                          </div>
                          <CardTitle className="font-bold text-slate-105 text-base">{rush.title}</CardTitle>
                          <CardDescription className="text-xs text-slate-455 mt-1 font-semibold">Store: {rush.storeName}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 flex-grow">
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-black">Deal Price</p>
                              <p className="text-xl font-black text-amber-400 mt-1">{rush.dealPrice}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-550 uppercase font-black">Normal</p>
                              <p className="text-xs text-slate-500 line-through mt-1.5">{rush.regularPrice}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-5 text-xs font-bold">
                            <span className="text-slate-400">Claims Available</span>
                            <span className="text-amber-400 font-black">{rush.claimsLeft} Claims Left</span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-0 border-t-0 bg-transparent">
                          <Button 
                            disabled={rush.claimsLeft === 0 || rush.remaining === 0}
                            onClick={() => {
                              setGoldRushes(prev => prev.map(r => r.id === rush.id ? { ...r, claimsLeft: r.claimsLeft - 1 } : r));
                              alert(`Flash discount claimed! Code: RUSH-${rush.id}-${Math.floor(Math.random()*900+100)}`);
                            }}
                            className="w-full bg-gradient-to-r from-amber-500 to-[#aa841c] hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider text-xs py-3.5 rounded-2xl shadow-lg transition-all h-11"
                          >
                            {rush.claimsLeft === 0 ? "Expired" : "Claim Code Instantly"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewards Sub-tab (Ads Viewer) */}
              {activeTab === "rewards" && (
                <div className="flex-grow flex flex-col gap-10 max-w-4xl mx-auto w-full">
                  <div className="glassmorphism p-8 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 shadow-md">
                    <h2 className="text-lg font-bold text-emerald-405 flex items-center gap-2">
                      <DollarSign className="w-5.5 h-5.5 text-emerald-500" />
                      <span>ProxiRewards Hyperlocal Ads Network</span>
                    </h2>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
                      Watch campaigns published by local neighborhood businesses. Our advanced anti-cheat validator verifies ad visibility to prevent simulated fraud. Credit rewards straight to your UPI wallet limit!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    <div className="flex flex-col gap-8">
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-black pl-1">Available Local Campaigns</p>
                      
                      <div className="flex flex-col gap-6">
                        {ads.map((ad) => (
                          <Card key={ad.id} className="bg-[#0d121f] border border-slate-900 shadow-xl hover:border-slate-800 transition-all">
                            <CardHeader className="p-7 pb-5">
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                                  +{ad.rewardAmount} Payout
                                </Badge>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{ad.type} AD • {ad.duration}s</span>
                              </div>
                              <CardTitle className="text-sm font-bold text-slate-200 mt-1">{ad.title}</CardTitle>
                              <CardDescription className="text-[10px] text-slate-550 font-bold mt-1 uppercase tracking-wider">Advertiser: {ad.advertiser}</CardDescription>
                            </CardHeader>
                            <CardFooter className="p-7 pt-0 border-t-0 bg-transparent">
                              <Button 
                                onClick={() => {
                                  setPlayingAd(ad);
                                  setAdWatchSeconds(0);
                                  setAdTimerActive(true);
                                  setCanClaimReward(false);
                                  setAdFeedback("Verification active: Hold focus on tab.");
                                }}
                                className="w-full bg-slate-950 border border-slate-900 text-slate-200 font-bold text-xs hover:bg-[#d4af37]/10 hover:text-[#d4af37] h-10 rounded-xl transition-all"
                              >
                                View Ad Campaign &rarr;
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-10">
                      {playingAd ? (
                        <Card className="bg-[#0d121f] shadow-2xl border border-slate-850 p-6 flex flex-col gap-5">
                          <CardHeader className="p-0 pb-3 flex flex-row justify-between items-center border-b border-slate-900">
                            <div>
                              <CardTitle className="text-sm font-bold text-slate-202">{playingAd.title}</CardTitle>
                              <p className="text-[9px] text-emerald-405 font-black tracking-widest uppercase mt-1">Visibility heartbeats tracking</p>
                            </div>
                            <Button variant="ghost" onClick={() => { setPlayingAd(null); setAdTimerActive(false); }} className="text-xs text-slate-550 hover:text-slate-300 font-bold uppercase">Cancel</Button>
                          </CardHeader>
                          <CardContent className="p-7 pt-0 flex flex-col gap-5">
                            <div className="w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-900/60 shadow-inner">
                              {playingAd.type === "video" ? (
                                <div className="w-full h-full relative flex flex-col items-center justify-center">
                                  <iframe src={`${playingAd.mediaUrl}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`} title="Ad player" className="w-full h-full absolute inset-0 pointer-events-none opacity-40" />
                                  <div className="z-10 text-center p-6">
                                    <Play className="w-12 h-12 text-emerald-400 mx-auto animate-bounce mb-3 shadow-lg" />
                                    <p className="text-sm font-black text-slate-200 tracking-widest">VIDEO AD PROGRESS ACTIVE</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full bg-cover bg-center flex items-end p-6" style={{ backgroundImage: `url(${playingAd.mediaUrl})` }}>
                                  <div className="bg-slate-955/90 p-4 rounded-xl border border-slate-900/80 w-full text-center">
                                    <p className="text-xs font-bold text-slate-305">IMAGE REWARD PROGRESS</p>
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-4 right-4 bg-slate-950/90 px-4 py-2 rounded-full text-xs font-mono font-bold text-emerald-400 border border-slate-900">
                                {adWatchSeconds}s / {playingAd.duration}s
                              </div>
                            </div>

                            {adFeedback && <div className="text-center text-xs font-bold text-amber-300 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">{adFeedback}</div>}

                            <div className="flex gap-4 items-center justify-between">
                              <Button variant="outline" onClick={() => setAdTimerActive(!adTimerActive)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-5 py-3 rounded-2xl h-11">
                                {adTimerActive ? "Pause View" : "Resume"}
                              </Button>
                              <Button disabled={!canClaimReward} onClick={claimAdReward} className={`text-xs font-bold px-6 py-3.5 rounded-2xl h-11 ${canClaimReward ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-900"}`}>
                                Claim Reward ₹{playingAd.rewardAmount}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="bg-[#0d121f] border border-slate-905 p-8 flex flex-col justify-center items-center text-center h-full min-h-[300px] border-dashed">
                          <DollarSign className="w-12 h-12 text-slate-700 animate-pulse mb-3" />
                          <p className="text-sm font-black text-slate-400 uppercase tracking-wider">No active ad session</p>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">Select any ad campaign on the left to start viewing and earning reward limits.</p>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Sub-tab */}
              {activeTab === "wallet" && (
                <div className="flex-grow flex flex-col gap-10 max-w-3xl mx-auto w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="bg-gradient-to-br from-slate-900 to-purple-950/20 shadow-xl bg-[#0d121f] border border-slate-900">
                      <CardHeader className="p-7">
                        <CardDescription className="text-xs text-slate-500 uppercase font-bold tracking-wider">Available Wallet Balance</CardDescription>
                        <CardTitle className="text-3xl font-black text-emerald-405 mt-3">₹{walletBalance.toFixed(2)}</CardTitle>
                      </CardHeader>
                    </Card>

                    <Card className="shadow-xl bg-[#0d121f] border border-slate-900">
                      <CardHeader className="p-7">
                        <CardTitle className="text-sm font-bold text-slate-200">UPI Payout Portal</CardTitle>
                      </CardHeader>
                      <CardContent className="p-7 pt-0">
                        <form onSubmit={handleWithdrawal} className="flex flex-col gap-4">
                          <Input type="text" placeholder="UPI ID (shivam@upi)" value={withdrawUpi} onChange={(e) => setWithdrawUpi(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm rounded-xl" />
                          <Input type="number" placeholder="Amount (min ₹100)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm rounded-xl" />
                          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">Process Instant Payout</Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-xl bg-[#0d121f] border border-slate-900">
                    <CardHeader className="p-7">
                      <CardTitle className="text-xs text-slate-500 font-bold uppercase tracking-wider">Earning Ledger logs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-7 pt-0 flex flex-col gap-4">
                      {walletLogs.map((log) => (
                        <div key={log.id} className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 flex items-center justify-between text-xs hover:border-slate-800 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="text-lg bg-slate-900 p-2.5 rounded-xl border border-slate-900">{log.type === "ad_reward" ? "💰" : "💳"}</span>
                            <div>
                              <p className="font-bold text-slate-200">{log.desc}</p>
                              <p className="text-[10px] text-slate-550 mt-1">{log.time}</p>
                            </div>
                          </div>
                          <span className={`font-black ${log.type === "ad_reward" ? "text-emerald-450" : "text-amber-450"}`}>{log.type === "ad_reward" ? `+ ₹${log.amount.toFixed(2)}` : `- ₹${log.amount.toFixed(2)}`}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          )}

          {/* ======================================= */}
          {/* VENDOR PORTAL VIEW                      */}
          {/* ======================================= */}
          {currentRole === "vendor" && (
            <div className="flex-grow flex flex-col gap-10 max-w-4xl mx-auto w-full">
              
              <div className="glassmorphism p-6 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 to-amber-950/15 shadow-md flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-[#d4af37] flex items-center gap-2">
                    <Store className="w-5.5 h-5.5" />
                    <span>{selectedVendorId === 1 ? "Stationary Store" : "Mobile Cart"} {vendorActiveTab === "ads" ? "Ad Campaign Panel" : "Dashboard"}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {vendorActiveTab === "ads" 
                      ? "Launch targeted ad campaigns and manage marketing campaign budgets." 
                      : "Configure storefront pricing, view metrics, and manage active listings."}
                  </p>
                </div>
              </div>

              {vendorActiveTab === "dashboard" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    <Card className="flex flex-col gap-6 bg-[#0d121f] shadow-xl border border-slate-900 p-6">
                      <CardHeader className="p-0 pb-3 border-b border-slate-900">
                        <CardTitle className="text-sm font-bold text-slate-205">Storefront Pricing Index</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 flex flex-col gap-4">
                        <div>
                          <p className="text-[10px] text-slate-550 uppercase font-black">Business Name</p>
                          <p className="text-sm font-bold text-slate-200 mt-1">
                            {selectedVendorId === 1 ? "Saravana Grocery Store" : "Ooty Veggie Cart"}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Top Demanded Goods & Pricing Estimate</p>
                          
                          <div className="flex flex-col gap-2">
                            {(vendorGoodsMap[selectedVendorId] || []).map((good) => (
                              <div key={good.id} className="p-3 bg-slate-955 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-200">{good.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-455">{good.price}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-rose-500 hover:text-rose-455 hover:bg-rose-950/30"
                                    onClick={() => {
                                      setVendorGoodsMap(prev => ({
                                        ...prev,
                                        [selectedVendorId]: (prev[selectedVendorId] || []).filter(g => g.id !== good.id)
                                      }));
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!newGoodName || !newGoodPrice) return;
                            setVendorGoodsMap(prev => ({
                              ...prev,
                              [selectedVendorId]: [...(prev[selectedVendorId] || []), { id: Date.now(), name: newGoodName, price: newGoodPrice.startsWith('₹') ? newGoodPrice : '₹' + newGoodPrice }]
                            }));
                            setNewGoodName("");
                            setNewGoodPrice("");
                          }} className="grid grid-cols-2 gap-3 mt-2 items-center">
                            <Input type="text" placeholder="Milk 1L" value={newGoodName} onChange={(e) => setNewGoodName(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm rounded-xl" />
                            <div className="flex gap-2 items-center">
                              <Input type="text" placeholder="₹ Price" value={newGoodPrice} onChange={(e) => setNewGoodPrice(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm w-20 rounded-xl" />
                              <Button type="submit" className="bg-[#d4af37] hover:bg-[#aa841c] text-slate-950 text-sm font-black px-4 py-2 flex-grow rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">+</Button>
                            </div>
                          </form>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedVendorId === 1 ? (
                      <div className="flex flex-col gap-10">
                        <Card className="bg-[#0d121f] shadow-xl border border-slate-900 p-6 flex flex-col gap-4">
                          <CardHeader className="p-0 pb-3 border-b border-slate-900">
                            <CardTitle className="text-sm font-bold text-cyan-400 flex items-center gap-2"><Users className="w-4.5 h-4.5" /> Start Group-buy Pool</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              if (!newPoolTitle || !newPoolItem || !newPoolPrice || !newPoolOriginalPrice) return;
                              
                              const newPool = {
                                id: Date.now(),
                                storeName: "Saravana Grocery Store",
                                title: newPoolTitle,
                                item: newPoolItem,
                                price: parseFloat(newPoolPrice),
                                originalPrice: parseFloat(newPoolOriginalPrice),
                                discount: `${Math.floor((1 - parseFloat(newPoolPrice)/parseFloat(newPoolOriginalPrice)) * 100)}% OFF`,
                                joined: 0,
                                target: parseInt(newPoolTarget),
                                deadline: "24 hours"
                              };

                              setCollectives(prev => [newPool, ...prev]);
                              alert(`Neighborhood group-buy pool "${newPoolTitle}" started and published!`);
                              setNewPoolTitle("");
                              setNewPoolItem("");
                              setNewPoolPrice("");
                              setNewPoolOriginalPrice("");
                            }} className="flex flex-col gap-3">
                              <Input type="text" placeholder="Pool title (Block C Sunflower Oil Pool)" value={newPoolTitle} onChange={(e) => setNewPoolTitle(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm rounded-xl" />
                              <Input type="text" placeholder="Item name (Gold Winner 5L Can)" value={newPoolItem} onChange={(e) => setNewPoolItem(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm rounded-xl" />
                              <div className="grid grid-cols-2 gap-3 items-center">
                                <Input type="number" placeholder="Discounted Price (₹)" value={newPoolPrice} onChange={(e) => setNewPoolPrice(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm rounded-xl" />
                                <Input type="number" placeholder="Retail Price (₹)" value={newPoolOriginalPrice} onChange={(e) => setNewPoolOriginalPrice(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm rounded-xl" />
                              </div>
                              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                                Launch Neighborhood Pool
                              </Button>
                            </form>
                          </CardContent>
                        </Card>

                        <Card className="bg-[#0d121f] shadow-xl border border-slate-900 p-6 flex flex-col gap-4">
                          <CardHeader className="p-0 pb-3 border-b border-slate-900">
                            <CardTitle className="text-sm font-bold text-slate-202 flex items-center gap-2"><QrCode className="w-4.5 h-4.5" /> Coupon Scanner console</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 flex flex-col gap-3">
                            <div className="flex gap-3 items-center">
                              <Input type="text" placeholder="Coupon verification code" value={qrCouponInput} onChange={(e) => setQrCouponInput(e.target.value)} className="bg-slate-955 border border-slate-900 px-4 py-2 text-sm rounded-xl" />
                              <Button onClick={() => { if(!qrCouponInput) return; setQrScanFeedback("Coupon code matched. Status updated COMPLETED."); setQrCouponInput(""); }} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 text-sm rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">Verify</Button>
                            </div>
                            {qrScanFeedback && <p className="text-xs text-emerald-450 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">{qrScanFeedback}</p>}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-10">
                        <Card className="bg-[#0d121f] shadow-xl border border-purple-500/20 p-6 flex flex-col gap-4">
                          <CardHeader className="p-0 pb-3 border-b border-slate-900">
                            <CardTitle className="text-sm font-bold text-slate-205 flex items-center gap-2"><Truck className="w-4.5 h-4.5" /> Route Broadcaster</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                              <Button 
                                onClick={() => { setIsCartRouteActive(true); }} 
                                className={`font-bold h-11 transition-all ${isCartRouteActive ? "bg-[#d4af37] text-slate-950 hover:bg-[#d4af37]" : "bg-slate-955 border border-slate-900 text-slate-300 hover:bg-slate-900"}`}
                              >
                                Start Route
                              </Button>
                              <Button 
                                onClick={() => { setIsCartRouteActive(false); }} 
                                className={`font-bold h-11 transition-all ${!isCartRouteActive ? "bg-rose-600 text-white hover:bg-rose-500" : "bg-slate-955 border border-slate-900 text-slate-300 hover:bg-slate-900"}`}
                              >
                                Pause
                              </Button>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 mt-2">
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>Manually Move Route Position</span>
                                <span className="font-bold text-[#d4af37]">{cartRouteProgress}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={cartRouteProgress} 
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setCartRouteProgress(val);
                                  // Update cart coordinates manually based on slider angle
                                  const angle = (val / 100) * (2 * Math.PI);
                                  const newLat = 13.048 + Math.sin(angle) * 0.004;
                                  const newLng = 80.252 + Math.cos(angle) * 0.004;
                                  setVendors(prev => 
                                    prev.map(vendor => vendor.id === 2 ? { ...vendor, lat: newLat, lng: newLng } : vendor)
                                  );
                                }} 
                                className="w-full accent-[#d4af37] cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-[#0d121f] shadow-xl border border-slate-900 p-6 flex flex-col gap-4">
                          <CardHeader className="p-0 pb-3 border-b border-slate-900 flex justify-between items-center">
                            <CardTitle className="text-sm font-bold text-slate-202 flex items-center gap-2">
                              <Radio className="w-4.5 h-4.5 text-pink-500" /> Voice announcement
                            </CardTitle>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setVoiceBroadcastOption("record")}
                                className={`h-7 px-3 text-[10px] uppercase font-black transition-all ${voiceBroadcastOption === "record" ? "bg-[#d4af37] text-slate-950 hover:bg-[#d4af37] hover:text-slate-950" : "text-slate-200 hover:bg-slate-900"}`}
                              >
                                Record
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setVoiceBroadcastOption("upload")}
                                className={`h-7 px-3 text-[10px] uppercase font-black transition-all ${voiceBroadcastOption === "upload" ? "bg-[#d4af37] text-slate-950 hover:bg-[#d4af37] hover:text-slate-950" : "text-slate-200 hover:bg-slate-900"}`}
                              >
                                Upload MP3 file
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            {voiceBroadcastOption === "record" ? (
                              <div className="flex flex-col gap-3">
                                <Button 
                                  onClick={() => {
                                    if (isRecordingAnnouncement) {
                                      setIsRecordingAnnouncement(false);
                                      const textPrompt = prompt("Speech message:") || "Cart arrived near RWA Block C!";
                                      setSpeechTranscript(`[ANNOUNCEMENT]: ${textPrompt}`);
                                    } else {
                                      setIsRecordingAnnouncement(true);
                                    }
                                  }}
                                  className={`w-full font-bold text-xs h-11 ${isRecordingAnnouncement ? "bg-red-650 text-white animate-pulse" : "bg-pink-650 hover:bg-pink-550 text-white"}`}
                                >
                                  {isRecordingAnnouncement ? "Recording..." : "Record Broadcast Announcement"}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3 p-3 bg-slate-950 rounded-xl border border-slate-900">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Select Voice Note MP3</p>
                                <div className="flex items-center gap-3">
                                  <Input 
                                    type="file" 
                                    accept="audio/mp3,audio/*" 
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        setUploadedMp3Name(file.name);
                                        setUploadProgress(0);
                                        let progress = 0;
                                        const int = setInterval(() => {
                                          progress += 20;
                                          setUploadProgress(progress);
                                          if (progress >= 100) {
                                            clearInterval(int);
                                            setSpeechTranscript(`[MP3 Broadcast]: Running announcement from file ${file.name}`);
                                          }
                                        }, 200);
                                      }
                                    }} 
                                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 h-9"
                                  />
                                </div>
                                {uploadedMp3Name && (
                                  <div className="flex flex-col gap-1 mt-1">
                                    <div className="flex justify-between text-[10px] text-slate-400">
                                      <span>{uploadedMp3Name}</span>
                                      <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                      <div className="bg-[#d4af37] h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </>
              )}

              {vendorActiveTab === "ads" && (
                <div className="flex flex-col gap-10 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="shadow-xl bg-[#0d121f] border border-slate-900">
                      <CardHeader className="p-5">
                        <CardDescription className="text-[10px] text-slate-550 uppercase tracking-widest font-black">Advertiser Balance</CardDescription>
                        <CardTitle className="text-2xl font-black text-[#d4af37] mt-1">₹{advertiserBalance.toFixed(2)}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0">
                        <Button variant="outline" onClick={() => setAdvertiserBalance(b => b + 1000)} className="w-full bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold border border-[#d4af37]/20 h-10">+ Top Up Budget</Button>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col gap-5 shadow-xl bg-[#0d121f] border border-slate-900">
                      <CardHeader className="p-6">
                        <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2"><Target className="w-4.5 h-4.5 text-[#d4af37]" /> Launch Local Ad Campaign</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <form onSubmit={handleCreateCampaign} className="flex flex-col gap-4">
                          <Input type="text" placeholder="Campaign name" value={newAdTitle} onChange={(e) => setNewAdTitle(e.target.value)} className="bg-slate-955 border border-slate-900 h-11 focus-visible:ring-[#d4af37]" />
                          <div className="grid grid-cols-2 gap-4">
                            <select value={newAdType} onChange={(e) => setNewAdType(e.target.value)} className="w-full bg-slate-955 border border-slate-900 rounded-xl px-3 py-2.5 text-xs text-slate-250 focus:outline-none">
                              <option value="video">YouTube Video</option>
                              <option value="image">Static Image</option>
                            </select>
                            <Input type="number" placeholder="Budget ₹" value={newAdBudget} onChange={(e) => setNewAdBudget(e.target.value)} className="bg-slate-955 border border-slate-900 h-11 focus-visible:ring-[#d4af37]" />
                          </div>
                          <Button type="submit" className="w-full bg-[#d4af37] hover:bg-[#aa841c] text-slate-950 font-bold text-xs py-3.5 rounded-2xl shadow-md h-11">Publish Campaign</Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================= */}
          {/* SERVICE PROVIDER PORTAL VIEW            */}
          {/* ======================================= */}
          {currentRole === "service" && (
            <div className="flex-grow flex flex-col gap-10 max-w-4xl mx-auto w-full">
              
              <div className="glassmorphism p-6 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 to-cyan-950/15 shadow-md flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-cyan-405 flex items-center gap-2">
                    <Wrench className="w-5.5 h-5.5" />
                    <span>Service Contractor Portal</span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant={providerOnline ? "default" : "outline"}
                    onClick={() => {
                      setProviderOnline(!providerOnline);
                      setVendors(prev => prev.map(vendor => {
                        if (vendor.id === 3) {
                          return { ...vendor, status: !providerOnline ? "Available" : "Offline" };
                        }
                        return vendor;
                      }));
                    }}
                    className={`px-5 py-2.5 text-xs font-black uppercase tracking-wide h-10 border ${
                      providerOnline ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-450 hover:bg-emerald-500/20" : ""
                    }`}
                  >
                    <Power className="w-3.5 h-3.5 mr-2" />
                    <span>{providerOnline ? "Online" : "Offline"}</span>
                  </Button>
                </div>
              </div>

              {vendorActiveTab === "dashboard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  
                  <Card className="flex flex-col gap-6 bg-[#0d121f] shadow-xl border border-slate-900 p-6">
                    <CardHeader className="p-0 pb-3 border-b border-slate-900 flex flex-row justify-between items-center">
                      <CardTitle className="text-sm font-bold text-slate-202">Service details</CardTitle>
                      <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Verified</Badge>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col gap-4">
                      <div>
                        <Label className="text-[9px] text-slate-550 block font-black uppercase tracking-widest mb-1.5">Diagnostic Callout Fee (₹)</Label>
                        <div className="flex gap-3">
                          <Input type="number" value={providerDiagnosticRate} onChange={(e) => { setProviderDiagnosticRate(e.target.value); setVendors(prev => prev.map(v => v.id === 3 ? { ...v, priceRange: `₹${e.target.value} Base Rate` } : v)); }} className="bg-slate-955 border border-slate-900 h-10 w-24 text-xs font-bold text-[#d4af37]" />
                          <span className="text-xs text-slate-400 self-center">Base rate for dispatch diagnostic visit.</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-4">
                        <Label className="text-[9px] text-slate-550 block font-black uppercase tracking-widest mb-1">Provider Skills Tags</Label>
                        <div className="flex flex-wrap gap-2">
                          {providerSkills.map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] font-bold py-1 px-3 border-slate-800 bg-slate-950 flex items-center gap-1.5">
                              <span>{skill}</span>
                              <X className="w-3 h-3 text-slate-500 hover:text-rose-400 cursor-pointer" onClick={() => setProviderSkills(prev => prev.filter((_, i) => i !== idx))} />
                            </Badge>
                          ))}
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); if(!newSkillText) return; setProviderSkills(prev => [...prev, newSkillText]); setNewSkillText(""); }} className="flex gap-3 mt-1.5">
                          <Input type="text" placeholder="Add skill tag (AC Installation)" value={newSkillText} onChange={(e) => setNewSkillText(e.target.value)} className="bg-slate-955 border border-slate-900 h-10 text-xs flex-grow" />
                          <Button type="submit" className="bg-[#d4af37] text-slate-950 font-bold h-10 text-xs px-4">Add</Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-10">
                    <Card className="flex flex-col gap-5 shadow-xl bg-[#0d121f] border border-slate-900">
                      <CardHeader className="p-6 pb-4 border-b border-slate-900">
                        <CardTitle className="text-sm font-bold text-slate-202 flex items-center gap-2"><MapPin className="w-4.5 h-4.5 text-cyan-400" /> Active Job Request Dispatch Pipeline</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-4 flex flex-col gap-5 max-h-[400px] overflow-y-auto">
                        {jobs.map((job) => (
                          <div key={job.id} className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-col gap-3 hover:border-slate-800 transition-all text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200">{job.client}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{job.time} • {job.distance}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold">Requested: <span className="text-slate-200">{job.serviceNeeded}</span></p>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{job.description}</p>
                            
                            {job.quoteStatus === "pending" ? (
                              <div className="flex gap-3 mt-2">
                                <Input type="number" placeholder="Enter Quote ₹" value={quoteInputAmount} onChange={(e) => setQuoteInputAmount(e.target.value)} className="bg-slate-955 border border-slate-900 h-10 text-xs w-28" />
                                <Button 
                                  onClick={() => {
                                    if(!quoteInputAmount) return;
                                    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, quoteStatus: "sent", description: `Quote sent: ₹${quoteInputAmount}` } : j));
                                    setQuoteInputAmount("");
                                    alert("Price quote successfully dispatched to user!");
                                  }}
                                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-10 text-xs px-4 flex-grow"
                                >
                                  Submit Quote
                                </Button>
                              </div>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase tracking-wider py-1.5 self-start px-3.5">
                                Quote Sent (Pending client acceptance)
                              </Badge>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {vendorActiveTab === "ads" && (
                <div className="flex flex-col gap-10 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="shadow-xl bg-[#0d121f] border border-slate-900">
                      <CardHeader className="p-5">
                        <CardDescription className="text-[10px] text-slate-550 uppercase tracking-widest font-black">Advertiser Balance</CardDescription>
                        <CardTitle className="text-2xl font-black text-[#d4af37] mt-1">₹{advertiserBalance.toFixed(2)}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-0">
                        <Button variant="outline" onClick={() => setAdvertiserBalance(b => b + 1000)} className="w-full bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold border border-[#d4af37]/20 h-10">+ Top Up Budget</Button>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col gap-5 shadow-xl bg-[#0d121f] border border-slate-900">
                      <CardHeader className="p-6">
                        <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2"><Target className="w-4.5 h-4.5 text-[#d4af37]" /> Launch Local Ad Campaign</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <form onSubmit={handleCreateCampaign} className="flex flex-col gap-4">
                          <Input type="text" placeholder="Campaign name" value={newAdTitle} onChange={(e) => setNewAdTitle(e.target.value)} className="bg-slate-955 border border-slate-900 h-11 focus-visible:ring-[#d4af37]" />
                          <div className="grid grid-cols-2 gap-4">
                            <select value={newAdType} onChange={(e) => setNewAdType(e.target.value)} className="w-full bg-slate-955 border border-slate-900 rounded-xl px-3 py-2.5 text-xs text-slate-250 focus:outline-none">
                              <option value="video">YouTube Video</option>
                              <option value="image">Static Image</option>
                            </select>
                            <Input type="number" placeholder="Budget ₹" value={newAdBudget} onChange={(e) => setNewAdBudget(e.target.value)} className="bg-slate-955 border border-slate-900 h-11 focus-visible:ring-[#d4af37]" />
                          </div>
                          <Button type="submit" className="w-full bg-[#d4af37] hover:bg-[#aa841c] text-slate-950 font-bold text-xs py-3.5 rounded-2xl shadow-md h-11">Publish Campaign</Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
