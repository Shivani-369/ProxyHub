"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Mic,
  MicOff,
  Volume2,
  Users,
  MessageSquare,
  Zap,
  DollarSign,
  Lock,
  Plus,
  Play,
  Pause,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Send,
  Map as MapIcon,
  Search,
  User,
  FileText,
  CreditCard,
  Target,
  Briefcase,
  Store,
  Truck,
  Check,
  Power,
  Wrench,
  Sparkles,
  QrCode,
  Radio,
  BarChart,
  Percent,
  CheckSquare,
  ShieldCheck
} from "lucide-react";

// Mock Database initial states
const INITIAL_VENDORS = [
  { id: 1, name: "Saravana Grocery Store", type: "stationary", category: "Grocery", lat: 13.041, lng: 80.245, distance: 0.8, status: "Open", rating: 4.6, items: ["Rice", "Sugar", "Carrots", "Onions"], priceRange: "₹50 - ₹200" },
  { id: 2, name: "Ooty Veggie Cart", type: "mobile", category: "Vegetables", lat: 13.048, lng: 80.252, distance: 1.4, status: "On Route", rating: 4.8, items: ["Tomatoes", "Potatoes", "Fresh Beans"], priceRange: "₹30 - ₹120" },
  { id: 3, name: "Priya Electrical Services", type: "service", category: "Electrician", lat: 13.035, lng: 80.239, distance: 2.1, status: "Available", rating: 4.5, items: ["Wiring", "Fan Repair", "AC Checkup"], priceRange: "₹199 Base Rate" },
  { id: 4, name: "Amma's Tiffin Center", type: "stationary", category: "Food", lat: 13.044, lng: 80.248, distance: 1.1, status: "Open", rating: 4.7, items: ["Idly", "Dosa", "Vada", "Sambar"], priceRange: "₹10 - ₹60" },
  { id: 5, name: "Velan Flower Stall", type: "mobile", category: "Flowers", lat: 13.053, lng: 80.258, distance: 3.2, status: "On Route", rating: 4.2, items: ["Jasmine", "Rose garlands"], priceRange: "₹20 - ₹150" },
  { id: 6, name: "Express Plumbers", type: "service", category: "Plumbing", lat: 13.061, lng: 80.265, distance: 5.4, status: "Available", rating: 4.4, items: ["Leak Fix", "Pipe Install"], priceRange: "₹150 Base Rate" }
];

const INITIAL_COLLECTIVES = [
  { id: 101, storeName: "Saravana Grocery Store", title: "Block B Ponni Rice Pool", item: "Royal Ponni Rice 10kg", price: 340, originalPrice: 425, discount: "20% OFF", joined: 8, target: 10, deadline: "2h 45m" },
  { id: 102, storeName: "Amma's Tiffin Center", title: "Sunday Catering Combo Club", item: "Tiffin Combo for 5 People", price: 220, originalPrice: 280, discount: "21% OFF", joined: 3, target: 5, deadline: "5h 12m" }
];

const INITIAL_HUB_POSTS = [
  { id: 201, author: "Anna Nagar RWA Secretary", role: "RWA Verified", text: "🔧 Maintenance Announcement: Power shut down in Blocks C and D tomorrow between 10:00 AM and 1:00 PM for transformer servicing.", likes: 24, replies: 6, time: "2 hours ago", category: "Announcement" },
  { id: 202, author: "Saravana Grocery Store", role: "Verified Vendor", text: "🌽 Fresh batch of organic sweetcorn direct from Salem farmers has just arrived at the shop! Special RWA member discount of 10% today. Ask for details in Chat.", likes: 15, replies: 2, time: "4 hours ago", category: "Vendor Promo" },
  { id: 203, author: "Dr. Kavitha Ram", role: "Resident", text: "⚠️ Safety Warning: Waterlogging reported near the main junction lane after last night's rainfall. Be cautious while taking two-wheelers.", likes: 42, replies: 11, time: "6 hours ago", category: "Alert" }
];

const INITIAL_GOLD_RUSHES = [
  { id: 301, vendorName: "Amma's Tiffin Center", deal: "Hot Samosas at ₹5 apiece! (Usually ₹15)", activeFor: 1800, remaining: 1120, totalClaims: 30, claimed: 18, radius: 2.5 },
  { id: 302, vendorName: "Priya Electrical Services", deal: "Free Home AC checkup with any service booking", activeFor: 3600, remaining: 2450, totalClaims: 10, claimed: 4, radius: 4.0 }
];

const INITIAL_ADS = [
  { id: "ad-1", title: "Green Valley Organic Farm Products", type: "video", advertiser: "Green Valley Ltd", rewardAmount: 8, duration: 20, mediaUrl: "https://www.youtube.com/embed/ScMzIvxBSi4" },
  { id: "ad-2", title: "Apex AC Services Chennai", type: "image", advertiser: "Apex Appliances", rewardAmount: 5, duration: 10, mediaUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60" },
  { id: "ad-3", title: "Murugan Sweets & Snacks", type: "video", advertiser: "Murugan Caterers", rewardAmount: 10, duration: 30, mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
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
  // Navigation / Role Switcher States
  const [currentRole, setCurrentRole] = useState<"customer" | "vendor" | "service">("customer");
  const [activeTab, setActiveTab] = useState("map"); // customer sub-tabs

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
  const [selectedVendorId, setSelectedVendorId] = useState(1); // Default Saravana Grocery
  const [isCartRouteActive, setIsCartRouteActive] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<{lat: number, lng: number}[]>([]);
  const [vendorDemandGoods, setVendorDemandGoods] = useState([
    { id: 1, name: "Fresh Cow Milk 1L", price: "₹65" },
    { id: 2, name: "Ponni Rice 5kg", price: "₹340" },
    { id: 3, name: "Country Tomatoes 1kg", price: "₹45" }
  ]);
  const [newGoodName, setNewGoodName] = useState("");
  const [newGoodPrice, setNewGoodPrice] = useState("");
  const [newRushDealName, setNewRushDealName] = useState("");
  const [newRushDuration, setNewRushDuration] = useState("30");
  const [newRushClaims, setNewRushClaims] = useState("15");

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
  const [earningLimit] = useState(100.00);
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
  const [newAdReward, setNewAdReward] = useState("5");
  const [newAdDuration, setNewAdDuration] = useState("15");
  const [newAdUrl, setNewAdUrl] = useState("");
  const [newAdRadius, setNewAdRadius] = useState("5.0");
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
    
    vendor.distance = parseFloat(dist.toFixed(1));
    
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
      let angle = 0;
      interval = setInterval(() => {
        angle += 0.15;
        // Crawl cart coordinates in a small circle around Anna Nagar center
        setVendors(prev => 
          prev.map(vendor => {
            if (vendor.id === 2) {
              const newLat = 13.048 + Math.sin(angle) * 0.004;
              const newLng = 80.252 + Math.cos(angle) * 0.004;
              
              // Record route coordinate trail
              setRouteCoordinates(trail => [...trail.slice(-10), {lat: newLat, lng: newLng}]);
              return { ...vendor, lat: newLat, lng: newLng };
            }
            return vendor;
          })
        );
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isCartRouteActive]);

  // Tab hidden ad view tracker
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && adTimerActive) {
        setAdTimerActive(false);
        const logMsg = `[FRAUD SYSTEM] Tab hidden detected! Playback paused. Fraud risk +15.`;
        setFraudLogs(prev => [logMsg, ...prev]);
        setFraudRiskScore(r => Math.min(100, r + 15));
        setAdFeedback("Paused: Keep the page active in foreground to earn rewards.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [adTimerActive]);

  // Handle ticking watched seconds
  useEffect(() => {
    if (adTimerActive && playingAd) {
      adProgressRef.current = setInterval(() => {
        setAdWatchSeconds(sec => {
          const nextSec = sec + 1;
          if (nextSec >= playingAd.duration) {
            setAdTimerActive(false);
            setCanClaimReward(true);
            if (adProgressRef.current) clearInterval(adProgressRef.current);
            return playingAd.duration;
          }
          return nextSec;
        });
      }, 1000);

      heartbeatRef.current = setInterval(() => {
        const rand = Math.random();
        let logMsg = "";
        if (rand > 0.9) {
          logMsg = `[FRAUD SYSTEM] Abnormal cursor movement. Fraud risk +5.`;
          setFraudRiskScore(r => Math.min(100, r + 5));
        } else {
          logMsg = `[HEARTBEAT] Verification packet sent: GPS matches radius, active tab true.`;
        }
        setFraudLogs(prev => [logMsg, ...prev]);
      }, 5000);
    } else {
      if (adProgressRef.current) clearInterval(adProgressRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    }

    return () => {
      if (adProgressRef.current) clearInterval(adProgressRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [adTimerActive, playingAd]);

  // Voice Command processor
  const runVoiceCommand = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = "en-IN";
      rec.start();
      setIsListening(true);
      setSpeechTranscript("Listening to microphone...");
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechTranscript(transcript);
        processVoiceText(transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
        setSpeechTranscript("Could not capture speech. Try typing or simulation below.");
      };
    } else {
      setIsListening(true);
      setSpeechTranscript("Simulating microphone capture...");
      setTimeout(() => {
        const prompts = [
          "Find fruit vendor nearby",
          "Where is idly shop",
          "Claim AC service gold rush",
          "Show available ad rewards"
        ];
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        setSpeechTranscript(randomPrompt);
        processVoiceText(randomPrompt);
        setIsListening(false);
      }, 2500);
    }
  };

  const processVoiceText = (text: string) => {
    const speech = text.toLowerCase();
    let responseText = "";
    
    if (speech.includes("fruit") || speech.includes("vegetable") || speech.includes("pazham")) {
      setActiveTab("map");
      setSearchQuery("Veggie");
      responseText = "Showing nearby organic vegetable and fruit stalls within 5 kilometers.";
    } else if (speech.includes("idly") || speech.includes("sambar") || speech.includes("food")) {
      setActiveTab("map");
      setSearchQuery("Food");
      responseText = "Located Amma's Tiffin Center at 1.1 kilometers. They are currently Open.";
    } else if (speech.includes("gold") || speech.includes("rush") || speech.includes("deal")) {
      setActiveTab("goldrush");
      responseText = "Displaying active time-sensitive deals. Amma's Tiffin has a deal ending soon.";
    } else if (speech.includes("rewards") || speech.includes("ad") || speech.includes("earn")) {
      setActiveTab("rewards");
      responseText = "Displaying available video and image reward ads. You can earn up to ₹23 now.";
    } else {
      responseText = `Heard: "${text}". Searching catalog for matching hyperlocal vendors.`;
    }

    setSpeechResponse(responseText);
    
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(responseText);
      window.speechSynthesis.speak(utterance);
    }
  };

  const claimAdReward = () => {
    if (fraudRiskScore >= 70) {
      alert("Reward Denied: Fraud verification failed.");
      return;
    }
    
    if (earningToday + playingAd.rewardAmount > earningLimit) {
      alert("Daily Earning limit of ₹100 reached!");
      return;
    }

    setWalletBalance(prev => prev + playingAd.rewardAmount);
    setEarningToday(prev => prev + playingAd.rewardAmount);
    setWalletLogs(prev => [
      {
        id: Date.now(),
        type: "ad_reward",
        amount: playingAd.rewardAmount,
        desc: `Earned: Watched ${playingAd.title}`,
        time: "Just now"
      },
      ...prev
    ]);

    setAdFeedback(`Success! ₹${playingAd.rewardAmount} credited directly to your wallet.`);
    setPlayingAd(null);
    setAdWatchSeconds(0);
    setCanClaimReward(false);
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (!withdrawUpi || isNaN(amountNum) || amountNum < 100 || amountNum > walletBalance) {
      alert("Please check minimum amount ₹100, UPI ID, or available balance.");
      return;
    }

    setWalletBalance(prev => prev - amountNum);
    setWalletLogs(prev => [
      {
        id: Date.now(),
        type: "withdrawal",
        amount: amountNum,
        desc: `Withdrawal request to ${withdrawUpi}`,
        time: "Just now",
        status: "Processing"
      },
      ...prev
    ]);
    alert(`Withdrawal request of ₹${amountNum} successfully queued!`);
    setWithdrawAmount("");
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(newAdBudget);
    const rewardNum = parseFloat(newAdReward);
    const durationNum = parseInt(newAdDuration);
    
    if (!newAdTitle || isNaN(budgetNum) || budgetNum < 500 || budgetNum > advertiserBalance) {
      alert("Please ensure minimum ad budget ₹500 and available advertiser balance.");
      return;
    }

    const createdAd = {
      id: `ad-${Date.now()}`,
      title: newAdTitle,
      type: newAdType,
      advertiser: "My Custom Business",
      rewardAmount: rewardNum,
      duration: durationNum,
      mediaUrl: newAdUrl || (newAdType === "video" ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800")
    };

    setAds(prev => [...prev, createdAd]);
    setAdvertiserBalance(prev => prev - budgetNum);
    alert(`Campaign "${newAdTitle}" successfully launched and live inside the 5km radius!`);
    
    setNewAdTitle("");
    setNewAdUrl("");
    setNewAdBudget("");
  };

  return (
    <div className="app-container min-h-screen text-slate-100 flex flex-col lg:flex-row bg-[#05070c]">
      
      {/* Sidebar Navigation */}
      <nav className="sidebar-panel glassmorphism flex flex-col p-8 justify-between border-slate-900/60 shadow-xl">
        <div className="flex flex-col gap-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🚀</span>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                ProxiHub <span className="font-light text-slate-400 text-xs">v4.0</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none">Unified Dashboard</p>
          </div>

          {/* Interactive Role Selector */}
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-900 flex flex-col gap-2.5 shadow-inner">
            <p className="text-[9px] text-slate-550 font-black uppercase tracking-wider pl-2">SELECT PORTAL VIEW</p>
            
            <button
              onClick={() => { setCurrentRole("customer"); setActiveTab("map"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentRole === "customer" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer Discovery</span>
            </button>

            <button
              onClick={() => { setCurrentRole("vendor"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentRole === "vendor" 
                  ? "bg-amber-500 text-slate-950 shadow" 
                  : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Merchant Portal</span>
            </button>

            <button
              onClick={() => { setCurrentRole("service"); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentRole === "service" 
                  ? "bg-cyan-650 text-white shadow" 
                  : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Service Portal</span>
            </button>
          </div>

          <div className="border-t border-slate-900/80 my-2"></div>

          {/* Customer Sub-tabs (Only show when customer role is active) */}
          {currentRole === "customer" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] text-slate-550 font-black uppercase tracking-wider pl-2 mb-1">Customer Tabs</p>
              
              <button
                onClick={() => setActiveTab("map")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "map" ? "bg-slate-800 text-white" : "text-slate-450 hover:text-slate-200"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>5km Map Discovery</span>
              </button>

              <button
                onClick={() => setActiveTab("pools")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "pools" ? "bg-slate-800 text-white" : "text-slate-450 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Collective Pools</span>
              </button>

              <button
                onClick={() => setActiveTab("hub")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "hub" ? "bg-slate-800 text-white" : "text-slate-450 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Neighborhood Hub</span>
              </button>

              <button
                onClick={() => setActiveTab("goldrush")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "goldrush" ? "bg-slate-800 text-white" : "text-slate-455 hover:text-slate-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Local Gold Rush</span>
              </button>

              <button
                onClick={() => setActiveTab("rewards")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "rewards" ? "bg-slate-800 text-white" : "text-slate-450 hover:text-slate-200"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>ProxiRewards Ads</span>
              </button>

              <button
                onClick={() => setActiveTab("wallet")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "wallet" ? "bg-slate-800 text-white" : "text-slate-450 hover:text-slate-200"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>My Wallet</span>
              </button>
            </div>
          )}

        </div>

        {/* Small Wallet Indicator */}
        <div className="mt-8 p-5 rounded-2xl bg-slate-950 border border-slate-900/80 flex items-center justify-between shadow-2xl">
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">My Balance</p>
            <p className="text-2xl font-bold text-emerald-455 mt-1">₹{walletBalance.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Limits</p>
            <p className="text-xs font-semibold text-slate-350 mt-1">₹{earningToday.toFixed(0)}/₹100</p>
          </div>
        </div>
      </nav>

      {/* Main Viewport */}
      <main className="main-viewport flex flex-col gap-12">
        
        {/* Vernacular Voice Bar (Always visible) */}
        <div className="w-full glassmorphism p-6 rounded-3xl border-slate-900/60 flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl">
          <div className="flex items-center gap-5">
            <div 
              onClick={runVoiceCommand}
              className={`p-4 rounded-full cursor-pointer transition-all border ${
                isListening 
                  ? "bg-purple-650 text-white border-purple-550 pulsing-voice" 
                  : "bg-slate-950 text-slate-300 border-slate-900 hover:bg-slate-900"
              }`}
            >
              {isListening ? <Mic className="w-5.5 h-5.5 animate-pulse" /> : <MicOff className="w-5.5 h-5.5" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-purple-500/20">VoiceFirst UI</span>
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
                  <div className="glassmorphism p-6 rounded-3xl border-slate-900 flex flex-wrap gap-6 items-center justify-between shadow-xl">
                    <div className="flex items-center gap-4 flex-grow max-w-xl">
                      <div className="relative flex-grow">
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search groceries, electrical services, flowers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-2xl pl-11 pr-5 py-3 text-sm text-slate-101 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
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

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-grow">
                    <div className="lg:col-span-2 glassmorphism rounded-3xl border-slate-900 p-6 min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-4 flex items-center gap-2">
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

                        {/* Animated simulated Cart route coordinate line trace overlay */}
                        {isCartRouteActive && routeCoordinates.length > 1 && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-60">
                            <polyline
                              fill="none"
                              stroke="#8b5cf6"
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
                              
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-11 bg-slate-950 border border-slate-850 text-slate-100 text-[10px] p-3 rounded-2xl shadow-2xl w-44 pointer-events-none transition-opacity flex flex-col gap-0.5">
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

                    {/* Listings Sidebar */}
                    <div className="glassmorphism rounded-3xl border-slate-900 p-6 flex flex-col h-[560px] shadow-2xl">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-4 pb-3 border-b border-slate-900/60 flex items-center justify-between">
                        <span>Nearby Vendors ({filteredVendors.length})</span>
                      </h3>
                      
                      <div className="flex-grow overflow-y-auto flex flex-col gap-4.5 pr-1">
                        {filteredVendors.map((vendor) => (
                          <div 
                            key={vendor.id}
                            className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col gap-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-bold text-slate-200 leading-snug">{vendor.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 font-semibold">{vendor.category} • {vendor.distance} km</p>
                              </div>
                              <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                                vendor.status === "Open" || vendor.status === "Available" 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                                  : "bg-purple-500/10 text-purple-400 border border-purple-500/15"
                              }`}>
                                {vendor.status}
                              </span>
                            </div>

                            {/* Show Top Demand items and Price range */}
                            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                              <div>
                                <p className="text-[9px] text-slate-550 uppercase tracking-widest font-black">Typical Price Range</p>
                                <p className="font-bold text-slate-200 mt-1">{vendor.priceRange}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {vendor.items.slice(0, 3).map((item, idx) => (
                                <span key={idx} className="text-[9px] bg-slate-950 text-slate-455 px-2.5 py-1 rounded-lg border border-slate-900/60 font-bold uppercase tracking-wider">
                                  {item}
                                </span>
                              ))}
                            </div>
                            
                            <div className="mt-1 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px] font-semibold">
                              <span className="text-slate-500">⭐ {vendor.rating} Ratings</span>
                              <button className="text-blue-450 font-bold hover:underline uppercase tracking-wider text-[10px]">Call or Chat &rarr;</button>
                            </div>
                          </div>
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
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                      Join active bulk pricing pools started by local shops. No delivery pipeline - coordinate directly with the store upon fulfillment threshold clearance!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {collectives.map((c) => {
                      const percent = Math.floor((c.joined / c.target) * 100);
                      return (
                        <div key={c.id} className="premium-card flex flex-col shadow-xl bg-[#0d121f]">
                          <div className="flex justify-between items-start mb-5">
                            <span className="text-[9px] bg-cyan-500/10 text-cyan-455 border border-cyan-500/20 px-3 py-1 rounded-lg font-black uppercase tracking-widest">
                              {c.discount}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1 font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-600" /> {c.deadline} left
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-105 text-base">{c.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">Merchant: {c.storeName}</p>
                          <p className="text-xs text-slate-300 font-bold mt-1">Item: {c.item}</p>
                          
                          <div className="my-5 bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-black">Group Price</p>
                              <p className="text-xl font-black text-cyan-400 mt-1">₹{c.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-500 uppercase font-black">Retail price</p>
                              <p className="text-xs text-slate-450 line-through mt-1.5">₹{c.originalPrice}</p>
                            </div>
                          </div>

                          <div className="mb-6">
                            <div className="flex justify-between text-xs font-bold text-slate-350 mb-2">
                              <span>Progress threshold</span>
                              <span>{c.joined} / {c.target} neighbors</span>
                            </div>
                            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setCollectives(prev => 
                                prev.map(item => item.id === c.id ? { ...item, joined: Math.min(item.target, item.joined + 1) } : item)
                              );
                              alert("Successfully joined pool! Coordinate on chat for updates.");
                            }}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm py-3.5 rounded-2xl transition-all mt-auto"
                          >
                            Join Collective Pool
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Announcements Sub-tab */}
              {activeTab === "hub" && (
                <div className="flex-grow flex flex-col gap-10 max-w-3xl mx-auto w-full">
                  <div className="premium-card shadow-xl bg-[#0d121f]">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Post Community Announcement</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const txt = fd.get("text") as string;
                      if (!txt) return;
                      const newPost = {
                        id: Date.now(),
                        author: "My Resident Account",
                        role: "Resident (Verified)",
                        text: txt,
                        likes: 0,
                        replies: 0,
                        time: "Just now",
                        category: "Resident post"
                      };
                      setHubPosts(prev => [newPost, ...prev]);
                      e.currentTarget.reset();
                    }}>
                      <textarea 
                        name="text"
                        rows={3}
                        placeholder="Alert neighbors of transformer servicing, water logs, or vendor promos..."
                        className="w-full bg-slate-955 border border-slate-900 rounded-2xl p-5 text-sm text-slate-105 placeholder-slate-600 focus:outline-none focus:border-pink-500 leading-relaxed font-semibold shadow-inner"
                      />
                      <div className="flex justify-between items-center mt-5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Anna Nagar, Chennai</span>
                        <button type="submit" className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg">
                          <Send className="w-3.5 h-3.5" /> Post Announcement
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="flex flex-col gap-8">
                    {hubPosts.map((post) => (
                      <div key={post.id} className="premium-card flex flex-col gap-4 shadow-xl bg-[#0d121f]">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">{post.author}</h4>
                            <p className="text-[9px] text-pink-400 font-black uppercase tracking-widest mt-1">{post.role}</p>
                          </div>
                          <span className="text-xs text-slate-500 font-bold">{post.time}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{post.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gold Rush Sub-tab */}
              {activeTab === "goldrush" && (
                <div className="flex-grow flex flex-col gap-10">
                  <div className="glassmorphism p-8 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/15 shadow-xl flex flex-col gap-2">
                    <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                      <Zap className="w-5.5 h-5.5 pulsing-gold" />
                      <span>Local Gold Rush Active Deals</span>
                    </h2>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                      Gamified time-sensitive promotions that expire soon. Triggered directly by merchant shops to fill off-peak hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {goldRushes.map((rush) => {
                      const percent = Math.floor((rush.claimed / rush.totalClaims) * 100);
                      return (
                        <div key={rush.id} className="premium-card border-t-4 border-t-amber-500 flex flex-col justify-between shadow-xl bg-[#0d121f]">
                          <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] bg-amber-500/10 text-amber-455 border border-amber-500/20 px-3 py-1 rounded-lg font-black uppercase tracking-widest">
                                Live Flash Deal
                              </span>
                              <span className="text-sm text-amber-400 font-mono font-bold flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> {formatTime(rush.remaining)}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-105 text-lg leading-snug">{rush.vendorName}</h3>
                            <p className="text-sm font-semibold text-amber-300 leading-relaxed bg-amber-500/[0.02] p-4 rounded-xl border border-amber-500/10 shadow-inner">
                              {rush.deal}
                            </p>
                          </div>

                          <div className="mt-8 mb-6">
                            <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
                              <span>Claim progress</span>
                              <span>{rush.claimed} / {rush.totalClaims} claimed</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              if (rush.remaining <= 0 || rush.claimed >= rush.totalClaims) {
                                alert("This deal has ended.");
                                return;
                              }
                              setGoldRushes(prev => 
                                prev.map(item => item.id === rush.id ? { ...item, claimed: item.claimed + 1 } : item)
                              );
                              alert("Coupon Claimed! Show QR to vendor within 30 mins.");
                            }}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl transition-all shadow-lg"
                          >
                            Claim Coupon Code
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rewards Sub-tab */}
              {activeTab === "rewards" && (
                <div className="flex-grow flex flex-col gap-10">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 flex flex-col gap-10">
                      <div className="glassmorphism p-8 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/15 shadow-xl flex flex-col gap-2">
                        <h2 className="text-base font-bold text-emerald-450 flex items-center gap-2">
                          <DollarSign className="w-5.5 h-5.5 text-emerald-450" />
                          <span>ProxiRewards Geo-Tagged Ads</span>
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Watch nearby business listings to credit passive rewards directly into your UPI linked wallet.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {ads.map((ad) => (
                          <div key={ad.id} className="premium-card flex flex-col justify-between shadow-xl bg-[#0d121f]">
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 px-3 py-1 rounded-lg font-black uppercase tracking-widest">
                                  {ad.type}
                                </span>
                                <span className="text-sm font-black text-emerald-400">Earn ₹{ad.rewardAmount}</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-100 leading-snug">{ad.title}</h4>
                              <p className="text-xs text-slate-550 mt-1.5 font-semibold">By {ad.advertiser}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setPlayingAd(ad);
                                setAdWatchSeconds(0);
                                setAdTimerActive(true);
                                setCanClaimReward(false);
                                setAdFeedback("Watch foreground stream carefully to claim wallet rewards.");
                              }}
                              className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-2xl"
                            >
                              Watch Ad & Earn
                            </button>
                          </div>
                        ))}
                      </div>

                      {playingAd && (
                        <div className="premium-card border-emerald-500/20 shadow-2xl mt-4 flex flex-col gap-6 bg-[#0c101b]">
                          <div className="flex justify-between items-center pb-4 border-b border-slate-900">
                            <div>
                              <h3 className="text-sm font-bold text-slate-200">{playingAd.title}</h3>
                              <p className="text-[9px] text-emerald-400 font-black tracking-widest uppercase">Visibility heartbeats tracking</p>
                            </div>
                            <button onClick={() => { setPlayingAd(null); setAdTimerActive(false); }} className="text-xs text-slate-555 hover:text-slate-300 font-bold uppercase">Cancel</button>
                          </div>

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
                                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-900/80 w-full text-center">
                                  <p className="text-xs font-bold text-slate-300">IMAGE REWARD PROGRESS</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute top-4 right-4 bg-slate-950/90 px-4 py-2 rounded-full text-xs font-mono font-bold text-emerald-400 border border-slate-900">
                              {adWatchSeconds}s / {playingAd.duration}s
                            </div>
                          </div>

                          {adFeedback && <div className="text-center text-xs font-bold text-amber-300 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">{adFeedback}</div>}

                          <div className="flex gap-4 items-center justify-between">
                            <button onClick={() => setAdTimerActive(!adTimerActive)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-5 py-3 rounded-2xl">
                              {adTimerActive ? "Pause View" : "Resume"}
                            </button>
                            <button disabled={!canClaimReward} onClick={claimAdReward} className={`text-xs font-bold px-6 py-3.5 rounded-2xl ${canClaimReward ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-900"}`}>
                              Claim Reward ₹{playingAd.rewardAmount}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-10">
                      <div className="premium-card shadow-xl bg-[#0d121f]">
                        <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Advertiser Top Up</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-slate-405">Balance</p>
                            <p className="text-2xl font-black text-slate-250">₹{advertiserBalance.toFixed(2)}</p>
                          </div>
                          <button onClick={() => setAdvertiserBalance(b => b + 1000)} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-450 text-xs font-bold px-4 py-2.5 rounded-2xl border border-blue-500/20">+ Top Up</button>
                        </div>
                      </div>

                      <div className="premium-card flex flex-col gap-5 shadow-xl bg-[#0d121f]">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><Target className="w-4.5 h-4.5 text-emerald-450" /> Launch Local Ad</h3>
                        <form onSubmit={handleCreateCampaign} className="flex flex-col gap-4">
                          <input type="text" placeholder="Campaign name" value={newAdTitle} onChange={(e) => setNewAdTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none" />
                          <div className="grid grid-cols-2 gap-4">
                            <select value={newAdType} onChange={(e) => setNewAdType(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none">
                              <option value="video">YouTube Video</option>
                              <option value="image">Static Image</option>
                            </select>
                            <input type="number" placeholder="Budget ₹" value={newAdBudget} onChange={(e) => setNewAdBudget(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none" />
                          </div>
                          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md">Publish Target Radius Campaign</button>
                        </form>
                      </div>

                      <div className="premium-card flex flex-col gap-4 shadow-xl h-[240px] bg-[#0d121f]">
                        <h4 className="text-[10px] text-slate-500 font-bold uppercase">Ad Pipeline logs</h4>
                        <div className="flex-grow overflow-y-auto font-mono text-[9px] text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-900/60 shadow-inner">
                          {fraudLogs.map((log, idx) => <div key={idx} className="border-b border-slate-905 pb-1.5 last:border-0">{log}</div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Sub-tab */}
              {activeTab === "wallet" && (
                <div className="flex-grow flex flex-col gap-10 max-w-3xl mx-auto w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="premium-card bg-gradient-to-br from-slate-900 to-purple-950/20 shadow-xl bg-[#0d121f]">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Available Wallet Balance</p>
                      <p className="text-3xl font-black text-emerald-405 mt-3">₹{walletBalance.toFixed(2)}</p>
                    </div>

                    <div className="premium-card shadow-xl bg-[#0d121f]">
                      <h3 className="text-sm font-bold text-slate-200 mb-4">UPI Payout Portal</h3>
                      <form onSubmit={handleWithdrawal} className="flex flex-col gap-4">
                        <input type="text" placeholder="UPI ID (e.g. shivam@upi)" value={withdrawUpi} onChange={(e) => setWithdrawUpi(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none" />
                        <input type="number" placeholder="Amount (min ₹100)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none" />
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3.5 rounded-2xl shadow-md">Process Instant Payout</button>
                      </form>
                    </div>
                  </div>

                  <div className="premium-card shadow-xl bg-[#0d121f]">
                    <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-900/60">Earning ledger</h3>
                    <div className="flex flex-col gap-4">
                      {walletLogs.map((log) => (
                        <div key={log.id} className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 flex items-center justify-between text-xs hover:border-slate-800 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="text-lg bg-slate-900 p-2.5 rounded-xl border border-slate-900">{log.type === "ad_reward" ? "💰" : "💳"}</span>
                            <div>
                              <p className="font-bold text-slate-200">{log.desc}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{log.time}</p>
                            </div>
                          </div>
                          <span className={`font-black ${log.type === "ad_reward" ? "text-emerald-450" : "text-amber-455"}`}>{log.type === "ad_reward" ? `+ ₹${log.amount.toFixed(2)}` : `- ₹${log.amount.toFixed(2)}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================= */}
          {/* VENDOR PORTAL VIEW                      */}
          {/* ======================================= */}
          {currentRole === "vendor" && (
            <div className="flex-grow flex flex-col gap-10 max-w-4xl mx-auto w-full">
              
              {/* Header Selector */}
              <div className="glassmorphism p-6 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 to-amber-950/15 shadow-md flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Store className="w-5.5 h-5.5" />
                    <span>Merchant Dashboard Panel</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configure storefront pricing, start route simulations, or launch group-buy pools.</p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setSelectedVendorId(1); setIsCartRouteActive(false); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedVendorId === 1 ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-900"
                    }`}
                  >
                    Stationary (Saravana Grocery)
                  </button>
                  <button 
                    onClick={() => { setSelectedVendorId(2); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedVendorId === 2 ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-900"
                    }`}
                  >
                    Mobile Cart (Ooty Veggies)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Storefront Configurations & Quick Goods Pricing */}
                <div className="premium-card flex flex-col gap-6 bg-[#0d121f] shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-3">
                    🏪 Shop Profile & Demand Price Index
                  </h3>

                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] text-slate-550 uppercase font-black">Business Info</p>
                      <p className="text-sm font-bold text-slate-200 mt-1">
                        {selectedVendorId === 1 ? "Saravana Grocery Store (Anna Nagar)" : "Ooty Veggie Cart (Mobile Operator)"}
                      </p>
                    </div>

                    {/* Quick Top Goods List */}
                    <div className="flex flex-col gap-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                        Top Demand Goods (Price Range Index)
                      </p>
                      
                      <div className="flex flex-col gap-2">
                        {vendorDemandGoods.map((good) => (
                          <div key={good.id} className="p-3 bg-slate-950 rounded-xl border border-slate-900/60 flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-200">{good.name}</span>
                            <span className="font-bold text-emerald-450">{good.price}</span>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newGoodName || !newGoodPrice) return;
                        setVendorDemandGoods(prev => [...prev, { id: Date.now(), name: newGoodName, price: newGoodPrice }]);
                        setNewGoodName("");
                        setNewGoodPrice("");
                      }} className="grid grid-cols-2 gap-3 mt-2">
                        <input type="text" placeholder="e.g. Milk 1L" value={newGoodName} onChange={(e) => setNewGoodName(e.target.value)} className="bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-250 focus:outline-none" />
                        <div className="flex gap-2">
                          <input type="text" placeholder="₹ Price" value={newGoodPrice} onChange={(e) => setNewGoodPrice(e.target.value)} className="bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-slate-250 w-20 focus:outline-none" />
                          <button type="submit" className="bg-amber-500 text-slate-955 text-xs font-black p-2 rounded-lg flex-grow hover:bg-amber-400">+</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Stationary Specific: Group-buy Pool & QR verification */}
                {selectedVendorId === 1 ? (
                  <div className="flex flex-col gap-10">
                    
                    {/* Collective Pool Manager (Store initiates Group-buy Pools) */}
                    <div className="premium-card bg-[#0d121f] shadow-xl flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 pb-3 border-b border-slate-900">
                        <Users className="w-4.5 h-4.5 text-cyan-405" />
                        <span>Store-Initiated Group-buy Pools</span>
                      </h3>

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
                        <input type="text" placeholder="Pool title (e.g. Block C Sunflower Oil Pool)" value={newPoolTitle} onChange={(e) => setNewPoolTitle(e.target.value)} className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none" />
                        <input type="text" placeholder="Item name (e.g. Gold Winner 5L Can)" value={newPoolItem} onChange={(e) => setNewPoolItem(e.target.value)} className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" placeholder="Discounted Price (₹)" value={newPoolPrice} onChange={(e) => setNewPoolPrice(e.target.value)} className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none" />
                          <input type="number" placeholder="Retail Price (₹)" value={newPoolOriginalPrice} onChange={(e) => setNewPoolOriginalPrice(e.target.value)} className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none" />
                        </div>
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md">
                          Launch Neighborhood Pool
                        </button>
                      </form>
                    </div>

                    {/* QR Scanner / Coupon Verification Console */}
                    <div className="premium-card bg-[#0d121f] shadow-xl flex flex-col gap-4 border border-slate-800">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-900">
                        <QrCode className="w-4.5 h-4.5 text-amber-500" />
                        <span>Coupon Scanner Console</span>
                      </h3>

                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed font-sans">
                        Verify client claimed Gold Rush coupons by entering the code or scanning QR code fallback.
                      </p>

                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="Enter Claim code (e.g. AMMA-SAMOSA-8)"
                          value={qrCouponInput}
                          onChange={(e) => setQrCouponInput(e.target.value)}
                          className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none flex-grow"
                        />
                        <button 
                          onClick={() => {
                            if (!qrCouponInput) return;
                            setQrScanFeedback("Scanning code... ");
                            setTimeout(() => {
                              setQrScanFeedback("Coupon Verified successfully! Claim marked as COMPLETED.");
                              setQrCouponInput("");
                            }, 1200);
                          }}
                          className="bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl"
                        >
                          Verify Code
                        </button>
                      </div>
                      
                      {qrScanFeedback && (
                        <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 mt-1">
                          {qrScanFeedback}
                        </p>
                      )}
                    </div>

                  </div>
                ) : (
                  // Mobile Cart Specific Features
                  <div className="flex flex-col gap-10">
                    
                    {/* Live GPS Route Tracker */}
                    <div className="premium-card bg-[#0d121f] shadow-xl border border-purple-500/20 flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-slate-205 flex items-center gap-2 pb-3 border-b border-slate-900">
                        <Truck className="w-4.5 h-4.5 text-purple-400" />
                        <span>Live GPS Route Broadcaster</span>
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        Broadcast live movement path. Your coordinate trace draws on geofence maps automatically.
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setIsCartRouteActive(true);
                            setVendors(prev => prev.map(v => v.id === 2 ? { ...v, status: "ON ROUTE (Active)" } : v));
                          }}
                          className="bg-purple-650 hover:bg-purple-550 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md"
                        >
                          Start Route
                        </button>
                        <button
                          onClick={() => {
                            setIsCartRouteActive(false);
                            setVendors(prev => prev.map(v => v.id === 2 ? { ...v, status: "Route Paused" } : v));
                          }}
                          className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs py-3 rounded-xl hover:bg-slate-800"
                        >
                          Pause
                        </button>
                      </div>
                    </div>

                    {/* Voice Announcement Broadcaster */}
                    <div className="premium-card bg-[#0d121f] shadow-xl flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-slate-205 flex items-center gap-2 pb-3 border-b border-slate-900">
                        <Radio className="w-4.5 h-4.5 text-pink-500" />
                        <span>Vernacular Voice announcements</span>
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        Record and broadcast a short voice clip to nearby customers within 500 meters.
                      </p>

                      <button
                        onClick={() => {
                          if (isRecordingAnnouncement) {
                            setIsRecordingAnnouncement(false);
                            const textPrompt = prompt("Confirm speech transcript message:") || "Fresh vegetables loaded near Shanti Colony Blocks!";
                            setVoiceAnnouncementsList(prev => [textPrompt, ...prev]);
                            setSpeechTranscript(`[MOBILE ANNOUNCEMENT]: ${textPrompt}`);
                          } else {
                            setIsRecordingAnnouncement(true);
                          }
                        }}
                        className={`w-full font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                          isRecordingAnnouncement ? "bg-red-650 text-white animate-pulse" : "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/10"
                        }`}
                      >
                        {isRecordingAnnouncement ? "Recording... Click to Stop" : "Record Voice Announcement"}
                      </button>
                    </div>

                  </div>
                )}

              </div>

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
                  <p className="text-xs text-slate-400 mt-1">Manage diagnostic base rates, skills checklist, and respond to incoming client job requests.</p>
                </div>
                
                {/* Active Availability Switcher */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-black">Contractor Status:</span>
                  <button 
                    onClick={() => {
                      setProviderOnline(!providerOnline);
                      setVendors(prev => prev.map(vendor => {
                        if (vendor.id === 3) {
                          return { ...vendor, status: !providerOnline ? "Available" : "Offline" };
                        }
                        return vendor;
                      }));
                    }}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 uppercase tracking-wide ${
                      providerOnline 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" 
                        : "bg-red-500/10 text-red-400 border-red-500/25"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{providerOnline ? "Online (Available)" : "Offline (Hidden)"}</span>
                  </button>
                </div>
              </div>

              {/* Service Grid columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Skills & Pricing */}
                <div className="premium-card flex flex-col gap-6 bg-[#0d121f] shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-3 flex justify-between items-center">
                    <span>🔧 Service Rate Sheet & Credentials</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> verified
                    </span>
                  </h3>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[9px] text-slate-550 block font-black uppercase tracking-widest mb-1.5">Diagnostic Call Fee (₹)</label>
                      <input 
                        type="number" 
                        value={providerDiagnosticRate}
                        onChange={(e) => {
                          setProviderDiagnosticRate(e.target.value);
                          setVendors(prev => prev.map(v => v.id === 3 ? { ...v, priceRange: `₹${e.target.value} Base Rate` } : v));
                        }}
                        className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none w-28 font-bold"
                      />
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-900 flex flex-col gap-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Registered Skills</p>
                      
                      <div className="flex flex-col gap-2">
                        {providerSkills.map((skill, idx) => (
                          <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-xs text-slate-300 font-semibold">
                            <span>{skill}</span>
                            <span className="text-cyan-405">✓</span>
                          </div>
                        ))}
                      </div>

                      {/* Add skill form */}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newSkillText) return;
                        setProviderSkills(prev => [...prev, newSkillText]);
                        setNewSkillText("");
                      }} className="flex gap-3 mt-2">
                        <input 
                          type="text" 
                          placeholder="e.g. AC Gas refilling" 
                          value={newSkillText}
                          onChange={(e) => setNewSkillText(e.target.value)}
                          className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-250 focus:outline-none flex-grow"
                        />
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black px-4 py-2 rounded-xl">+</button>
                      </form>
                    </div>

                  </div>
                </div>

                {/* Incoming Request Radar */}
                <div className="premium-card flex flex-col gap-5 bg-[#0d121f] shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-3 flex justify-between items-center">
                    <span>Incoming request radar</span>
                    <span className="text-[9px] text-slate-550 font-bold font-mono">5km fence</span>
                  </h3>

                  <div className="flex-grow flex flex-col gap-4 overflow-y-auto">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-4 rounded-xl bg-slate-955 border border-slate-900 flex flex-col gap-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black text-slate-300">{job.client}</h4>
                            <p className="text-[10px] text-slate-550 font-semibold">{job.address} • {job.distance}</p>
                          </div>
                          <span className="text-[9px] text-slate-550 font-bold">{job.time}</span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed font-semibold bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                          Job: {job.serviceNeeded}
                        </p>
                        
                        {job.description && (
                          <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                            Note: {job.description}
                          </p>
                        )}

                        {job.quoteStatus === "pending" ? (
                          <div className="flex gap-2 mt-1">
                            <input 
                              type="number" 
                              placeholder="Estimate quote ₹"
                              value={quoteInputAmount}
                              onChange={(e) => setQuoteInputAmount(e.target.value)}
                              className="bg-slate-950 border border-slate-900 rounded-lg p-2 text-[10px] text-slate-200 w-32 focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                if (!quoteInputAmount) return;
                                setJobs(prev => 
                                  prev.map(j => j.id === job.id ? { ...j, quoteStatus: "sent" } : j)
                                );
                                alert(`Quote of ₹${quoteInputAmount} sent successfully to ${job.client}!`);
                                setQuoteInputAmount("");
                              }}
                              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase tracking-wider p-2 rounded-lg flex-grow"
                            >
                              Send Quote
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Quote Sent & Accepted!
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Global Footer */}
        <footer className="mt-auto pt-8 border-t border-slate-900 text-center text-xs text-slate-600 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 ProxiHub • UVFarms, Chennai. Built for Bharat.</p>
          <p className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-700" /> DPDP Act 2023 Compliant</p>
        </footer>

      </main>

    </div>
  );
}
