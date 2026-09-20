import React, { useState } from "react";
import { Farm, Cow, CattleEvent, FarmStats, VisitAnnouncement } from "../types";
import { Building2, MapPin, Users, Milk, Activity, ShieldAlert, Plus, HelpCircle, ArrowRightLeft, HeartPulse, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SYRIA_REGIONS, SYRIA_GOVERNORATES } from "../syriaData";

interface FarmOverviewProps {
  farms: Farm[];
  cows: Cow[];
  events: CattleEvent[];
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  onAddFarm: (farm: {
    name: string;
    location: string;
    capacity: number;
    notes?: string;
    governorate?: string;
    district?: string;
    ownerEmail?: string;
    ownerName?: string;
  }) => void;
  onNavigateToCows: () => void;
  announcements?: VisitAnnouncement[];
  onRegisterVisit?: (announcementId: string, farmId: string) => void;
  isBreeder?: boolean;
}

export default function FarmOverview({
  farms,
  cows,
  events,
  selectedFarmId,
  setSelectedFarmId,
  onAddFarm,
  onNavigateToCows,
  announcements,
  onRegisterVisit,
  isBreeder,
}: FarmOverviewProps) {
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmCapacity, setNewFarmCapacity] = useState(100);
  const [newFarmNotes, setNewFarmNotes] = useState("");
  const [newFarmGov, setNewFarmGov] = useState("دمشق");
  const [newFarmDist, setNewFarmDist] = useState("الميدان");

  // Calculate stats for the selected farm (or all if selectedFarmId is 'all')
  const getStats = (): FarmStats => {
    const filteredCows = selectedFarmId === "all" 
      ? cows 
      : cows.filter(c => c.farmId === selectedFarmId);

    const activeCows = filteredCows.filter(c => c.status !== 'sold' && c.status !== 'deceased');

    const filteredEvents = selectedFarmId === "all"
      ? events
      : events.filter(e => e.farmId === selectedFarmId);

    const milking = activeCows.filter(c => c.status === "milking").length;
    const pregnant = activeCows.filter(c => c.status === "pregnant").length;
    const sick = activeCows.filter(c => c.status === "sick").length;
    const sold = filteredCows.filter(c => c.status === "sold").length;
    const deceased = filteredCows.filter(c => c.status === "deceased").length;

    const totalMilk = activeCows.reduce((sum, c) => sum + (c.milkYield || 0), 0);
    const avgWeight = activeCows.length > 0 
      ? Math.round(activeCows.reduce((sum, c) => sum + c.weight, 0) / activeCows.length)
      : 0;

    // Emergencies in the last month
    const emergencies = filteredEvents.filter(e => e.type === "emergency").length;

    return {
      totalCows: activeCows.length,
      milkingCows: milking,
      pregnantCows: pregnant,
      sickCows: sick,
      soldCows: sold,
      deceasedCows: deceased,
      totalMilkToday: totalMilk,
      averageWeight: avgWeight,
      emergenciesCount: emergencies,
    };
  };

  const stats = getStats();

  const handleAddFarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName) return;
    const finalLocation = `سوريا، محافظة ${newFarmGov} - منطقة ${newFarmDist}`;
    onAddFarm({
      name: newFarmName,
      location: finalLocation,
      capacity: Number(newFarmCapacity),
      notes: newFarmNotes,
      governorate: newFarmGov,
      district: newFarmDist,
    });
    // Reset
    setNewFarmName("");
    setNewFarmCapacity(100);
    setNewFarmNotes("");
    setNewFarmGov("دمشق");
    setNewFarmDist(SYRIA_REGIONS["دمشق"][0]);
    setShowAddFarm(false);
  };

  // Breed analysis
  const activeCowsForBreed = selectedFarmId === "all" 
    ? cows.filter(c => c.status !== 'sold' && c.status !== 'deceased')
    : cows.filter(c => c.farmId === selectedFarmId && c.status !== 'sold' && c.status !== 'deceased');

  const breedCounts = activeCowsForBreed.reduce((acc: { [key: string]: number }, cow) => {
    const breed = cow.breed.split(" -")[0]; // Clean up Arabic/English names
    acc[breed] = (acc[breed] || 0) + 1;
    return acc;
  }, {});

  const totalActiveCows = activeCowsForBreed.length;

  // Emergency Events List (Recent 4)
  const recentEmergencies = events
    .filter(e => e.type === "emergency" && (selectedFarmId === "all" || e.farmId === selectedFarmId))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return (
    <div className="space-y-8" id="farm-overview-root">
      {/* Top Banner with Stats Quickview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-l from-emerald-800 to-teal-700 text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <span className="bg-emerald-600/50 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
            لوحة الإدارة والمتابعة
          </span>
          <h1 className="text-3xl font-bold tracking-tight">أهلاً بك في منصة أكبيطرة الذكية 👋</h1>
          <p className="text-emerald-100 max-w-2xl text-sm">
            نظام متكامل لإدارة وتتبع دورة حياة الأبقار من الولادة إلى البيع أو الوفاة مع إحصائيات إنتاجية فورية ومراقبة الحالات الطارئة.
          </p>
        </div>

        {/* Removed Add Farm button according to user request */}
      </div>



      {/* Farm Selector Tabs */}
      <div className="bg-slate-50 p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-100">
        <button
          onClick={() => setSelectedFarmId("all")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            selectedFarmId === "all"
              ? "bg-white text-emerald-800 shadow-md border border-emerald-100"
              : "text-slate-600 hover:text-slate-900"
          }`}
          id="farm-select-all"
        >
          جميع المزارع ({farms.length})
        </button>
        {farms.map((farm) => {
          const farmCowCount = cows.filter(c => c.farmId === farm.id && c.status !== 'sold' && c.status !== 'deceased').length;
          return (
            <button
              key={farm.id}
              onClick={() => setSelectedFarmId(farm.id)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                selectedFarmId === farm.id
                  ? "bg-white text-emerald-800 shadow-md border border-emerald-100"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              id={`farm-select-${farm.id}`}
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{farm.name}</span>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                {farmCowCount} رأس
              </span>
            </button>
          );
        })}
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Total Active Herd */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">القطيع النشط</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCows} رأس</p>
          </div>
        </div>

        {/* Milking Cows */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-sky-50 rounded-xl text-sky-700">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">الأبقار الحلوب</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.milkingCows} رأس</p>
          </div>
        </div>

        {/* Pregnant Cows */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-700">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">الأبقار الحوامل</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.pregnantCows} رأس</p>
          </div>
        </div>

        {/* Daily Milk Production */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-amber-50 rounded-xl text-amber-700">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">إنتاج الحليب اليومي</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalMilkToday} لتر</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="stats-secondary-grid">
        {/* Sick Cows */}
        <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-rose-700 font-medium">أبقار مريضة / تحت الملاحظة</p>
              <p className="text-xl font-bold text-rose-900 mt-1">{stats.sickCows} حالات حالية</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-100/60 px-3 py-1 rounded-full">
            تتطلب متابعة
          </span>
        </div>

        {/* Emergencies Count */}
        <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-amber-700 font-medium">إجمالي الأحداث الطارئة والأمراض</p>
              <p className="text-xl font-bold text-amber-900 mt-1">{stats.emergenciesCount} حدث مسجل</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-100/60 px-3 py-1 rounded-full">
            حالة عاجلة
          </span>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="analytics-grid">
        {/* Farm Cards & Capacities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">قائمة مزارع القطاع</h2>
            <span className="text-xs font-medium text-slate-500">مجموع الطاقة الاستيعابية: {farms.reduce((sum, f) => sum + f.capacity, 0)} رأس</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farms.map((farm) => {
              const activeHerd = cows.filter(c => c.farmId === farm.id && c.status !== 'sold' && c.status !== 'deceased');
              const activeCount = activeHerd.length;
              const soldCount = cows.filter(c => c.farmId === farm.id && c.status === 'sold').length;
              const deceasedCount = cows.filter(c => c.farmId === farm.id && c.status === 'deceased').length;
              const utilization = Math.min(100, Math.round((activeCount / farm.capacity) * 100));

              return (
                <div
                  key={farm.id}
                  onClick={() => setSelectedFarmId(farm.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between h-64 ${
                    selectedFarmId === farm.id
                      ? "bg-emerald-50/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        utilization > 90 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        امتلاء {utilization}%
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg">{farm.name}</h3>
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {farm.location}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Capacity bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">السعة: {farm.capacity} رأس</span>
                        <span className="text-emerald-700 font-bold">{activeCount} رأس نشط</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            utilization > 90 ? "bg-red-500" : "bg-emerald-600"
                          }`}
                          style={{ width: `${utilization}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Cycle stats */}
                    <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-50 pt-3">
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <p className="text-[10px] text-slate-500 font-medium">إجمالي المباعة</p>
                        <p className="text-xs font-bold text-slate-800">{soldCount} رأس</p>
                      </div>
                      <div className="bg-rose-50/50 p-1.5 rounded-lg">
                        <p className="text-[10px] text-rose-500 font-medium">إجمالي الوفيات</p>
                        <p className="text-xs font-bold text-rose-800">{deceasedCount} رأس</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breed and Custom Charts Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-lg">توزيع السلالات النشطة</h3>
          
          {totalActiveCows === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              لا توجد أبقار مسجلة في هذه المزرعة حالياً.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(breedCounts).map(([breed, count]) => {
                const percentage = Math.round((count / totalActiveCows) * 100);
                return (
                  <div key={breed} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{breed}</span>
                      <span className="text-slate-500">{count} رأس ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Life Cycle Diagram */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h4 className="font-bold text-slate-700 text-sm">دورة حياة الأبقار في مَراعي</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg font-medium border border-emerald-100">
                🌱 ولادة / شراء
                <span className="block text-slate-400 font-normal mt-1">بداية الدورة</span>
              </div>
              <div className="p-2 bg-teal-50 text-teal-800 rounded-lg font-medium border border-teal-100">
                🐄 تربية وحلب
                <span className="block text-slate-400 font-normal mt-1">الإنتاج والتلقيح</span>
              </div>
              <div className="p-2 bg-slate-100 text-slate-800 rounded-lg font-medium border border-slate-200">
                💰 بيع / 🪦 وفاة
                <span className="block text-slate-400 font-normal mt-1">نهاية الدورة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Emergencies Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="recent-emergencies">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-lg text-slate-800">الأحداث الطارئة والأمراض الأخيرة</h3>
          </div>
          <button
            onClick={onNavigateToCows}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>عرض سجل الأبقار الكامل</span>
            <span className="text-lg">←</span>
          </button>
        </div>

        {recentEmergencies.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            لا توجد حالات طارئة أو أمراض مسجلة مؤخراً. القطيع آمن وبصحة جيدة!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEmergencies.map((evt) => {
              const targetCow = cows.find(c => c.id === evt.cowId);
              return (
                <div key={evt.id} className="p-4 rounded-xl bg-rose-50/40 border border-rose-100/70 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        حالة طارئة
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{evt.date}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 mb-1">{evt.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-rose-100/50 text-[11px]">
                    <span className="text-slate-500 font-medium">البقرة: <span className="text-emerald-800 font-bold">{targetCow?.name || evt.cowId} ({evt.cowId})</span></span>
                    <span className="text-slate-400 font-medium">بواسطة: {evt.recordedBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Farm Dialog */}
      <AnimatePresence>
        {showAddFarm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 text-right"
              id="add-farm-modal"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <button
                  onClick={() => setShowAddFarm(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
                <h3 className="font-bold text-xl text-slate-800">إضافة مزرعة جديدة للقطاع</h3>
              </div>

              <form onSubmit={handleAddFarmSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">اسم المزرعة</label>
                  <input
                    type="text"
                    required
                    value={newFarmName}
                    onChange={(e) => setNewFarmName(e.target.value)}
                    placeholder="مثال: مزرعة الريان النموذجية"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm text-right"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">المحافظة في سوريا</label>
                    <select
                      value={newFarmGov}
                      onChange={(e) => {
                        const nextGov = e.target.value;
                        setNewFarmGov(nextGov);
                        setNewFarmDist(SYRIA_REGIONS[nextGov][0]);
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm text-right bg-white"
                    >
                      {SYRIA_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">المنطقة الإدارية</label>
                    <select
                      value={newFarmDist}
                      onChange={(e) => setNewFarmDist(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm text-right bg-white"
                    >
                      {(SYRIA_REGIONS[newFarmGov] || []).map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">الطاقة الاستيعابية القصوى (رأس)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newFarmCapacity}
                    onChange={(e) => setNewFarmCapacity(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">ملاحظات أو مواصفات إضافية</label>
                  <textarea
                    value={newFarmNotes}
                    onChange={(e) => setNewFarmNotes(e.target.value)}
                    placeholder="اكتب مواصفات المزرعة، نظام التغذية، أو الآلات المتوفرة..."
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm text-right resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 p-3 bg-emerald-800 text-white font-semibold rounded-xl hover:bg-emerald-900 shadow-md transition-all border-none"
                  >
                    حفظ المزرعة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFarm(false)}
                    className="flex-1 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all border-none"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
