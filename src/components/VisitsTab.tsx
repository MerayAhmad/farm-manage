import React, { useState } from "react";
import { Farm, UserAccount, VisitAnnouncement } from "../types";
import { SYRIA_GOVERNORATES, SYRIA_REGIONS } from "../syriaData";
import { 
  Calendar, MapPin, Sparkles, CheckCircle, Trash2, Plus, Phone, Map, 
  User, IdCard, Info, AlertTriangle, Send, Shield, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VisitsTabProps {
  currentUser: UserAccount;
  users: UserAccount[];
  farms: Farm[];
  announcements: VisitAnnouncement[];
  onRegisterVisit: (announcementId: string, farmId: string) => void;
  onAddAnnouncement: (ann: Omit<VisitAnnouncement, "id" | "createdAt" | "registrations">) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export default function VisitsTab({
  currentUser,
  users,
  farms,
  announcements,
  onRegisterVisit,
  onAddAnnouncement,
  onDeleteAnnouncement
}: VisitsTabProps) {
  const isAdmin = currentUser.role === "admin";
  
  // Breeder's selected farm if breeder
  const breederFarm = farms.find(f => f.id === currentUser.farmId);

  // Admin form states
  const [title, setTitle] = useState("");
  const [governorate, setGovernorate] = useState("دمشق");
  const [district, setDistrict] = useState("الميدان");
  const [visitDate, setVisitDate] = useState("");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Admin selected announcement for viewing details
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !visitDate || !governorate || !district || !description) return;

    onAddAnnouncement({
      title,
      governorate,
      district,
      visitDate,
      description
    });

    // Reset Form
    setTitle("");
    setVisitDate("");
    setDescription("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Badge */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-700/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-emerald-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-500">
              حملات ميدانية معتمدة 🇸🇾
            </span>
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
              تحديث فوري
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">إدارة الزيارات الميدانية والحملات الوطنية</h2>
          <p className="text-xs text-emerald-200/90 max-w-2xl font-light leading-relaxed">
            {isAdmin 
              ? "بوابة المشرفين لإعلان وتخطيط الحملات البيطرية، اللقاحات الدورية، وتتبع حضور المربين ببياناتهم التفصيلية الموثقة."
              : "بوابة المربين لتلقي إعلانات الزيارات الطبية والميدانية واللقاحات الحكومية، مع إمكانية تسجيل حضور مزرعتك بكبسة زر."}
          </p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 relative z-10 shrink-0">
          <Calendar className="w-8 h-8 text-amber-300 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RIGHT COLUMN: Admin Controls OR Breeder Details Profile Summary (Spans 5 on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {isAdmin ? (
            /* Admin - Add New Visit Campaign Form */
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-800 border-b pb-3.5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-800" />
                <span>إعلان حملة / زيارة ميدانية جديدة</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500">عنوان الحملة أو الزيارة الميدانية</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حملة التلقيح الوطني ضد الحمى القلاعية"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-right font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500">المحافظة المستهدفة</label>
                    <select
                      value={governorate}
                      onChange={(e) => {
                        const selectedGov = e.target.value;
                        setGovernorate(selectedGov);
                        setDistrict(SYRIA_REGIONS[selectedGov][0]);
                      }}
                      className="w-full p-3 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-emerald-500 text-right"
                    >
                      {SYRIA_GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500">المنطقة المستهدفة</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-emerald-500 text-right"
                    >
                      {(SYRIA_REGIONS[governorate] || []).map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500">تاريخ الزيارة الميدانية</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-right font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500">التوجيهات والتفاصيل للمربين</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="يرجى كتابة تعليمات واضحة للمربين، مثال: تجهيز الأبقار في الساحة الرئيسية للمزرعة وإحضار دفاتر التحصين بدءاً من الساعة 8 صباحاً..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-right resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 text-white hover:bg-emerald-950 rounded-xl text-xs font-extrabold shadow-md transition-all border-none flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>نشر الإعلان وإشعار المربين فورا</span>
                </button>
              </form>

              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تم نشر حملة الزيارة الميدانية بنجاح وسيتم تنبيه المربين في {governorate}!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Breeder - Personal details reference for visits (Required fields summary) */
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-800 border-b pb-3.5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-800" />
                <span>بيانات المربي المعتمدة للزيارات</span>
              </h3>
              
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                تُعرض هذه التفاصيل تلقائياً للجان الميدانية البيطرية (الأدمين) عند تسجيل حضورك في أي زيارة، لتسهيل التواصل والوصول المباشر لمزرعتك.
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">اسم المربي:</span>
                  <span className="text-xs text-slate-800 font-extrabold flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    {currentUser.username || "غير مسجل"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">البريد الإلكتروني الموثق:</span>
                  <span className="text-xs text-slate-700 font-mono flex items-center gap-1.5 justify-end">
                    {currentUser.email}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">رقم الهاتف الجوال:</span>
                  <span className="text-xs text-emerald-900 font-bold font-mono flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                    {currentUser.phone || "⚠️ غير متوفر"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">الرقم الوطني السوري / الهوية الشخصية:</span>
                  <span className="text-xs text-slate-800 font-bold font-mono flex items-center gap-1.5">
                    <IdCard className="w-4 h-4 text-slate-500 shrink-0" />
                    {currentUser.nationalId || "⚠️ غير متوفر"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">العنوان السكني والتفصيلي المسجل:</span>
                  <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    {currentUser.address || "⚠️ غير متوفر"}
                  </span>
                </div>
              </div>

              {breederFarm && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
                  <span className="text-[10px] text-emerald-800 font-extrabold block">موقع المزرعة الجغرافي الحالي:</span>
                  <p className="text-xs text-emerald-950 font-bold flex items-center gap-1">
                    📍 {breederFarm.governorate} • {breederFarm.district}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    ستظهر لك فقط الحملات والزيارات الموجهة لهذه المحافظة وهذه المنطقة حصراً.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LEFT COLUMN: Active Announcements List & Registered Breeders List (Spans 7 on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3.5">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-800" />
                <span>حملات وزيارات الحقول الجارية ({announcements.length})</span>
              </h3>
              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">🇸🇾 سوريا</span>
            </div>

            {announcements.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-400 italic">لا توجد حملات معلنة حالياً في هذا القسم.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => {
                  const isRegistered = !isAdmin && breederFarm && ann.registrations?.includes(breederFarm.id);
                  const isMatchingLocation = !isAdmin && breederFarm && 
                    ann.governorate === breederFarm.governorate && 
                    ann.district === breederFarm.district;

                  return (
                    <div 
                      key={ann.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        isRegistered 
                          ? "bg-emerald-50/20 border-emerald-200 shadow-sm" 
                          : "bg-white border-slate-100 hover:border-slate-200 shadow-xs"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                              حملة معتمدة ✓
                            </span>
                            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50/50 px-2 py-0.5 rounded-md">
                              📍 محافظة {ann.governorate} • منطقة {ann.district}
                            </span>
                          </div>
                          
                          <h4 className="font-extrabold text-slate-800 text-sm md:text-base pt-1">{ann.title}</h4>
                          <p className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1 pt-0.5">
                            📅 تاريخ الحملة الميدانية: {ann.visitDate}
                          </p>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => onDeleteAnnouncement(ann.id)}
                            className="text-slate-400 hover:text-rose-600 p-2 rounded-xl transition-all border-none bg-slate-50 hover:bg-rose-50"
                            title="إلغاء وحذف الإعلان"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 font-light leading-relaxed mt-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        {ann.description}
                      </p>

                      <div className="mt-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 pt-3 border-t border-slate-100/80">
                        
                        {/* Left Side: Registration actions or details trigger */}
                        <div className="flex items-center gap-2">
                          {isAdmin ? (
                            <button
                              onClick={() => setSelectedAnnId(selectedAnnId === ann.id ? null : ann.id)}
                              className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 border-none bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-all"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>{selectedAnnId === ann.id ? "إخفاء المسجلين" : `عرض المربين المسجلين (${ann.registrations?.length || 0})`}</span>
                            </button>
                          ) : (
                            /* Breeder Status badges */
                            isRegistered ? (
                              <div className="bg-emerald-100/80 text-emerald-950 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>مزرعتك مسجلة للحضور ✓</span>
                              </div>
                            ) : isMatchingLocation ? (
                              <div className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                                <span>الحملة متوفرة في منطقتك! سجل الآن.</span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                حملة خارج نطاق منطقتك الجغرافية
                              </div>
                            )
                          )}
                        </div>

                        {/* Right Side: Action Button for Breeder */}
                        {!isAdmin && breederFarm && isMatchingLocation && (
                          <button
                            onClick={() => onRegisterVisit(ann.id, breederFarm.id)}
                            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all border-none shadow-sm flex items-center justify-center gap-1.5 ${
                              isRegistered
                                ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                : "bg-emerald-800 text-white hover:bg-emerald-950"
                            }`}
                          >
                            {isRegistered ? (
                              <>
                                <span>إلغاء التسجيل</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                                <span>تسجيل حضور مزرعتي</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Admin View: Expanded Registered Breeders list with complete details */}
                      {isAdmin && selectedAnnId === ann.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-emerald-100 space-y-3 overflow-hidden"
                        >
                          <h5 className="font-extrabold text-xs text-slate-700 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-emerald-800" />
                            <span>المربين والمزارع المسجلين في هذه الزيارة الميدانية:</span>
                          </h5>

                          {!ann.registrations || ann.registrations.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic bg-slate-50 p-3 rounded-lg text-center">لا يوجد مربون مسجلون في هذه الحملة الميدانية حتى الآن.</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                              {ann.registrations.map((farmId) => {
                                const farm = farms.find(f => f.id === farmId);
                                const breederAccount = farm ? users.find(u => u.email.trim().toLowerCase() === farm.ownerEmail?.trim().toLowerCase()) : null;

                                return (
                                  <div key={farmId} className="p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-xl space-y-2 text-xs">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                      <div>
                                        <h6 className="font-extrabold text-emerald-950 text-xs">👨‍🌾 المربي: {farm?.ownerName || "غير معروف"} ({farm?.ownerEmail})</h6>
                                        <p className="text-[11px] text-slate-500 font-bold">🏡 المزرعة: {farm?.name || "مزرعة مجهولة"}</p>
                                      </div>
                                      <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full font-mono">
                                        📍 {farm?.governorate} • {farm?.district}
                                      </span>
                                    </div>

                                    {/* Breeder detailed credentials requested by user */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100/50 text-[11px]">
                                      <div className="space-y-0.5">
                                        <span className="text-[9px] text-slate-400 font-extrabold block">📞 رقم هاتف التواصل:</span>
                                        <span className="text-slate-800 font-extrabold font-mono flex items-center gap-1 text-emerald-800">
                                          <Phone className="w-3 h-3" />
                                          {breederAccount?.phone || "غير مسجل"}
                                        </span>
                                      </div>

                                      <div className="space-y-0.5">
                                        <span className="text-[9px] text-slate-400 font-extrabold block">🪪 الرقم الوطني السوري:</span>
                                        <span className="text-slate-800 font-extrabold font-mono flex items-center gap-1">
                                          <IdCard className="w-3 h-3" />
                                          {breederAccount?.nationalId || "غير مسجل"}
                                        </span>
                                      </div>

                                      <div className="col-span-1 md:col-span-2 space-y-0.5 pt-1 border-t border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-extrabold block">📍 عنوان السكن / العمل التفصيلي:</span>
                                        <span className="text-slate-700 font-semibold flex items-center gap-1">
                                          <MapPin className="w-3 h-3 text-slate-400" />
                                          {breederAccount?.address || "غير مسجل"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
