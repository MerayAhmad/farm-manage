import React, { useState, useEffect } from "react";
import { Farm, Cow, CattleEvent, CowStatus, HealthStatus, ExitReason, UserAccount, RegistrationNotification, VisitAnnouncement } from "./types";
import { INITIAL_FARMS, INITIAL_COWS, INITIAL_EVENTS } from "./initialData";
import FarmOverview from "./components/FarmOverview";
import CowManager from "./components/CowManager";
import AIVetChat from "./components/AIVetChat";
import AdminCenter from "./components/AdminCenter";
import VisitsTab from "./components/VisitsTab";
import { SYRIA_GOVERNORATES, SYRIA_REGIONS } from "./syriaData";
import { 
  Building2, Users, Stethoscope, BarChart3, Menu, X, Landmark, TrendingUp, Milk, AlertTriangle, RefreshCw,
  Lock, User, CheckCircle, LogOut, ShieldAlert, KeyRound, ArrowRight, Bell, Sparkles, Building,
  Database, Cloud, Wifi, WifiOff, FileJson, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  isFirebaseConfigured, 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  loadFarmsFromFirestore, 
  loadCowsFromFirestore, 
  loadEventsFromFirestore, 
  loadUsersFromFirestore,
  saveFarmToFirestore, 
  deleteFarmFromFirestore, 
  saveCowToFirestore, 
  deleteCowFromFirestore, 
  saveEventToFirestore, 
  deleteEventFromFirestore, 
  saveUserToFirestore,
  deleteUserFromFirestore,
  bulkSyncLocalToFirestore 
} from "./lib/firebaseService";

export default function App() {
  // --- Persistent States ---
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [events, setEvents] = useState<CattleEvent[]>([]);

  // Firebase configuration and connection states
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(() => isFirebaseConfigured());
  const [firebaseConfigState, setFirebaseConfigState] = useState<any>(() => getSavedFirebaseConfig());

  // Firebase Modal and Form states
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [fbJsonInput, setFbJsonInput] = useState("");
  const [fbApiKey, setFbApiKey] = useState("");
  const [fbAuthDomain, setFbAuthDomain] = useState("");
  const [fbProjectId, setFbProjectId] = useState("");
  const [fbStorageBucket, setFbStorageBucket] = useState("");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState("");
  const [fbAppId, setFbAppId] = useState("");
  const [showConfigManual, setShowConfigManual] = useState(false);
  const [fbStatusMessage, setFbStatusMessage] = useState("");
  const [fbStatusType, setFbStatusType] = useState<"success" | "error" | "">("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (firebaseConfigState) {
      setFbApiKey(firebaseConfigState.apiKey || "");
      setFbAuthDomain(firebaseConfigState.authDomain || "");
      setFbProjectId(firebaseConfigState.projectId || "");
      setFbStorageBucket(firebaseConfigState.storageBucket || "");
      setFbMessagingSenderId(firebaseConfigState.messagingSenderId || "");
      setFbAppId(firebaseConfigState.appId || "");
    } else {
      setFbApiKey("");
      setFbAuthDomain("");
      setFbProjectId("");
      setFbStorageBucket("");
      setFbMessagingSenderId("");
      setFbAppId("");
    }
  }, [firebaseConfigState]);

  // Auth & Admin settings States
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem("maraee_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [adminProfile, setAdminProfile] = useState(() => {
    const saved = localStorage.getItem("maraee_admin_profile");
    return saved ? JSON.parse(saved) : { username: "المهندسة ميراي أحمد", email: "eng.meray.ahmad@gmail.com", password: "admin" };
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem("maraee_users");
    if (saved) return JSON.parse(saved);
    // Initial demo accounts
    return [
      { email: "eng.meray.ahmad@gmail.com", password: "admin", role: "admin" },
      { email: "demobreeder@maraee.sy", password: "password", role: "breeder", farmId: "farm-1" }
    ];
  });

  const [notifications, setNotifications] = useState<RegistrationNotification[]>(() => {
    const saved = localStorage.getItem("maraee_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<VisitAnnouncement[]>(() => {
    const saved = localStorage.getItem("maraee_announcements");
    return saved ? JSON.parse(saved) : [];
  });

  // Load from Firestore (if connected) or LocalStorage (fallback/default)
  useEffect(() => {
    async function loadInitialData() {
      if (isFirebaseConfigured()) {
        try {
          const dbFarms = await loadFarmsFromFirestore();
          const dbCows = await loadCowsFromFirestore();
          const dbEvents = await loadEventsFromFirestore();
          const dbUsers = await loadUsersFromFirestore();

          if (dbFarms && dbFarms.length > 0) {
            setFarms(dbFarms);
            localStorage.setItem("maraee_farms", JSON.stringify(dbFarms));
          } else {
            loadFromLocalStorageOrSeed();
          }

          if (dbCows && dbCows.length > 0) {
            setCows(dbCows);
            localStorage.setItem("maraee_cows", JSON.stringify(dbCows));
          } else {
            setCows(INITIAL_COWS);
            localStorage.setItem("maraee_cows", JSON.stringify(INITIAL_COWS));
          }

          if (dbEvents && dbEvents.length > 0) {
            setEvents(dbEvents);
            localStorage.setItem("maraee_events", JSON.stringify(dbEvents));
          } else {
            setEvents(INITIAL_EVENTS);
            localStorage.setItem("maraee_events", JSON.stringify(INITIAL_EVENTS));
          }

          if (dbUsers && dbUsers.length > 0) {
            setUsers(dbUsers);
            localStorage.setItem("maraee_users", JSON.stringify(dbUsers));
          }
          setIsFirebaseConnected(true);
          return;
        } catch (err) {
          console.error("Failed to load initial data from Firestore, falling back to local storage:", err);
        }
      }

      // Fallback
      loadFromLocalStorageOrSeed();
    }

    function loadFromLocalStorageOrSeed() {
      const storedFarms = localStorage.getItem("maraee_farms");
      const storedCows = localStorage.getItem("maraee_cows");
      const storedEvents = localStorage.getItem("maraee_events");

      if (storedFarms) {
        setFarms(JSON.parse(storedFarms));
      } else {
        const seededFarms = INITIAL_FARMS.map(f => {
          if (f.id === "farm-1") {
            return {
              ...f,
              ownerEmail: "demobreeder@maraee.sy",
              ownerName: "مربي افتراضي",
              governorate: "حمص",
              district: "الرستن"
            };
          }
          return f;
        });
        setFarms(seededFarms);
        localStorage.setItem("maraee_farms", JSON.stringify(seededFarms));
      }

      if (storedCows) {
        setCows(JSON.parse(storedCows));
      } else {
        setCows(INITIAL_COWS);
        localStorage.setItem("maraee_cows", JSON.stringify(INITIAL_COWS));
      }

      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      } else {
        setEvents(INITIAL_EVENTS);
        localStorage.setItem("maraee_events", JSON.stringify(INITIAL_EVENTS));
      }
    }

    loadInitialData();
  }, [isFirebaseConnected]);

  // Sync adminProfile, users, notifications to local storage
  useEffect(() => {
    localStorage.setItem("maraee_admin_profile", JSON.stringify(adminProfile));
  }, [adminProfile]);

  useEffect(() => {
    localStorage.setItem("maraee_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("maraee_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("maraee_announcements", JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("maraee_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("maraee_current_user");
    }
  }, [currentUser]);

  // Save to LocalStorage and Firestore helpers
  const saveFarms = async (newFarms: Farm[]) => {
    setFarms(newFarms);
    localStorage.setItem("maraee_farms", JSON.stringify(newFarms));

    if (isFirebaseConfigured()) {
      try {
        // Detect and handle deleted farms
        const deletedFarms = farms.filter(f => !newFarms.some(nf => nf.id === f.id));
        for (const f of deletedFarms) {
          await deleteFarmFromFirestore(f.id);
        }
        // Save current farms
        for (const farm of newFarms) {
          await saveFarmToFirestore(farm);
        }
      } catch (err) {
        console.error("Firestore sync farms error:", err);
      }
    }
  };

  const saveCows = async (newCows: Cow[]) => {
    setCows(newCows);
    localStorage.setItem("maraee_cows", JSON.stringify(newCows));

    if (isFirebaseConfigured()) {
      try {
        // Detect and handle deleted cows
        const deletedCows = cows.filter(c => !newCows.some(nc => nc.id === c.id));
        for (const c of deletedCows) {
          await deleteCowFromFirestore(c.id);
        }
        // Save current cows
        for (const cow of newCows) {
          await saveCowToFirestore(cow);
        }
      } catch (err) {
        console.error("Firestore sync cows error:", err);
      }
    }
  };

  const saveEvents = async (newEvents: CattleEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem("maraee_events", JSON.stringify(newEvents));

    if (isFirebaseConfigured()) {
      try {
        // Detect and handle deleted events
        const deletedEvents = events.filter(e => !newEvents.some(ne => ne.id === e.id));
        for (const e of deletedEvents) {
          await deleteEventFromFirestore(e.id);
        }
        // Save current events
        for (const event of newEvents) {
          await saveEventToFirestore(event);
        }
      } catch (err) {
        console.error("Firestore sync events error:", err);
      }
    }
  };

  const saveUsers = async (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    localStorage.setItem("maraee_users", JSON.stringify(newUsers));

    if (isFirebaseConfigured()) {
      try {
        // Detect and handle deleted users
        const deletedUsers = users.filter(u => !newUsers.some(nu => nu.email.trim().toLowerCase() === u.email.trim().toLowerCase()));
        for (const u of deletedUsers) {
          await deleteUserFromFirestore(u.email);
        }
        // Save current users
        for (const user of newUsers) {
          await saveUserToFirestore(user);
        }
      } catch (err) {
        console.error("Firestore sync users error:", err);
      }
    }
  };

  // Firebase Setup callbacks
  const handleSaveFirebaseConfig = (config: any) => {
    saveFirebaseConfig(config);
    setFirebaseConfigState(config);
    setIsFirebaseConnected(true);
  };

  const handleClearFirebaseConfig = () => {
    clearFirebaseConfig();
    setFirebaseConfigState(null);
    setIsFirebaseConnected(false);
  };

  const handleBulkSync = async () => {
    await bulkSyncLocalToFirestore(farms, cows, events, users);
  };

  // --- UI Navigation State ---
  const [currentTab, setCurrentTab] = useState<"dashboard" | "cows" | "vet_chat" | "financials" | "admin_center" | "visits">("dashboard");
  const [selectedFarmId, setSelectedFarmId] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Automatically restrict selectedFarmId for breeder
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "breeder" && currentUser.farmId) {
        setSelectedFarmId(currentUser.farmId);
      } else if (currentUser.role === "admin") {
        setSelectedFarmId("all");
      }
    }
  }, [currentUser]);

  // --- Auth & Account Handlers ---
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Breeder Registration fields
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBreederName, setRegBreederName] = useState("");
  const [regFarmName, setRegFarmName] = useState("");
  const [regCapacity, setRegCapacity] = useState(50);
  const [regGov, setRegGov] = useState("دمشق");
  const [regDist, setRegDist] = useState("الميدان");
  const [regNotes, setRegNotes] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regNationalId, setRegNationalId] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // 1. Check if Admin profile credentials match
    if (loginEmail.trim().toLowerCase() === adminProfile.email.toLowerCase() && loginPassword === adminProfile.password) {
      const adminUser: UserAccount = {
        email: adminProfile.email,
        role: "admin",
      };
      setCurrentUser(adminUser);
      setCurrentTab("dashboard");
      return;
    }

    // 2. Check if Breeder account exists
    const foundUser = users.find(u => u.email.trim().toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword);
    if (foundUser) {
      setCurrentUser(foundUser);
      if (foundUser.farmId) {
        setSelectedFarmId(foundUser.farmId);
      }
      setCurrentTab("dashboard");
    } else {
      setAuthError("❌ البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!regEmail || !regPassword || !regBreederName || !regFarmName || !regPhone || !regNationalId || !regAddress) {
      setAuthError("⚠️ يرجى ملء كافة الحقول الإلزامية المطلوبة (بما في ذلك رقم الهاتف، الهوية، والعنوان التفصيلي).");
      return;
    }

    // Check if email already registered
    const emailExists = users.some(u => u.email.trim().toLowerCase() === regEmail.trim().toLowerCase()) || regEmail.trim().toLowerCase() === adminProfile.email.toLowerCase();
    if (emailExists) {
      setAuthError("⚠️ هذا البريد الإلكتروني مسجل مسبقاً في النظام.");
      return;
    }

    const farmId = `farm-${Date.now()}`;
    const finalLocation = `سوريا، محافظة ${regGov} - منطقة ${regDist}`;

    // 1. Create Farm
    const newFarm: Farm = {
      id: farmId,
      name: regFarmName,
      location: finalLocation,
      capacity: Number(regCapacity),
      notes: regNotes,
      governorate: regGov,
      district: regDist,
      ownerEmail: regEmail.trim().toLowerCase(),
      ownerName: regBreederName,
      createdAt: new Date().toISOString().split("T")[0]
    };

    // 2. Create UserAccount
    const newUser: UserAccount = {
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: "breeder",
      username: regBreederName,
      farmId,
      phone: regPhone,
      nationalId: regNationalId,
      address: regAddress
    };

    // 3. Create Notification for Admin
    const newNotif: RegistrationNotification = {
      id: `notif-${Date.now()}`,
      email: regEmail.trim().toLowerCase(),
      farmName: regFarmName,
      governorate: regGov,
      district: regDist,
      date: new Date().toISOString().split("T")[0],
      read: false
    };

    // Save states
    saveFarms([...farms, newFarm]);
    saveUsers([...users, newUser]);
    setNotifications([newNotif, ...notifications]);
    
    // Auto login
    setRegSuccess(true);
    setTimeout(() => {
      setCurrentUser(newUser);
      setSelectedFarmId(farmId);
      setCurrentTab("dashboard");
      setRegSuccess(false);
      // Reset fields
      setRegEmail("");
      setRegPassword("");
      setRegBreederName("");
      setRegFarmName("");
      setRegNotes("");
    }, 1500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab("dashboard");
    setSelectedFarmId("all");
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleUpdateAdminProfile = (newUsername: string, newPassword?: string) => {
    setAdminProfile(prev => ({
      ...prev,
      username: newUsername,
      password: newPassword || prev.password,
    }));
  };

  const handleDeleteFarm = (farmId: string) => {
    // Delete Farm, its cows and events
    const updatedFarms = farms.filter(f => f.id !== farmId);
    saveFarms(updatedFarms);

    const updatedCows = cows.filter(c => c.farmId !== farmId);
    saveCows(updatedCows);

    const updatedEvents = events.filter(e => e.farmId !== farmId);
    saveEvents(updatedEvents);

    // Also delete linked user breeder account if possible
    saveUsers(users.filter(u => u.farmId !== farmId));
  };

  // --- Visit Announcements Handlers ---
  const handleAddAnnouncement = (ann: Omit<VisitAnnouncement, "id" | "createdAt" | "registrations">) => {
    const newAnn: VisitAnnouncement = {
      ...ann,
      id: "ann-" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      registrations: [],
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleRegisterVisit = (announcementId: string, farmId: string) => {
    setAnnouncements(prev => prev.map(ann => {
      if (ann.id === announcementId) {
        const currentRegs = ann.registrations || [];
        if (!currentRegs.includes(farmId)) {
          return {
            ...ann,
            registrations: [...currentRegs, farmId]
          };
        }
      }
      return ann;
    }));
  };

  // --- Cattle Handlers ---
  const handleAddFarm = (farmData: {
    name: string;
    location: string;
    capacity: number;
    notes?: string;
    governorate?: string;
    district?: string;
    ownerEmail?: string;
    ownerName?: string;
  }) => {
    const newFarm: Farm = {
      ...farmData,
      id: `farm-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    saveFarms([...farms, newFarm]);
  };

  const handleAddCow = (newCow: Cow) => {
    saveCows([...cows, newCow]);
  };

  const handleUpdateCowStatus = (cowId: string, status: CowStatus, healthStatus: HealthStatus) => {
    const updatedCows = cows.map((cow) => {
      if (cow.id === cowId) {
        return { 
          ...cow, 
          status, 
          healthStatus,
          milkYield: (status === "milking") ? cow.milkYield : undefined 
        };
      }
      return cow;
    });
    saveCows(updatedCows);

    // Auto-record transition event
    const targetCow = cows.find((c) => c.id === cowId);
    if (targetCow) {
      const statusArabic = {
        milking: "حلوب 🥛",
        dry: "جافة 🍂",
        pregnant: "حامل 🤰",
        heifer: "عجلة 🐄",
        calf: "عجل رضيع 🍼",
        sick: "مريضة 🩺",
        sold: "مباعة 💰",
        deceased: "متوفاة 🪦"
      }[status];

      handleAddEvent({
        cowId,
        farmId: targetCow.farmId,
        type: status === "sick" ? "emergency" : "health_check",
        date: new Date().toISOString().split("T")[0],
        title: `تحديث حالة البقرة: ${statusArabic}`,
        description: `تغيير الحالة الإنتاجية إلى [${statusArabic}] والحالة الصحية إلى [${healthStatus}].`,
        severity: status === "sick" ? "warning" : "normal",
        recordedBy: currentUser?.role === "admin" ? adminProfile.username : (currentUser?.email || "المربي العام"),
      });
    }
  };

  const handleRecordExit = (
    cowId: string,
    exitReason: ExitReason,
    exitDate: string,
    exitPrice?: number,
    exitNotes?: string
  ) => {
    const updatedCows = cows.map((cow) => {
      if (cow.id === cowId) {
        return {
          ...cow,
          status: exitReason === "sale" ? ("sold" as CowStatus) : ("deceased" as CowStatus),
          healthStatus: exitReason === "sale" ? ("stable" as HealthStatus) : ("critical" as HealthStatus),
          exitDate,
          exitReason,
          exitPrice,
          exitNotes,
          milkYield: undefined,
        };
      }
      return cow;
    });
    saveCows(updatedCows);
  };

  const handleAddEvent = (eventData: Omit<CattleEvent, "id">) => {
    const newEvent: CattleEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    saveEvents([newEvent, ...events]);
  };

  const handleDeleteCow = (cowId: string) => {
    const remainingCows = cows.filter((c) => c.id !== cowId);
    saveCows(remainingCows);
    const remainingEvents = events.filter((e) => e.cowId !== cowId);
    saveEvents(remainingEvents);
  };

  const handleResetData = () => {
    if (confirm("⚠️ تحذير: سيتم حذف جميع التعديلات وإعادة تعيين بيانات المزارع المرجعية الافتراضية. هل تريد الاستمرار؟")) {
      localStorage.removeItem("maraee_farms");
      localStorage.removeItem("maraee_cows");
      localStorage.removeItem("maraee_events");
      localStorage.removeItem("maraee_notifications");
      
      const seededFarms = INITIAL_FARMS.map(f => {
        if (f.id === "farm-1") {
          return {
            ...f,
            ownerEmail: "demobreeder@maraee.sy",
            ownerName: "مربي افتراضي",
            governorate: "حمص",
            district: "الرستن"
          };
        }
        return f;
      });
      setFarms(seededFarms);
      setCows(INITIAL_COWS);
      setEvents(INITIAL_EVENTS);
      setNotifications([]);
      alert("تمت إعادة تعيين البيانات المرجعية بنجاح!");
    }
  };

  // --- Dynamic Sandbox Datasets Filtering based on user role ---
  const visibleFarms = currentUser?.role === "breeder"
    ? farms.filter(f => f.id === currentUser.farmId)
    : farms;

  const visibleCows = currentUser?.role === "breeder"
    ? cows.filter(c => c.farmId === currentUser.farmId)
    : cows;

  const visibleEvents = currentUser?.role === "breeder"
    ? events.filter(e => e.farmId === currentUser.farmId)
    : events;

  // --- Financial Statistics calculations (using sandbox data) ---
  const getFinancialStats = () => {
    const purchasedCowsSum = visibleCows
      .filter((c) => c.entryMethod === "purchase" && c.purchasePrice)
      .reduce((sum, c) => sum + (c.purchasePrice || 0), 0);

    const eventCostsSum = visibleEvents
      .filter((e) => e.cost && e.cost > 0 && e.type !== "sale")
      .reduce((sum, e) => sum + (e.cost || 0), 0);

    const salesRevenue = visibleCows
      .filter((c) => c.status === "sold" && c.exitPrice)
      .reduce((sum, c) => sum + (c.exitPrice || 0), 0);

    const totalExpenses = purchasedCowsSum + eventCostsSum;
    const netProfit = salesRevenue - totalExpenses;

    return {
      totalExpenses,
      salesRevenue,
      netProfit,
      purchasedCowsSum,
      eventCostsSum,
    };
  };

  const financials = getFinancialStats();

  // If NOT Logged In: Render beautiful full authentication dashboard screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-right" dir="rtl" style={{ fontFamily: "Inter, sans-serif" }} id="auth-root">
        <div className="max-w-4xl w-full bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 grid grid-cols-1 lg:grid-cols-12">
          
          {/* Side Brand Information (Spans 5 cols on lg) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 to-teal-950 p-8 flex flex-col justify-between text-white border-l border-slate-700/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl border border-emerald-400/20">
                  🐄
                </div>
                <div>
                  <h1 className="font-black text-xl tracking-wide">أكبيطرة الذكية</h1>
                  <span className="text-xs text-emerald-300 font-medium font-sans">SMART AKBEITARA SYRIA</span>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold text-slate-100">نظام الإدارة الشاملة لمزارع الأبقار</h2>
                <p className="text-xs text-emerald-100/70 leading-relaxed font-light">
                  نظام لإدارة القطيع والإنتاجية وصحة البقرة من الولادة أو الشراء، وتتبع التحصينات والعمليات الطبية، وحساب الميزانية وإرسال البلاغات الفورية.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-8 relative z-10 border-t border-emerald-800/60">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>إدارة القطيع والصحة وتوزيع الحليب</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تقسيم جغرافي دقيق للمحافظات السورية</span>
              </div>
            </div>
          </div>

          {/* Form Side (Spans 7 cols on lg) */}
          <div className="lg:col-span-7 p-8 flex flex-col justify-center space-y-6 bg-slate-800/50">
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-700 w-fit self-center">
              <button
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all border-none ${
                  authMode === "login" ? "bg-emerald-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all border-none ${
                  authMode === "register" ? "bg-emerald-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                مربي جديد (إنشاء حساب)
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>تم إنشاء الحساب والمزرعة بنجاح! جاري توجيهك...</span>
              </div>
            )}

            {authMode === "login" ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">البريد الإلكتروني</label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="breeder@maraee.sy"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pr-11 pl-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pr-11 pl-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all border-none shadow-lg mt-4 text-sm flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>دخول آمن للنظام</span>
                </button>
              </form>
            ) : (
              // Breeder Registration Form
              <form onSubmit={handleRegister} className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                <h3 className="text-slate-200 font-bold text-xs uppercase tracking-wider border-b border-slate-700/50 pb-1.5">بيانات حساب المربي الجديد</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">اسم المربي بالكامل</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد الحمصي"
                      value={regBreederName}
                      onChange={(e) => setRegBreederName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      placeholder="breeder@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-left font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">رقم الهاتف (مطلوب)</label>
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 0988123456"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-right font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">الرقم الوطني / رقم الهوية (مطلوب)</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 01020034567"
                      value={regNationalId}
                      onChange={(e) => setRegNationalId(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-right font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">عنوان المربي التفصيلي السكني/العمل (مطلوب)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حمص، شارع الدبلان، مقابل بناء البلدية"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">كلمة المرور الآمنة</label>
                  <input
                    type="password"
                    required
                    placeholder="لا تقل عن 6 رموز"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>

                <h3 className="text-slate-200 font-bold text-xs uppercase tracking-wider border-b border-slate-700/50 pt-2 pb-1.5">بيانات المزرعة الجغرافية</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">المحافظة في سوريا 🇸🇾</label>
                    <select
                      value={regGov}
                      onChange={(e) => {
                        const selectedGov = e.target.value;
                        setRegGov(selectedGov);
                        setRegDist(SYRIA_REGIONS[selectedGov][0]);
                      }}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 text-right"
                    >
                      {SYRIA_GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">المنطقة الإدارية</label>
                    <select
                      value={regDist}
                      onChange={(e) => setRegDist(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 text-right"
                    >
                      {(SYRIA_REGIONS[regGov] || []).map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">اسم المزرعة</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مزرعة حمص الكبرى"
                      value={regFarmName}
                      onChange={(e) => setRegFarmName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">الطاقة الاستيعابية القصوى (رأس)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={regCapacity}
                      onChange={(e) => setRegCapacity(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-right font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400">ملاحظات أو مواصفات (اختياري)</label>
                  <textarea
                    placeholder="نظام التغذية المستخدم، الآلات، إلخ..."
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 text-right resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all border-none shadow-lg mt-4 text-xs"
                >
                  حفظ البيانات وتسجيل المزرعة
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    );
  }

  // --- Main Application UI when logged in ---
  return (
    <div className="min-h-screen flex flex-col xl:flex-row-reverse bg-[#f8fafc] overflow-x-hidden text-right" dir="rtl" style={{ fontFamily: "Inter, sans-serif" }}>
      
      {/* Mobile Top Header */}
      <div className="xl:hidden bg-emerald-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-emerald-800 rounded-lg text-white border-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-extrabold text-lg flex items-center gap-2">
          <span>أكبيطرة الذكية</span>
          <span className="text-xl">🐄</span>
        </span>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed xl:sticky top-0 right-0 h-screen w-72 bg-emerald-900 text-white flex flex-col justify-between p-6 z-40 transition-transform duration-300 shadow-2xl xl:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          {/* Logo & Info */}
          <div className="flex justify-between items-center pb-4 border-b border-emerald-800/60">
            <button
              onClick={() => setSidebarOpen(false)}
              className="xl:hidden text-emerald-200 hover:text-white p-1 hover:bg-emerald-800 rounded-lg border-none"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-xl">
                🐄
              </div>
              <div>
                <h2 className="font-black text-lg tracking-tight">أكبيطرة الذكية</h2>
                <span className="text-[10px] text-emerald-300 font-medium">نظام متكامل لإدارة القطعان</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1.5 flex flex-col">
            <button
              onClick={() => {
                setCurrentTab("dashboard");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border-none ${
                currentTab === "dashboard"
                  ? "bg-white text-emerald-900 shadow-lg"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <span>لوحة التحكم الرئيسية</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("cows");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border-none ${
                currentTab === "cows"
                  ? "bg-white text-emerald-900 shadow-lg"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span>سجل وإدارة القطيع</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("vet_chat");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border-none ${
                currentTab === "vet_chat"
                  ? "bg-white text-emerald-900 shadow-lg"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <Stethoscope className="w-5 h-5 shrink-0" />
              <span>العيادة البيطرية (Gemini)</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("financials");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border-none ${
                currentTab === "financials"
                  ? "bg-white text-emerald-900 shadow-lg"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              <span>التقارير والميزانية</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("visits");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border-none ${
                currentTab === "visits"
                  ? "bg-white text-emerald-900 shadow-lg"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>الزيارات الميدانية 🇸🇾</span>
            </button>

            {/* Admin Center exclusive tab */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => {
                  setCurrentTab("admin_center");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all border-none ${
                  currentTab === "admin_center"
                    ? "bg-teal-500 text-white shadow-lg"
                    : "text-teal-100 hover:bg-teal-800/40"
                }`}
              >
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-300 animate-pulse" />
                <span className="flex items-center gap-1.5">
                  <span>لوحة الإشراف العام</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Firebase Cloud Sync Widget */}
        <div className="px-1 space-y-2 shrink-0">
          <div className="flex items-center justify-between px-1.5">
            <span className="text-[9px] font-bold text-emerald-300 tracking-wider uppercase">المزامنة السحابية</span>
            <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          </div>
          
          <div className="bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-800/30 space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-300" />
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">
                  {isFirebaseConnected ? "متصل بـ Firebase ✅" : "أوفلاين (LocalStorage) 💾"}
                </p>
                <p className="text-[9px] text-emerald-300/80 font-mono mt-0.5">
                  {isFirebaseConnected ? `Project: ${firebaseConfigState?.projectId || 'myfarm-b6a8a'}` : "تخزين محلي آمن"}
                </p>
              </div>
            </div>

            {isFirebaseConnected ? (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (isSyncing) return;
                  setIsSyncing(true);
                  try {
                    await handleBulkSync();
                    alert("تمت المزامنة ورفع جميع السجلات بنجاح! 🚀");
                  } catch (err: any) {
                    alert(`فشلت المزامنة: ${err?.message || "تأكد من إعدادات الاتصال وقواعد الحماية"}`);
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                disabled={isSyncing}
                className="w-full py-1.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-800/50 text-white text-[10px] font-extrabold rounded-xl transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? "جاري الرفع..." : "مزامنة ورفع السجلات 🚀"}</span>
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowFirebaseModal(true); }}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-extrabold rounded-xl transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Cloud className="w-3 h-3" />
                <span>إعداد اتصال السحابة ⚡</span>
              </button>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setShowFirebaseModal(true); }}
              className="w-full text-center text-[9px] text-emerald-200/90 hover:text-white font-semibold flex items-center justify-center gap-1 bg-transparent border-none py-0.5 cursor-pointer hover:underline"
            >
              <span>عرض تفاصيل وإعدادات السحابة ⚙️</span>
            </button>
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="space-y-4 pt-4 border-t border-emerald-800/60">
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/30 text-xs">
            <p className="text-emerald-300 font-semibold mb-0.5">
              {currentUser.role === "admin" ? "مدير النظام (أدمين):" : "المربي المعتمد:"}
            </p>
            <p className="text-white truncate font-medium font-sans">
              {currentUser.role === "admin" ? adminProfile.username : currentUser.email}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {currentUser.role === "admin" && (
              <button
                onClick={handleResetData}
                className="w-full py-2 bg-emerald-950 hover:bg-red-950 hover:text-red-200 text-emerald-300 font-semibold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تعيين البيانات المرجعية</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-2 bg-rose-900/40 hover:bg-rose-900 text-rose-100 font-bold text-xs rounded-xl transition-all border-none flex items-center justify-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل خروج آمن</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Screen Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Dynamic Navigation Views */}
        <AnimatePresence mode="wait">
          {currentTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <FarmOverview
                farms={visibleFarms}
                cows={visibleCows}
                events={visibleEvents}
                selectedFarmId={selectedFarmId}
                setSelectedFarmId={setSelectedFarmId}
                onAddFarm={handleAddFarm}
                onNavigateToCows={() => setCurrentTab("cows")}
                announcements={announcements}
                onRegisterVisit={handleRegisterVisit}
                isBreeder={currentUser?.role === "breeder"}
              />
            </motion.div>
          )}

          {currentTab === "cows" && (
            <motion.div
              key="cows"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <CowManager
                cows={visibleCows}
                farms={visibleFarms}
                events={visibleEvents}
                selectedFarmId={selectedFarmId}
                onAddCow={handleAddCow}
                onUpdateCowStatus={handleUpdateCowStatus}
                onRecordExit={handleRecordExit}
                onAddEvent={handleAddEvent}
                onDeleteCow={handleDeleteCow}
              />
            </motion.div>
          )}

          {currentTab === "vet_chat" && (
            <motion.div
              key="vet_chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AIVetChat farms={visibleFarms} cows={visibleCows} />
            </motion.div>
          )}

          {currentTab === "admin_center" && currentUser.role === "admin" && (
            <motion.div
              key="admin_center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AdminCenter
                farms={farms}
                cows={cows}
                events={events}
                notifications={notifications}
                onMarkNotificationRead={handleMarkNotificationRead}
                adminProfile={adminProfile}
                onUpdateAdminProfile={handleUpdateAdminProfile}
                onDeleteFarm={handleDeleteFarm}
                announcements={announcements}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                isFirebaseConnected={isFirebaseConnected}
                firebaseConfig={firebaseConfigState}
                onSaveFirebaseConfig={handleSaveFirebaseConfig}
                onClearFirebaseConfig={handleClearFirebaseConfig}
                onBulkSync={handleBulkSync}
              />
            </motion.div>
          )}

          {currentTab === "visits" && (
            <motion.div
              key="visits"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <VisitsTab
                currentUser={currentUser}
                users={users}
                farms={farms}
                announcements={announcements}
                onRegisterVisit={handleRegisterVisit}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            </motion.div>
          )}

          {currentTab === "financials" && (
            <motion.div
              key="financials"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-right"
            >
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">التحليل المالي</span>
                <h2 className="text-2xl font-bold text-slate-800">التقارير والميزانية العامة للقطيع</h2>
                <p className="text-sm text-slate-500 max-w-2xl">
                  تتبع الإيرادات الناتجة عن مبيعات الأبقار وتصدير اللحوم، مقابل التكاليف التشغيلية من أدوية وعلاجات وشراء قطيع جديد.
                </p>
              </div>

              {/* Financial Dashboard Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl w-fit">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">عائدات مبيعات الأبقار</p>
                  <p className="text-3xl font-black text-emerald-700 font-mono">+{financials.salesRevenue} ل.س</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl w-fit">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">إجمالي التكاليف والمصاريف</p>
                  <p className="text-3xl font-black text-red-600 font-mono">-{financials.totalExpenses} ل.س</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <div className="p-3 bg-teal-50 text-teal-800 rounded-xl w-fit">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold font-sans">صافي الربح المالي (Net Gain)</p>
                  <p className={`text-3xl font-black font-mono ${financials.netProfit >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                    {financials.netProfit >= 0 ? '+' : ''}{financials.netProfit} ل.س
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown of expenses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-800 border-b pb-2.5">توزيع التكاليف والمصاريف</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 font-medium">تكاليف شراء رؤوس جديدة:</span>
                      <span className="font-bold text-slate-900 font-mono">{financials.purchasedCowsSum} ل.س</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 font-medium">تكاليف العلاج والأحداث واللقاحات:</span>
                      <span className="font-bold text-slate-900 font-mono">{financials.eventCostsSum} ل.س</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 font-bold text-slate-800">
                      <span>مجموع المصاريف:</span>
                      <span className="text-red-600 font-mono">{financials.totalExpenses} ل.س</span>
                    </div>
                  </div>
                </div>

                {/* Performance Analytics */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-800 border-b pb-2.5">الإنتاج والمعدلات العامة</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 font-medium">معدل إنتاج الحليب اليومي:</span>
                      <span className="font-bold text-sky-800 font-sans">
                        {Math.round(visibleCows.filter(c => c.status === 'milking').reduce((sum, c) => sum + (c.milkYield || 0), 0))} لتر/يوم
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 font-medium">الأبقار النشطة في الحلب والإنتاج:</span>
                      <span className="font-bold text-slate-900">
                        {visibleCows.filter(c => c.status === 'milking').length} رأس
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 font-bold text-slate-800">
                      <span>إجمالي الأبقار في السجلات:</span>
                      <span className="font-sans text-slate-900">{visibleCows.length} رأس شامل المؤرشف</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Firebase Sync Settings Modal */}
      {showFirebaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-emerald-900 text-white flex justify-between items-center shrink-0 text-right">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-300 animate-pulse" />
                <h3 className="font-extrabold text-lg">إعدادات الربط والمزامنة السحابية (Firebase)</h3>
              </div>
              <button
                onClick={() => {
                  setShowFirebaseModal(false);
                  setFbStatusMessage("");
                  setFbStatusType("");
                }}
                className="text-white hover:text-emerald-200 bg-emerald-850 p-1.5 rounded-xl border-none cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto text-right">
              
              {/* Status Badge */}
              <div className={`p-4 rounded-2xl flex flex-col gap-2 ${
                isFirebaseConnected 
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-100" 
                  : "bg-slate-50 text-slate-700 border border-slate-100"
              }`}>
                <div className="flex items-center gap-2">
                  {isFirebaseConnected ? (
                    <>
                      <Wifi className="w-5 h-5 text-emerald-600 animate-pulse" />
                      <span className="font-extrabold text-xs">قاعدة البيانات: متصلة بـ Firebase ✅</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-xs">قاعدة البيانات: أوفلاين (LocalStorage) 💾</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 font-light">
                  {isFirebaseConnected 
                    ? `أكبيطرة الذكية متصلة الآن بمشروع Firestore المعرّف بـ (${firebaseConfigState?.projectId}). يتم حفظ وتعديل البيانات وحالات الأبقار والقطيع في قاعدة البيانات السحابية لحظياً.`
                    : "يتم تخزين بيانات الأبقار والقطيع والمزارع حالياً داخل المتصفح فقط (LocalStorage). لربطها بقاعدة بيانات سحابية حقيقية وتأمين المزامنة، أدخل بيانات مشروع Firebase بالأسفل."
                  }
                </p>
                {isFirebaseConnected && firebaseConfigState && (
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100/50 space-y-1.5 mt-1 text-xs">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-slate-400">Project ID:</span>
                      <span className="font-bold text-emerald-950">{firebaseConfigState.projectId}</span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-slate-400">Database Status:</span>
                      <span className="font-bold text-emerald-700">CONNECTED & ACTIVE</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Connected Controls */}
              {isFirebaseConnected ? (
                <div className="space-y-3 pt-1">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">لوحة التحكم والمزامنة</h4>
                  
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={async () => {
                      setIsSyncing(true);
                      setFbStatusType("");
                      setFbStatusMessage("");
                      try {
                        await handleBulkSync();
                        setFbStatusType("success");
                        setFbStatusMessage("تمت المزامنة ورفع جميع سجلات الأبقار والمزارع المحلية إلى Firestore بنجاح! 🚀");
                      } catch (err: any) {
                        setFbStatusType("error");
                        setFbStatusMessage(`فشلت المزامنة: ${err?.message || "تأكد من إعدادات الحماية وقواعد Firestore Rules"}`);
                      } finally {
                        setIsSyncing(false);
                      }
                    }}
                    className="w-full py-3 bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl text-xs font-bold shadow transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? "جاري رفع البيانات..." : "مزامنة ورفع السجلات المحلية لـ Firestore 🚀"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("🚨 هل أنت متأكد من رغبتك في قطع الاتصال بقاعدة البيانات السحابية والعودة للتخزين المحلي؟")) {
                        handleClearFirebaseConfig();
                        setFbStatusType("success");
                        setFbStatusMessage("تم قطع الاتصال بقاعدة البيانات. تم التحول للتخزين المحلي.");
                      }
                    }}
                    className="w-full py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>قطع الاتصال والعودة للأوفلاين 🔌</span>
                  </button>
                </div>
              ) : (
                /* Connection Form */
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <FileJson className="w-3.5 h-3.5 text-slate-500" />
                      <span>الصق كود إعدادات Firebase SDK هنا:</span>
                    </label>
                    <textarea
                      rows={4}
                      value={fbJsonInput}
                      onChange={(e) => setFbJsonInput(e.target.value)}
                      placeholder={`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "myfarm-b6a8a.firebaseapp.com",
  projectId: "myfarm-b6a8a",
  ...
};`}
                      className="w-full p-3 text-[11px] rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-left font-mono leading-relaxed bg-slate-50/50"
                    />
                    <span className="text-[10px] text-slate-400 block leading-normal">
                      يمكنك نسخ هذا الكائن مباشرة من لوحة تحكم Firebase console الخاص بمشروعك ولصقه هنا وسيتم استخراج المعرّفات تلقائياً!
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfigManual(!showConfigManual)}
                      className="text-xs text-emerald-800 hover:underline font-semibold flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      {showConfigManual ? "إخفاء الحقول المنفصلة ⬆️" : "أو أدخل الإعدادات يدوياً حقل بحقل ⬇️"}
                    </button>
                  </div>

                  {showConfigManual && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-600 text-right">API Key</label>
                          <input
                            type="text"
                            value={fbApiKey}
                            onChange={(e) => setFbApiKey(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-left font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-600 text-right">Auth Domain</label>
                          <input
                            type="text"
                            value={fbAuthDomain}
                            onChange={(e) => setFbAuthDomain(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-left font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-600 text-right">Project ID</label>
                          <input
                            type="text"
                            value={fbProjectId}
                            onChange={(e) => setFbProjectId(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-left font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-600 text-right">Storage Bucket</label>
                          <input
                            type="text"
                            value={fbStorageBucket}
                            onChange={(e) => setFbStorageBucket(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-left font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-600 text-right">Messaging Sender ID</label>
                          <input
                            type="text"
                            value={fbMessagingSenderId}
                            onChange={(e) => setFbMessagingSenderId(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-left font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-600 text-right">App ID</label>
                          <input
                            type="text"
                            value={fbAppId}
                            onChange={(e) => setFbAppId(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-left font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      let configToSave: any = null;

                      if (fbJsonInput.trim()) {
                        try {
                          const cleanText = fbJsonInput
                            .replace(/const\s+firebaseConfig\s*=\s*/, "")
                            .replace(/let\s+firebaseConfig\s*=\s*/, "")
                            .replace(/var\s+firebaseConfig\s*=\s*/, "")
                            .replace(/export\s+const\s+firebaseConfig\s*=\s*/, "")
                            .replace(/;/g, "")
                            .trim();
                          
                          const parsed = new Function(`return ${cleanText}`)();
                          if (parsed && parsed.apiKey && parsed.projectId) {
                            configToSave = {
                              apiKey: parsed.apiKey,
                              authDomain: parsed.authDomain || "",
                              projectId: parsed.projectId,
                              storageBucket: parsed.storageBucket || "",
                              messagingSenderId: parsed.messagingSenderId || "",
                              appId: parsed.appId || "",
                            };
                          }
                        } catch (e) {
                          try {
                            const parsed = JSON.parse(fbJsonInput);
                            if (parsed && parsed.apiKey && parsed.projectId) {
                              configToSave = parsed;
                            }
                          } catch (err2) {
                            setFbStatusType("error");
                            setFbStatusMessage("عذراً، لم نتمكن من تحليل كود الإعدادات. يرجى مراجعته أو تعبئة الحقول يدوياً.");
                            return;
                          }
                        }
                      } else if (fbApiKey && fbProjectId) {
                        configToSave = {
                          apiKey: fbApiKey,
                          authDomain: fbAuthDomain,
                          projectId: fbProjectId,
                          storageBucket: fbStorageBucket,
                          messagingSenderId: fbMessagingSenderId,
                          appId: fbAppId,
                        };
                      }

                      if (configToSave) {
                        handleSaveFirebaseConfig(configToSave);
                        setFbStatusType("success");
                        setFbStatusMessage("تم حفظ إعدادات Firebase والاتصال بقاعدة البيانات بنجاح! ⚡");
                        setFbJsonInput("");
                      } else {
                        setFbStatusType("error");
                        setFbStatusMessage("يرجى تعبئة الحقول الأساسية (API Key & Project ID) لتفعيل الربط.");
                      }
                    }}
                    className="w-full py-3 bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl text-xs font-bold shadow transition-all border-none cursor-pointer"
                  >
                    تفعيل وحفظ إعدادات الاتصال السحابي ⚡
                  </button>
                </div>
              )}

              {/* Status Banner */}
              {fbStatusMessage && (
                <div className={`p-3.5 rounded-xl text-xs leading-normal font-medium ${
                  fbStatusType === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                    : "bg-rose-50 text-rose-800 border border-rose-100"
                }`}>
                  {fbStatusMessage}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => {
                  setShowFirebaseModal(false);
                  setFbStatusMessage("");
                  setFbStatusType("");
                }}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
