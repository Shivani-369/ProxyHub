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
  Target
} from "lucide-react";

// Mock Database initial states
const INITIAL_VENDORS = [
  { id: 1, name: "Saravana Grocery Store", type: "stationary", category: "Grocery", lat: 13.041, lng: 80.245, distance: 0.8, status: "Open", rating: 4.6, items: ["Rice", "Sugar", "Carrots", "Onions"] },
  { id: 2, name: "Ooty Veggie Cart", type: "mobile", category: "Vegetables", lat: 13.048, lng: 80.252, distance: 1.4, status: "On Route", rating: 4.8, items: ["Tomatoes", "Potatoes", "Fresh Beans"] },
  { id: 3, name: "Priya Electrical Services", type: "service", category: "Electrician", lat: 13.035, lng: 80.239, distance: 2.1, status: "Available", rating: 4.5, items: ["Wiring", "Fan Repair", "AC Checkup"] },
  { id: 4, name: "Amma's Tiffin Center", type: "stationary", category: "Food", lat: 13.044, lng: 80.248, distance: 1.1, status: "Open", rating: 4.7, items: ["Idly", "Dosa", "Vada", "Sambar"] },
  { id: 5, name: "Velan Flower Stall", type: "mobile", category: "Flowers", lat: 13.053, lng: 80.258, distance: 3.2, status: "On Route", rating: 4.2, items: ["Jasmine", "Rose garlands"] },
  { id: 6, name: "Express Plumbers", type: "service", category: "Plumbing", lat: 13.061, lng: 80.265, distance: 5.4, status: "Available", rating: 4.4, items: ["Leak Fix", "Pipe Install"] }
];

const INITIAL_COLLECTIVES = [
  { id: 101, title: "RWA Basmati Rice Pool", item: "Royal Basmati Rice 10kg", price: 720, originalPrice: 900, discount: "20% OFF", joined: 8, target: 10, deadline: "2h 45m" },
  { id: 102, title: "Block C Sunflower Oil Club", item: "Gold Winner Oil 5L", price: 540, originalPrice: 620, discount: "12% OFF", joined: 4, target: 5, deadline: "5h 12m" },
  { id: 103, title: "Greenways Organic Veggies Box", item: "Premium Hill Veggies 5kg Pack", price: 299, originalPrice: 400, discount: "25% OFF", joined: 12, target: 20, deadline: "1d" }
];

const INITIAL_HUB_POSTS = [
  { id: 201, author: "Anna Nagar RWA Secretary", role: "RWA Verified", text: "🔧 Maintenance Announcement: Power shut down in Blocks C and D tomorrow between 10:00 AM and 1:00 PM for transformer servicing.", likes: 24, replies: 6, time: "2 hours ago", category: "Announcement" },
  { id: 202, author: "Saravana Grocery Store", role: "Verified Vendor", text: "🌽 Fresh batch of organic sweetcorn direct from Salem farmers has just arrived at the shop! Special RWA member discount of 10% today. Ask for bulk orders in the Chat.", likes: 15, replies: 2, time: "4 hours ago", category: "Vendor Promo" },
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

export default function ProxiHubDashboard() {
  const [activeTab, setActiveTab] = useState("map");
  const [userLat, setUserLat] = useState(13.040);
  const [userLng, setUserLng] = useState(80.240);
  const [searchRadius, setSearchRadius] = useState(5.0);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [speechResponse, setSpeechResponse] = useState("");
  
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [collectives, setCollectives] = useState(INITIAL_COLLECTIVES);
  const [hubPosts, setHubPosts] = useState(INITIAL_HUB_POSTS);
  const [goldRushes, setGoldRushes] = useState(INITIAL_GOLD_RUSHES);
  const [ads, setAds] = useState(INITIAL_ADS);
  
  const [walletBalance, setWalletBalance] = useState(45.00);
  const [earningToday, setEarningToday] = useState(18.00);
  const [earningLimit] = useState(100.00);
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletLogs, setWalletLogs] = useState([
    { id: 1, type: "ad_reward", amount: 8.0, desc: "Watched Green Valley Ad", time: "Today, 10:15 AM" },
    { id: 2, type: "ad_reward", amount: 10.0, desc: "Watched Murugan Sweets Ad", time: "Today, 09:30 AM" },
    { id: 3, type: "withdrawal", amount: 150.0, desc: "Withdrew to RWA UPI", time: "Yesterday, 06:12 PM", status: "Processed" }
  ]);

  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdType, setNewAdType] = useState("video");
  const [newAdReward, setNewAdReward] = useState("5");
  const [newAdDuration, setNewAdDuration] = useState("15");
  const [newAdUrl, setNewAdUrl] = useState("");
  const [newAdRadius, setNewAdRadius] = useState("5.0");
  const [newAdBudget, setNewAdBudget] = useState("");
  const [advertiserBalance, setAdvertiserBalance] = useState(1500.00);

  const [playingAd, setPlayingAd] = useState<any>(null);
  const [adWatchSeconds, setAdWatchSeconds] = useState(0);
  const [adTimerActive, setAdTimerActive] = useState(false);
  const [canClaimReward, setCanClaimReward] = useState(false);
  const [fraudRiskScore, setFraudRiskScore] = useState(12);
  const [fraudLogs, setFraudLogs] = useState<string[]>([]);
  const [adFeedback, setAdFeedback] = useState("");

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const adProgressRef = useRef<NodeJS.Timeout | null>(null);

  const filteredVendors = vendors.filter(vendor => {
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
          "Join collective order",
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
    } else if (speech.includes("collective") || speech.includes("group")) {
      setActiveTab("collectives");
      responseText = "Opened Community Collectives page. 3 pools are currently active in your neighborhood.";
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
      alert("Reward Denied: Fraud verification failed. Please ensure VPN is off and app stays active.");
      return;
    }
    
    if (earningToday + playingAd.rewardAmount > earningLimit) {
      alert("Daily Earning limit of ₹100 reached! Withdraw your balance or view ads tomorrow.");
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
    if (!withdrawUpi) {
      alert("Please provide a valid UPI ID (e.g. name@upi)");
      return;
    }
    if (isNaN(amountNum) || amountNum < 100) {
      alert("Minimum withdrawal limit is ₹100");
      return;
    }
    if (amountNum > walletBalance) {
      alert("Insufficient balance in your wallet.");
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
    alert(`Withdrawal request of ₹${amountNum} successfully queued! Funds will process in 24-48 hours.`);
    setWithdrawAmount("");
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(newAdBudget);
    const rewardNum = parseFloat(newAdReward);
    const durationNum = parseInt(newAdDuration);
    
    if (!newAdTitle || isNaN(budgetNum) || budgetNum < 500) {
      alert("Minimum ad campaign budget is ₹500");
      return;
    }

    if (budgetNum > advertiserBalance) {
      alert("Insufficient advertiser top-up balance. Please top up your wallet.");
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
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
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none">Hyperlocal Economy</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "map" 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <MapIcon className="w-4.5 h-4.5" />
              <span>5km Map Discovery</span>
            </button>

            <button
              onClick={() => setActiveTab("collectives")}
              className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "collectives" 
                  ? "bg-cyan-600 text-white shadow-xl shadow-cyan-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>Community Collective</span>
            </button>

            <button
              onClick={() => setActiveTab("hub")}
              className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "hub" 
                  ? "bg-pink-600 text-white shadow-xl shadow-pink-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <span>Neighborhood Hub</span>
            </button>

            <button
              onClick={() => setActiveTab("goldrush")}
              className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                activeTab === "goldrush" 
                  ? "bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <Zap className="w-4.5 h-4.5" />
              <span>Local Gold Rush</span>
            </button>

            <button
              onClick={() => setActiveTab("rewards")}
              className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "rewards" 
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <DollarSign className="w-4.5 h-4.5" />
              <span>ProxiRewards Ads</span>
            </button>

            <button
              onClick={() => setActiveTab("wallet")}
              className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "wallet" 
                  ? "bg-purple-600 text-white shadow-xl shadow-purple-500/20" 
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}
            >
              <CreditCard className="w-4.5 h-4.5" />
              <span>My Earning Wallet</span>
            </button>

            <div className="border-t border-slate-900/80 my-6"></div>

            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "info" 
                  ? "bg-slate-900 text-white border border-slate-800" 
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PRD Summary</span>
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "privacy" 
                  ? "bg-slate-900 text-white border border-slate-800" 
                  : "text-slate-500 hover:text-slate-355"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Compliance</span>
            </button>
          </div>
        </div>

        {/* Wallet balance footer box */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-950 border border-slate-900 shadow-2xl">
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">My Balance</p>
            <p className="text-2xl font-black text-emerald-450 mt-1">₹{walletBalance.toFixed(2)}</p>
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold border-t border-slate-900/85 pt-3">
            <span>TODAY: ₹{earningToday.toFixed(0)}</span>
            <span>CAP: ₹100</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-viewport flex flex-col gap-12">
        
        {/* Vernacular Voice bar component */}
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
                <p className="text-xs text-slate-500 font-semibold">Tamil, Hindi, Telugu, English supported</p>
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-2 leading-relaxed">
                {speechTranscript || 'Click microphone to search: "Find grocery stores nearby"'}
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

        {/* Tabs components viewport */}
        <div className="flex-grow flex flex-col">
          
          {/* MAP DISCOVERY TAB */}
          {activeTab === "map" && (
            <div className="flex-grow flex flex-col gap-10">
              
              {/* Controls bar */}
              <div className="glassmorphism p-6 rounded-3xl border-slate-900 flex flex-wrap gap-6 items-center justify-between shadow-xl">
                <div className="flex items-center gap-4 flex-grow max-w-xl">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search catalog: tiffin, fruits, plumber, AC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-2xl pl-11 pr-5 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">HARD-FENCE RADIUS</span>
                    <span className="text-blue-400 font-black text-base mt-1">{searchRadius} km Limit</span>
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
                  <div className="flex items-center gap-2 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-900 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>Active Geofence</span>
                  </div>
                </div>
              </div>

              {/* Map grid panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-grow">
                
                {/* SVG Visual Canvas Map */}
                <div className="lg:col-span-2 glassmorphism rounded-3xl border-slate-900 p-6 min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-4 flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-blue-400" />
                    <span>Live 5km Radius Discovery Map</span>
                  </h3>
                  
                  <div className="flex-grow rounded-2xl bg-slate-950 border border-slate-900 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute rounded-full border border-slate-800/10" style={{ width: '130px', height: '130px' }}></div>
                    <div className="absolute rounded-full border border-slate-800/10" style={{ width: '260px', height: '260px' }}></div>
                    <div className="absolute rounded-full border border-blue-500/15 bg-blue-500/[0.008] transition-all" style={{ width: `${searchRadius * 72}px`, height: `${searchRadius * 72}px` }}>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest bg-blue-950 text-blue-300 px-3.5 py-1 rounded-full border border-blue-800/25">
                        {searchRadius}km Hard Boundary
                      </span>
                    </div>

                    {/* Centered User Pin */}
                    <div className="absolute z-10 flex flex-col items-center">
                      <div className="w-6.5 h-6.5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center glow-primary">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-full shadow-2xl mt-2.5">
                        My GPS Pin
                      </span>
                    </div>

                    {/* Dynamic Map Pins */}
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
                          
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-11 bg-slate-950 border border-slate-850 text-slate-100 text-[10px] p-3 rounded-2xl shadow-2xl w-40 pointer-events-none transition-opacity flex flex-col gap-0.5">
                            <p className="font-bold text-slate-200">{v.name}</p>
                            <p className="text-slate-400 capitalize">{v.category} • {v.distance}km</p>
                            <p className="text-emerald-400 font-bold mt-1 uppercase tracking-wider text-[8px]">{v.status}</p>
                          </div>
                        </div>
                      );
                    })}

                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-[0.015] pointer-events-none">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="border-r border-b border-white"></div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-8 mt-5 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                    <span className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full bg-blue-500"></span> Stationary Shop</span>
                    <span className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full bg-purple-500"></span> Mobile Cart</span>
                    <span className="flex items-center gap-2.5"><span className="w-3.5 h-3.5 rounded-full bg-cyan-500"></span> Service Contractor</span>
                  </div>
                </div>

                {/* Discovery Directory */}
                <div className="glassmorphism rounded-3xl border-slate-900 p-6 flex flex-col h-[560px] shadow-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-4 pb-3 border-b border-slate-900/60 flex items-center justify-between">
                    <span>Nearby Merchants ({filteredVendors.length})</span>
                    <span className="text-[9px] text-slate-500">Fence Limit</span>
                  </h3>
                  
                  <div className="flex-grow overflow-y-auto flex flex-col gap-4.5 pr-1">
                    {filteredVendors.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-4">
                        <AlertTriangle className="w-8 h-8 mb-4 text-slate-700" />
                        <p className="text-xs font-semibold leading-relaxed">No active merchants found inside the geofence radius.</p>
                      </div>
                    ) : (
                      filteredVendors.map((vendor) => (
                        <div 
                          key={vendor.id}
                          className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-slate-200 leading-snug">{vendor.name}</h4>
                              <p className="text-xs text-slate-500 mt-1 font-medium">{vendor.category} • {vendor.distance} km</p>
                            </div>
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              vendor.status === "Open" || vendor.status === "Available" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/15"
                            }`}>
                              {vendor.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {vendor.items.map((item, idx) => (
                              <span key={idx} className="text-[9px] bg-slate-950 text-slate-450 px-2.5 py-1 rounded-lg border border-slate-900/60 font-bold uppercase tracking-wider">
                                {item}
                              </span>
                            ))}
                          </div>
                          
                          <div className="mt-1 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px] font-semibold">
                            <span className="text-slate-500">⭐ {vendor.rating} Ratings</span>
                            <button className="text-blue-400 font-bold hover:underline uppercase tracking-wider text-[10px]">Chat & Order &rarr;</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* COMMUNITY COLLECTIVE TAB */}
          {activeTab === "collectives" && (
            <div className="flex-grow flex flex-col gap-10">
              
              <div className="glassmorphism p-8 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/15 shadow-xl flex flex-col gap-2">
                <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                  <Users className="w-5.5 h-5.5" />
                  <span>Community Collective Order Pooling</span>
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Join forces with nearby neighbors to unlock bulk wholesale rates from unorganized vendor supply lines. Split payouts instantly with native Razorpay UPI routing.
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
                          <Clock className="w-3.5 h-3.5 text-slate-600" /> {c.deadline} remaining
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-100 text-lg leading-snug">{c.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{c.item}</p>
                      
                      <div className="my-6 bg-slate-950 p-5 rounded-2xl border border-slate-900 flex justify-between items-center shadow-inner">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Group Price</p>
                          <p className="text-2xl font-black text-cyan-400 mt-1">₹{c.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Retail price</p>
                          <p className="text-xs text-slate-450 line-through mt-1.5 font-semibold">₹{c.originalPrice}</p>
                        </div>
                      </div>

                      <div className="mb-8">
                        <div className="flex justify-between text-xs font-bold text-slate-350 mb-2">
                          <span>Threshold Target</span>
                          <span>{c.joined} / {c.target} joined</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setCollectives(prev => 
                            prev.map(item => item.id === c.id ? { ...item, joined: Math.min(item.target, item.joined + 1) } : item)
                          );
                          alert(`Joined the collective pool! Your order is configured for UPI auto-split.`);
                        }}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-600/10 mt-auto"
                      >
                        Join Collective Pool
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* NEIGHBORHOOD HUB TAB */}
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
                    placeholder="Alert neighbors of power maintenance, plumbing services, civic updates, or share recommendations..."
                    className="w-full bg-slate-950 border border-slate-900 rounded-2xl p-5 text-sm text-slate-105 placeholder-slate-600 focus:outline-none focus:border-pink-500 leading-relaxed font-semibold shadow-inner"
                  />
                  <div className="flex justify-between items-center mt-5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">5km Radius Fenced: Anna Nagar</span>
                    <button 
                      type="submit"
                      className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg"
                    >
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

                    <div className="mt-4 pt-4 border-t border-slate-900 flex gap-8 text-xs text-slate-400 font-black uppercase tracking-widest">
                      <button 
                        onClick={() => {
                          setHubPosts(prev => 
                            prev.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p)
                          );
                        }}
                        className="hover:text-pink-400 transition-colors flex items-center gap-1.5"
                      >
                        👍 {post.likes} Likes
                      </button>
                      <button className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
                        💬 {post.replies} Replies
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* LOCAL GOLD RUSH TAB */}
          {activeTab === "goldrush" && (
            <div className="flex-grow flex flex-col gap-10">
              
              <div className="glassmorphism p-8 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/15 shadow-xl flex flex-col gap-2">
                <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Zap className="w-5.5 h-5.5 pulsing-gold" />
                  <span>Local Gold Rush Heatmap Deals</span>
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Gamified limited deals setup by stationary and mobile cart merchants to drive foot traffic during off-peak hours. Claims verify locally via GPS fences.
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
                            Live Urgency Rush
                          </span>
                          <span className="text-sm text-amber-400 font-mono font-bold flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> {formatTime(rush.remaining)}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-100 text-lg leading-snug">{rush.vendorName}</h3>
                        <p className="text-sm font-semibold text-amber-300 leading-relaxed bg-amber-500/[0.02] p-4 rounded-xl border border-amber-500/10 shadow-inner">
                          {rush.deal}
                        </p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Radius Limit: {rush.radius}km</p>
                      </div>

                      <div className="mt-8 mb-6">
                        <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
                          <span>Claim progress</span>
                          <span>{rush.claimed} / {rush.totalClaims} claimed</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (rush.remaining <= 0) {
                            alert("This rush deal has expired!");
                            return;
                          }
                          if (rush.claimed >= rush.totalClaims) {
                            alert("All claims have been taken!");
                            return;
                          }
                          setGoldRushes(prev => 
                            prev.map(item => item.id === rush.id ? { ...item, claimed: item.claimed + 1 } : item)
                          );
                          alert(`Success! Rush promotion code claimed. Show QR verification coupon to the vendor within 30 minutes.`);
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/10"
                      >
                        Claim Rush Coupon Code
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* PROXI REWARDS TAB */}
          {activeTab === "rewards" && (
            <div className="flex-grow flex flex-col gap-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Available ads list */}
                <div className="lg:col-span-2 flex flex-col gap-10">
                  
                  <div className="glassmorphism p-8 rounded-3xl border-slate-900 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/15 shadow-xl flex flex-col gap-2">
                    <h2 className="text-base font-bold text-emerald-450 flex items-center gap-2">
                      <DollarSign className="w-5.5 h-5.5 text-emerald-450" />
                      <span>Available Rewarded Hyperlocal Ads</span>
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Watch verified hyperlocal video or image advertisements within the 5km radius to claim passive wallet income. Heartbeat tracker verifies user presence.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {ads.map((ad) => (
                      <div key={ad.id} className="premium-card flex flex-col justify-between shadow-xl bg-[#0d121f]">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-3 py-1 rounded-lg font-black uppercase tracking-widest">
                              {ad.type}
                            </span>
                            <span className="text-sm font-black text-emerald-400">Earn ₹{ad.rewardAmount}</span>
                          </div>
                          
                          <h4 className="text-sm font-bold text-slate-100 leading-snug">{ad.title}</h4>
                          <p className="text-xs text-slate-500 mt-1.5 font-semibold">By {ad.advertiser} • Duration: {ad.duration}s</p>
                        </div>

                        <button 
                          onClick={() => {
                            setPlayingAd(ad);
                            setAdWatchSeconds(0);
                            setAdTimerActive(true);
                            setCanClaimReward(false);
                            setAdFeedback("Ad loading... Watch carefully to claim your reward.");
                            setFraudLogs(prev => [`[VIEW START] Initiated ad ID: ${ad.id}. Starting visibility listeners.`, ...prev]);
                          }}
                          className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-md"
                        >
                          Watch Ad & Earn
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Ad Player View Console */}
                  {playingAd && (
                    <div className="premium-card border-emerald-500/20 shadow-2xl mt-4 flex flex-col gap-6 bg-[#0c101b]">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-900">
                        <div>
                          <h3 className="text-sm font-bold text-slate-200">{playingAd.title}</h3>
                          <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mt-1">Verification Pipeline Online</p>
                        </div>
                        <button 
                          onClick={() => {
                            setPlayingAd(null);
                            setAdTimerActive(false);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Screen */}
                      <div className="w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-900/60 shadow-inner">
                        {playingAd.type === "video" ? (
                          <div className="w-full h-full relative flex flex-col items-center justify-center">
                            <iframe 
                              src={`${playingAd.mediaUrl}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`}
                              title="Ad player"
                              className="w-full h-full absolute inset-0 pointer-events-none opacity-40"
                            />
                            <div className="z-10 text-center p-6">
                              <Play className="w-12 h-12 text-emerald-400 mx-auto animate-bounce mb-3 shadow-lg" />
                              <p className="text-sm font-black text-slate-200 tracking-widest">ENGAGED VIDEO PLAYING</p>
                              <p className="text-xs text-slate-500 mt-2 font-medium">Timer pauses if visibility changes or tab is hidden</p>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="w-full h-full bg-cover bg-center flex items-end p-6"
                            style={{ backgroundImage: `url(${playingAd.mediaUrl})` }}
                          >
                            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-900/80 w-full text-center">
                              <p className="text-xs font-bold text-slate-300">IMAGE REWARD PROGRESS</p>
                            </div>
                          </div>
                        )}

                        <div className="absolute top-4 right-4 bg-slate-950/90 px-4 py-2 rounded-full text-xs font-mono font-bold text-emerald-400 border border-slate-900">
                          {adWatchSeconds}s / {playingAd.duration}s
                        </div>
                      </div>

                      <div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${(adWatchSeconds / playingAd.duration) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {adFeedback && (
                        <div className="text-center text-xs font-bold text-amber-300 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                          {adFeedback}
                        </div>
                      )}

                      <div className="flex gap-4 items-center justify-between">
                        <button
                          onClick={() => setAdTimerActive(!adTimerActive)}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-5 py-3 rounded-2xl flex items-center gap-1.5 transition-all"
                        >
                          {adTimerActive ? (
                            <>
                              <Pause className="w-3.5 h-3.5" /> Pause View
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" /> Play / Resume
                            </>
                          )}
                        </button>

                        <button 
                          disabled={!canClaimReward}
                          onClick={claimAdReward}
                          className={`text-xs font-bold px-6 py-3.5 rounded-2xl flex items-center gap-1.5 transition-all ${
                            canClaimReward 
                              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25" 
                              : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-900"
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Claim Reward ₹{playingAd.rewardAmount}
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {/* Advertiser panel component */}
                <div className="flex flex-col gap-10">
                  
                  {/* Account box */}
                  <div className="premium-card shadow-xl bg-[#0d121f]">
                    <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Advertiser Account</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400">Ad Wallet Budget</p>
                        <p className="text-2xl font-black text-slate-250 mt-1">₹{advertiserBalance.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setAdvertiserBalance(b => b + 1000);
                          alert("Top up simulation: ₹1000 loaded via simulated Razorpay");
                        }}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold px-4 py-2.5 rounded-2xl border border-blue-500/20 transition-all"
                      >
                        + Top Up
                      </button>
                    </div>
                  </div>

                  {/* Creator Form */}
                  <div className="premium-card flex flex-col gap-5 shadow-xl bg-[#0d121f]">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Target className="w-4.5 h-4.5 text-emerald-450" />
                      <span>Launch Hyperlocal Campaign</span>
                    </h3>

                    <form onSubmit={handleCreateCampaign} className="flex flex-col gap-4">
                      <div>
                        <label className="text-[9px] text-slate-550 font-black block mb-2 uppercase tracking-widest">Campaign Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Organic Farm Special"
                          value={newAdTitle}
                          onChange={(e) => setNewAdTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] text-slate-550 font-black block mb-2 uppercase tracking-widest">Format</label>
                          <select 
                            value={newAdType}
                            onChange={(e) => setNewAdType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="video">YouTube Video</option>
                            <option value="image">Static Image</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-550 font-black block mb-2 uppercase tracking-widest">Radius</label>
                          <select 
                            value={newAdRadius}
                            onChange={(e) => setNewAdRadius(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="1.0">1.0 km radius</option>
                            <option value="2.5">2.5 km radius</option>
                            <option value="5.0">5.0 km radius</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] text-slate-550 font-black block mb-2 uppercase tracking-widest">Reward (₹)</label>
                          <input 
                            type="number" 
                            min="3"
                            max="15"
                            value={newAdReward}
                            onChange={(e) => setNewAdReward(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-550 font-black block mb-2 uppercase tracking-widest">Duration (s)</label>
                          <input 
                            type="number" 
                            min="10"
                            max="120"
                            value={newAdDuration}
                            onChange={(e) => setNewAdDuration(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-555 font-black block mb-2 uppercase tracking-widest">Total Budget (Min ₹500)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 1000"
                          value={newAdBudget}
                          onChange={(e) => setNewAdBudget(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-2xl transition-all shadow-md mt-2"
                      >
                        Publish Target Radius Campaign
                      </button>
                    </form>
                  </div>

                  {/* Fraud System Audit Logs */}
                  <div className="premium-card flex flex-col gap-4 shadow-xl h-[240px] bg-[#0d121f]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Fraud Pipeline Status</h4>
                      <span className={`text-[10px] px-3 py-0.5 rounded-full font-bold ${
                        fraudRiskScore < 30 ? "bg-emerald-500/10 text-emerald-450" : "bg-amber-500/10 text-amber-455"
                      }`}>
                        Risk: {fraudRiskScore}%
                      </span>
                    </div>

                    <div className="flex-grow overflow-y-auto font-mono text-[9px] text-slate-400 flex flex-col gap-2 pr-1 bg-slate-950 p-4 rounded-xl border border-slate-900/60 shadow-inner">
                      {fraudLogs.length === 0 ? (
                        <p className="text-slate-650 italic">No ad stream logs recorded yet.</p>
                      ) : (
                        fraudLogs.map((log, idx) => (
                          <div key={idx} className="border-b border-slate-900/60 pb-1.5 last:border-b-0 leading-normal">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* MY WALLET TAB */}
          {activeTab === "wallet" && (
            <div className="flex-grow flex flex-col gap-10 max-w-3xl mx-auto w-full">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Wallet Balance Card */}
                <div className="premium-card bg-gradient-to-br from-slate-900 to-purple-950/20 shadow-xl bg-[#0d121f]">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Available Balance</p>
                  <p className="text-3xl font-black text-emerald-400 mt-3">₹{walletBalance.toFixed(2)}</p>
                  
                  <div className="mt-8 flex justify-between text-xs text-slate-500 border-t border-slate-900 pt-5">
                    <div>
                      <p>Limit Progress</p>
                      <p className="font-bold text-slate-200 mt-1">₹{earningToday.toFixed(2)} / ₹100.00 Limit</p>
                    </div>
                    <div className="text-right">
                      <p>Withdrawal Minimum</p>
                      <p className="font-bold text-slate-200 mt-1">₹100.00</p>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Form */}
                <div className="premium-card shadow-xl bg-[#0d121f]">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <span>Razorpay UPI Instant Transfer</span>
                  </h3>
                  
                  <form onSubmit={handleWithdrawal} className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">ENTER UPI ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. shivam@okhdfcbank"
                        value={withdrawUpi}
                        onChange={(e) => setWithdrawUpi(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">WITHDRAWAL AMOUNT</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 150"
                        min="100"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3.5 rounded-2xl transition-all shadow-md mt-2"
                    >
                      Process Instant Payout
                    </button>
                  </form>
                </div>

              </div>

              {/* Transactions Log */}
              <div className="premium-card shadow-xl bg-[#0d121f]">
                <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-900/60">Earning & Payout Ledger</h3>
                
                <div className="flex flex-col gap-4">
                  {walletLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 flex items-center justify-between text-xs hover:border-slate-800 transition-all shadow-inner"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg bg-slate-950 p-2.5 rounded-xl border border-slate-900">{log.type === "ad_reward" ? "💰" : "💳"}</span>
                        <div>
                          <p className="font-bold text-slate-200">{log.desc}</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-semibold">{log.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black ${log.type === "ad_reward" ? "text-emerald-400" : "text-amber-400"}`}>
                          {log.type === "ad_reward" ? `+ ₹${log.amount.toFixed(2)}` : `- ₹${log.amount.toFixed(2)}`}
                        </p>
                        {log.status && <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{log.status}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* EXECUTIVE SUMMARY INFO TAB */}
          {activeTab === "info" && (
            <div className="flex-grow flex flex-col gap-10 max-w-3xl mx-auto w-full">
              <div className="premium-card shadow-xl bg-[#0d121f]">
                <h2 className="text-lg font-bold text-slate-100 border-b border-slate-900 pb-4 mb-6 flex items-center gap-2">
                  <Info className="w-5.5 h-5.5 text-blue-400" />
                  <span>Executive Summary: ProxiHub Platform</span>
                </h2>

                <div className="space-y-6 text-slate-300 text-sm leading-relaxed font-medium">
                  <p>
                    <strong>Core Mission:</strong> ProxiHub eliminates the digital visibility gap for India&apos;s 60M+ unorganized local vendors by creating a real-time, proximity-first discovery platform within a strict 5km radius—now evolved into an <strong>inclusive, community-powered, monetized ecosystem</strong>.
                  </p>
                  <p>
                    <strong>Pillars of ProxiHub v4.0:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-4">
                    <li>
                      <strong>VoiceFirst UI:</strong> Vernacular voice commands for regional users with low digital literacy.
                    </li>
                    <li>
                      <strong>Community Collectives:</strong> Neighbors bundle orders for vegetables or grocery bulk rates, driving high volume sales to local stationary merchants.
                    </li>
                    <li>
                      <strong>Local Gold Rush:</strong> Live countdown timers create foot traffic and FOMO for off-peak vendor hours.
                    </li>
                    <li>
                      <strong>ProxiRewards:</strong> Dedicated ad campaigns where users watch geo-tagged advertisements in the target area to secure passive wallet rewards.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY & COMPLIANCE TAB */}
          {activeTab === "privacy" && (
            <div className="flex-grow flex flex-col gap-10 max-w-3xl mx-auto w-full">
              <div className="premium-card shadow-xl bg-[#0d121f]">
                <h2 className="text-lg font-bold text-slate-100 border-b border-slate-900 pb-4 mb-6 flex items-center gap-2">
                  <Lock className="w-5.5 h-5.5 text-emerald-400" />
                  <span>Privacy, Security & DPDP Compliance</span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-950">
                        <th className="p-4.5 font-black text-slate-500 uppercase tracking-widest text-[9px]">AREA</th>
                        <th className="p-4.5 font-black text-slate-500 uppercase tracking-widest text-[9px]">IMPLEMENTATION</th>
                        <th className="p-4.5 font-black text-slate-500 uppercase tracking-widest text-[9px]">PRIORITY</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-900 hover:bg-slate-900/10">
                        <td className="p-4.5 font-bold text-slate-200">Location Data</td>
                        <td className="p-4.5 text-slate-400 leading-relaxed font-semibold">Granular controls. Explicit opt-in. 30-day retention and anonymization.</td>
                        <td className="p-4.5 text-red-400 font-black uppercase tracking-widest text-[9px]">High</td>
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-900/10">
                        <td className="p-4.5 font-bold text-slate-200">DPDP Act 2023</td>
                        <td className="p-4.5 text-slate-400 leading-relaxed font-semibold">Consent logs, Indian data residency, right to account deletion.</td>
                        <td className="p-4.5 text-red-400 font-black uppercase tracking-widest text-[9px]">High</td>
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-900/10">
                        <td className="p-4.5 font-bold text-slate-200">Rewards Data</td>
                        <td className="p-4.5 text-slate-400 leading-relaxed font-semibold">KYC verification stored securely. Withdrawal logs encrypted.</td>
                        <td className="p-4.5 text-red-400 font-black uppercase tracking-widest text-[9px]">High</td>
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-900/10">
                        <td className="p-4.5 font-bold text-slate-205">In-App Chat</td>
                        <td className="p-4.5 text-slate-400 leading-relaxed font-semibold">Masked calling/SMS options via Twilio integration rules.</td>
                        <td className="p-4.5 text-orange-400 font-black uppercase tracking-widest text-[9px]">Medium</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Global Footer */}
        <footer className="mt-auto pt-10 border-t border-slate-900 text-center text-xs text-slate-600 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 ProxiHub • UVFarms, Chennai. Built for Bharat.</p>
          <p className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-700" /> DPDP Act 2023 Compliant</p>
        </footer>

      </main>

    </div>
  );
}
