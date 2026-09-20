import React, { useState } from "react";
import { Farm, Cow, CattleEvent, RegistrationNotification, VisitAnnouncement } from "../types";
import { SYRIA_GOVERNORATES, SYRIA_REGIONS } from "../syriaData";
import { 
  Building2, Users, Stethoscope, AlertTriangle, Bell, UserCheck, ShieldAlert,
  Eye, EyeOff, Lock, User, CheckCircle, Trash2, Calendar, MapPin, ClipboardList, RefreshCw, Sparkles, Send,
  Database, Cloud, Key, Wifi, WifiOff, FileJson
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface AdminCenterProps {
  farms: Farm[];
  cows: Cow[];
  events: CattleEvent[];
  notifications: RegistrationNotification[];
  onMarkNotificationRead: (id: string) => void;
  adminProfile: { username: string; email: string; password?: string };
  onUpdateAdminProfile: (username: string, password?: string) => void;
  onDeleteFarm: (farmId: string) => void;
  announcements: VisitAnnouncement[];
  onAddAnnouncement: (announcement: Omit<VisitAnnouncement, "id" | "createdAt" | "registrations">) => void;
  onDeleteAnnouncement: (id: string) => void;
  isFirebaseConnected?: boolean;
  firebaseConfig?: FirebaseConfig | null;
  onSaveFirebaseConfig?: (config: FirebaseConfig) => void;
  onClearFirebaseConfig?: () => void;
  onBulkSync?: () => Promise<void>;
}

export default function AdminCenter({
  farms,
  cows,
  events,
  notifications,
  onMarkNotificationRead,
  adminProfile,
  onUpdateAdminProfile,
  onDeleteFarm,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
  isFirebaseConnected = false,
  firebaseConfig = null,
  onSaveFirebaseConfig,
  onClearFirebaseConfig,
  onBulkSync,
}: AdminCenterProps) {
  // Toggle states for visible farms
  const [expandedFarms, setExpandedFarms] = useState<Record<string, boolean>>({});

  // Profile Edit fields
  const [username, setUsername] = useState(adminProfile.username);
  const [password, setPassword] = useState(adminProfile.password || "admin");
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  // Firebase configuration form states
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig?.apiKey || "");
  const [fbAuthDomain, setFbAuthDomain] = useState(firebaseConfig?.authDomain || "");
  const [fbProjectId, setFbProjectId] = useState(firebaseConfig?.projectId || "");
  const [fbStorageBucket, setFbStorageBucket] = useState(firebaseConfig?.storageBucket || "");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || "");
  const [fbAppId, setFbAppId] = useState(firebaseConfig?.appId || "");
  const [fbJsonInput, setFbJsonInput] = useState("");
  const [fbStatusMessage, setFbStatusMessage] = useState("");
  const [fbStatusType, setFbStatusType] = useState<"success" | "error" | "">("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfigManual, setShowConfigManual] = useState(false);

  const toggleFarmVisibility = (farmId: string) => {
    setExpandedFarms(prev => ({
      ...prev,
      [farmId]: !prev[farmId]
    }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminProfile(username, password);
    setShowProfileSuccess(true);
    setTimeout(() => {
      setShowProfileSuccess(false);
    }, 4000);
  };

  // Visit announcement form states
  const [annTitle, setAnnTitle] = useState("");
  const [annVisitDate, setAnnVisitDate] = useState("");
  const [annGov, setAnnGov] = useState("حمص");
  const [annDist, setAnnDist] = useState("الرستن");
  const [annDesc, setAnnDesc] = useState("");
  const [showAnnSuccess, setShowAnnSuccess] = useState(false);

  const handleAnnounceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annVisitDate || !annGov || !annDist || !annDesc) return;
    onAddAnnouncement({
      title: annTitle,
      visitDate: annVisitDate,
      governorate: annGov,
      district: annDist,
      description: annDesc,
    });
    setAnnTitle("");
    setAnnVisitDate("");
    setAnnDesc("");
    setShowAnnSuccess(true);
    setTimeout(() => {
      setShowAnnSuccess(false);
    }, 4000);
  };

  // Get all emergency events across all farms
  const criticalEvents = events.filter(e => e.type === "emergency" || e.severity === "critical");

  return (
    <div className="space-y-8 text-right" dir="rtl" id="admin-center-root">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
        <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">بوابة الإشراف الفني</span>
        <h2 className="text-2xl font-black text-slate-800">إدارة النظام ومتابعة المزارع المشتركة</h2>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          هنا تكمن صلاحيات مدير النظام لمراقبة المزارع المسجلة في الجمهورية العربية السورية، مراجعة الحالات الطارئة للقطيع، استقبال إشعارات التسجيل، وتحديث بيانات الاعتماد.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RIGHT & MIDDLE SIDES: Farms Directory with Expandable Cows/Health Files */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-800" />
              <span>دليل مزارع المربين المسجلة ({farms.length})</span>
            </h3>
            <span className="text-xs text-slate-400">انقر على زر العرض لرؤية السجلات المرضية والقطيع</span>
          </div>

          <div className="space-y-4">
            {farms.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border">
                لم يتم تسجيل أي مزارع في النظام بعد.
              </div>
            ) : (
              farms.map((farm) => {
                const isExpanded = !!expandedFarms[farm.id];
                const farmCows = cows.filter(c => c.farmId === farm.id);
                const activeCows = farmCows.filter(c => c.status !== "sold" && c.status !== "deceased");
                const farmEvents = events.filter(e => e.farmId === farm.id);
                // Health/Emergency events
                const farmMedicalLogs = farmEvents.filter(e => ["treatment", "vaccination", "emergency"].includes(e.type));

                return (
                  <div key={farm.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                    {/* Farm Header Information */}
                    <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-lg text-slate-800">{farm.name}</h4>
                          {farm.governorate && (
                            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                              🇸🇾 {farm.governorate} • {farm.district}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500 font-medium">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{farm.location}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>المربي: <span className="text-slate-800 font-bold">{farm.ownerName || "مربي تجريبي"}</span> ({farm.ownerEmail || "لا يوجد بريد"})</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>القطيع النشط الحالي: <span className="text-slate-800 font-bold">{activeCows.length} رأس</span> / طاقة استيعابية: {farm.capacity}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>تاريخ الانضمام: {farm.createdAt}</span>
                          </p>
                        </div>
                      </div>

                      {/* Display / Hide Toggle & Action Buttons */}
                      <div className="flex gap-2 self-stretch sm:self-auto w-full sm:w-auto">
                        <button
                          onClick={() => toggleFarmVisibility(farm.id)}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            isExpanded 
                              ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-800" 
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-100"
                          }`}
                        >
                          {isExpanded ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span>إخفاء السجلات</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>عرض السجلات الفنية ({farmCows.length})</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm(`🚨 تحذير: هل أنت متأكد من رغبتك في استبعاد وحذف ${farm.name} مع جميع السجلات والأبقار المرتبطة بها نهائياً؟`)) {
                              onDeleteFarm(farm.id);
                            }
                          }}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none"
                          title="حذف المزرعة نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Hidden Area: Organized Cows & Health Files */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 bg-slate-50/20"
                        >
                          <div className="p-6 space-y-6">
                            
                            {/* Section A: Cows List grouped inside */}
                            <div className="space-y-3">
                              <h5 className="font-extrabold text-xs text-slate-400 tracking-wider uppercase">📋 قائمة الأبقار المسجلة لدى المزرعة ({farmCows.length})</h5>
                              {farmCows.length === 0 ? (
                                <p className="text-xs text-slate-400 italic bg-white p-3.5 rounded-xl border">لا توجد أبقار مقيدة في سجلات هذه المزرعة حالياً.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {farmCows.map((cow) => (
                                    <div key={cow.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex justify-between items-center gap-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-bold text-slate-800">{cow.name || "بقرة بدون اسم"}</span>
                                          <span className="text-[10px] font-mono text-slate-400">({cow.id})</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5">السلالة: {cow.breed} • الحالة: {cow.status}</p>
                                      </div>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        cow.healthStatus === "excellent" ? "bg-emerald-50 text-emerald-800 border" :
                                        cow.healthStatus === "stable" ? "bg-blue-50 text-blue-800 border" :
                                        cow.healthStatus === "under_treatment" ? "bg-amber-50 text-amber-800 border" : "bg-rose-50 text-rose-800 border"
                                      }`}>
                                        {cow.healthStatus}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Section B: Medical and Clinical Records */}
                            <div className="space-y-3 pt-2">
                              <h5 className="font-extrabold text-xs text-slate-400 tracking-wider uppercase">🩺 السجلات الطبية والملفات المرضية المنظمة</h5>
                              {farmMedicalLogs.length === 0 ? (
                                <p className="text-xs text-slate-400 italic bg-white p-3.5 rounded-xl border">السجل الصحي نظيف تماماً من الأمراض والأعراض الطارئة.</p>
                              ) : (
                                <div className="space-y-3">
                                  {farmMedicalLogs.map((evt) => {
                                    const matchingCow = farmCows.find(c => c.id === evt.cowId);
                                    return (
                                      <div key={evt.id} className={`p-4 rounded-xl border text-right space-y-2 ${
                                        evt.type === 'emergency' ? 'bg-rose-50/50 border-rose-100' : 'bg-white border-slate-100'
                                      }`}>
                                        <div className="flex justify-between items-center text-[10px]">
                                          <div className="flex items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                              evt.type === 'emergency' ? 'bg-rose-100 text-rose-900' :
                                              evt.type === 'vaccination' ? 'bg-sky-100 text-sky-900' : 'bg-amber-100 text-amber-900'
                                            }`}>
                                              {evt.type === 'emergency' ? '🚨 حالة طارئة' : evt.type === 'vaccination' ? '💉 تلقيح' : '🩺 علاج مستمر'}
                                            </span>
                                            <span className="font-bold text-slate-800">{matchingCow?.name || "بقرة"} ({evt.cowId})</span>
                                          </div>
                                          <span className="font-mono text-slate-400">{evt.date}</span>
                                        </div>
                                        <h6 className="font-bold text-xs text-slate-800">{evt.title}</h6>
                                        <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                                        
                                        {evt.notes && (
                                          <p className="text-slate-500 text-[10px] bg-slate-50 p-1.5 rounded border italic">ملاحظة: "{evt.notes}"</p>
                                        )}
                                        <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1.5 border-t border-slate-100">
                                          <span>المسجل: {evt.recordedBy}</span>
                                          {evt.cost && <span className="font-mono text-slate-500 font-bold">التكلفة: {evt.cost} ل.س</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LEFT COLUMN: Firebase Integration, Admin Settings Profile, Emergency Events & Notifications */}
        <div className="space-y-6">

          {/* Firebase Database Connection Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2.5 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-800" />
              <span>ربط ومزامنة Firebase Firestore</span>
            </h3>

            {/* Connection Status Badge */}
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
              <p className="text-[10.5px] leading-relaxed text-slate-500 font-light">
                {isFirebaseConnected 
                  ? `أكبيطرة الذكية متصلة الآن بمشروع Firestore المعرّف بـ (${firebaseConfig?.projectId}). يتم حفظ وتعديل البيانات وحالات الأبقار والقطيع في قاعدة البيانات السحابية لحظياً.`
                  : "يتم تخزين بيانات الأبقار والقطيع والمزارع حالياً داخل المتصفح فقط. لربطها بقاعدة بيانات سحابية حقيقية وتأمين المزامنة، أدخل بيانات مشروع Firebase بالأسفل."
                }
              </p>
              {isFirebaseConnected && firebaseConfig && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100/50 space-y-1 mt-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">Project ID:</span>
                    <span className="font-bold text-emerald-950">{firebaseConfig.projectId}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-emerald-700">ACTIVE & READY</span>
                  </div>
                </div>
              )}
            </div>

            {/* Configured / Connected Controls */}
            {isFirebaseConnected ? (
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={async () => {
                    setIsSyncing(true);
                    setFbStatusType("");
                    setFbStatusMessage("");
                    try {
                      if (onBulkSync) {
                        await onBulkSync();
                        setFbStatusType("success");
                        setFbStatusMessage("تمت المزامنة ورفع جميع سجلات الأبقار والمزارع المحلية إلى Firestore بنجاح! 🚀");
                      }
                    } catch (err: any) {
                      setFbStatusType("error");
                      setFbStatusMessage(`فشلت المزامنة: ${err?.message || "تأكد من إعدادات الحماية وقواعد Firestore Rules"}`);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  className="w-full py-2.5 bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl text-xs font-bold shadow transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? "جاري رفع البيانات..." : "مزامنة ورفع السجلات المحلية لـ Firestore 🚀"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm("🚨 هل أنت متأكد من رغبتك في قطع الاتصال بقاعدة البيانات السحابية والعودة للتخزين المحلي؟")) {
                      onClearFirebaseConfig?.();
                      setFbStatusType("success");
                      setFbStatusMessage("تم قطع الاتصال بقاعدة البيانات. تم التحول للتخزين المحلي.");
                    }
                  }}
                  className="w-full py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>قطع الاتصال والعودة للأوفلاين 🔌</span>
                </button>
              </div>
            ) : (
              // Connection Form (pasting config or manual fields)
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
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
                    className="w-full p-2.5 text-[10.5px] rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-left font-mono leading-relaxed"
                  />
                  <span className="text-[9.5px] text-slate-400 block leading-normal">
                    يمكنك نسخ هذا الكائن مباشرة من لوحة تحكم Firebase console الخاص بمشروعك (إعدادات المشروع ⚙️) ولصقه هنا وسيتم استخراج المعرّفات تلقائياً!
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
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2.5 border-t border-slate-100 pt-2"
                  >
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-slate-500">API Key</label>
                      <input
                        type="text"
                        value={fbApiKey}
                        onChange={(e) => setFbApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-left font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-slate-500">Project ID</label>
                      <input
                        type="text"
                        value={fbProjectId}
                        onChange={(e) => setFbProjectId(e.target.value)}
                        placeholder="myfarm-b6a8a"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-left font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-slate-500">Auth Domain</label>
                      <input
                        type="text"
                        value={fbAuthDomain}
                        onChange={(e) => setFbAuthDomain(e.target.value)}
                        placeholder="myfarm-b6a8a.firebaseapp.com"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-left font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-slate-500">App ID</label>
                      <input
                        type="text"
                        value={fbAppId}
                        onChange={(e) => setFbAppId(e.target.value)}
                        placeholder="1:12345678:web:abcdef..."
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-left font-mono"
                      />
                    </div>
                  </motion.div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (fbJsonInput.trim()) {
                      // Parse JS Object
                      try {
                        let jsonString = fbJsonInput.trim();
                        if (jsonString.includes("firebaseConfig =")) {
                          jsonString = jsonString.split("firebaseConfig =")[1];
                        }
                        if (jsonString.endsWith(";")) {
                          jsonString = jsonString.slice(0, -1);
                        }
                        
                        const extractKey = (key: string) => {
                          const regex = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`);
                          const match = jsonString.match(regex);
                          return match ? match[1] : "";
                        };

                        const extracted: FirebaseConfig = {
                          apiKey: extractKey("apiKey"),
                          authDomain: extractKey("authDomain"),
                          projectId: extractKey("projectId"),
                          storageBucket: extractKey("storageBucket"),
                          messagingSenderId: extractKey("messagingSenderId"),
                          appId: extractKey("appId"),
                        };

                        if (!extracted.apiKey || !extracted.projectId) {
                          // Try normal JSON parse
                          const parsed = JSON.parse(jsonString);
                          extracted.apiKey = parsed.apiKey || "";
                          extracted.authDomain = parsed.authDomain || "";
                          extracted.projectId = parsed.projectId || "";
                          extracted.storageBucket = parsed.storageBucket || "";
                          extracted.messagingSenderId = parsed.messagingSenderId || "";
                          extracted.appId = parsed.appId || "";
                        }

                        if (extracted.apiKey && extracted.projectId) {
                          onSaveFirebaseConfig?.(extracted);
                          setFbApiKey(extracted.apiKey);
                          setFbAuthDomain(extracted.authDomain || "");
                          setFbProjectId(extracted.projectId);
                          setFbStorageBucket(extracted.storageBucket || "");
                          setFbMessagingSenderId(extracted.messagingSenderId || "");
                          setFbAppId(extracted.appId || "");
                          
                          setFbStatusType("success");
                          setFbStatusMessage("تم تفعيل الاتصال بـ Firebase Firestore بنجاح! 🎉");
                          setFbJsonInput("");
                        } else {
                          setFbStatusType("error");
                          setFbStatusMessage("عذراً، لم نتمكن من استخراج قيم apiKey و projectId. يرجى ملء الحقول يدوياً.");
                        }
                      } catch (err) {
                        setFbStatusType("error");
                        setFbStatusMessage("خطأ في تحليل النص الملصق. تأكد من تضمنه لـ apiKey و projectId.");
                      }
                    } else {
                      // Manual inputs
                      if (!fbApiKey || !fbProjectId) {
                        setFbStatusType("error");
                        setFbStatusMessage("يرجى ملء الحقول المطلوبة (مفتاح API ومعرف المشروع).");
                        return;
                      }
                      const config: FirebaseConfig = {
                        apiKey: fbApiKey,
                        authDomain: fbAuthDomain,
                        projectId: fbProjectId,
                        storageBucket: fbStorageBucket,
                        messagingSenderId: fbMessagingSenderId,
                        appId: fbAppId
                      };
                      onSaveFirebaseConfig?.(config);
                      setFbStatusType("success");
                      setFbStatusMessage("تم حفظ إعدادات Firebase والاتصال بنجاح! 🎉");
                    }
                  }}
                  className="w-full py-2.5 bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl text-xs font-bold shadow transition-all border-none flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>تفعيل ربط قاعدة البيانات 🔐</span>
                </button>
              </div>
            )}

            {/* Feedback Message */}
            <AnimatePresence>
              {fbStatusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className={`p-3 rounded-xl text-xs font-bold border ${
                    fbStatusType === "success" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                      : "bg-rose-50 text-rose-800 border-rose-100"
                  }`}
                >
                  {fbStatusType === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 inline-block ml-1.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 inline-block ml-1.5" />
                  )}
                  <span>{fbStatusMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Profile Details Settings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2.5 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-800" />
              <span>إعدادات حساب المسؤول</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">البريد الإلكتروني للتحكم</label>
                <input
                  type="email"
                  disabled
                  value={adminProfile.email}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400 text-left font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">اسم المستخدم (أدمين)</label>
                <div className="relative">
                  <User className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pr-9 pl-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-right font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-9 pl-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-right font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-800 text-white hover:bg-teal-900 rounded-xl text-xs font-bold shadow transition-all border-none"
              >
                حفظ التعديلات والحساب
              </button>
            </form>

            <AnimatePresence>
              {showProfileSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-center gap-1.5 p-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-100 mt-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم تحديث اسم المستخدم والرمز بنجاح!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          {/* Registration Notifications alerts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2.5 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600 animate-pulse" />
              <span>إشعارات تسجيل المربين الجدد ({notifications.filter(n => !n.read).length})</span>
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">لا توجد إشعارات حالية.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    notif.read ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-amber-50/50 text-slate-800 border-amber-100'
                  }`}>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-amber-800">مربي جديد 🇸🇾</span>
                      <span className="text-slate-400 font-mono">{notif.date}</span>
                    </div>
                    <p className="leading-relaxed">
                      قام المربي <span className="font-extrabold">{notif.email}</span> بإضافة مزرعته الجديدة <span className="font-extrabold text-emerald-800">"{notif.farmName}"</span> في محافظة <span className="font-semibold">{notif.governorate}</span> - منطقة <span className="font-semibold">{notif.district}</span>.
                    </p>
                    {!notif.read && (
                      <button
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className="w-full mt-1.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] rounded border border-slate-200 transition-colors"
                      >
                        تعليم كمقروء
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Critical emergency cases list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2.5 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>الحالات المرضية والطارئة الحالية ({criticalEvents.length})</span>
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {criticalEvents.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">لا توجد حالات طارئة أو حرجة حالية.</p>
              ) : (
                criticalEvents.map((evt) => {
                  const targetCow = cows.find(c => c.id === evt.cowId);
                  const targetFarm = farms.find(f => f.id === evt.farmId);
                  return (
                    <div key={evt.id} className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          طوارئ بيطرية
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{evt.date}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800">{evt.title}</h4>
                      <p className="text-[11px] text-slate-600 leading-normal line-clamp-2">{evt.description}</p>
                      
                      <div className="pt-1.5 mt-1.5 border-t border-rose-100/50 flex justify-between items-center text-[9px] text-slate-500 font-medium">
                        <span>البقرة: <span className="font-bold text-emerald-800">{targetCow?.name || evt.cowId}</span></span>
                        <span>المزرعة: <span className="font-bold text-slate-700">{targetFarm?.name || "غير معروفة"}</span></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
