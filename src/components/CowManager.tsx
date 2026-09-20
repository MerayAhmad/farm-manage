import React, { useState } from "react";
import { Farm, Cow, CattleEvent, CowStatus, HealthStatus, EntryMethod, EventType, ExitReason } from "../types";
import { 
  Search, Filter, Plus, Calendar, Coins, Scale, Milk, HeartPulse, Sparkles, AlertTriangle, 
  Trash2, ArrowUpRight, History, Info, ChevronLeft, HelpCircle, Activity, Stethoscope, User, Save, X,
  FileSpreadsheet, ClipboardList, ShieldAlert, GitCommit, Baby, Award, RefreshCw, Layers, Check, RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CowManagerProps {
  cows: Cow[];
  farms: Farm[];
  events: CattleEvent[];
  selectedFarmId: string;
  onAddCow: (cow: Cow) => void;
  onUpdateCowStatus: (cowId: string, status: CowStatus, healthStatus: HealthStatus) => void;
  onRecordExit: (cowId: string, exitReason: ExitReason, exitDate: string, exitPrice?: number, exitNotes?: string) => void;
  onAddEvent: (event: Omit<CattleEvent, "id">) => void;
  onDeleteCow: (cowId: string) => void;
}

export default function CowManager({
  cows,
  farms,
  events,
  selectedFarmId,
  onAddCow,
  onUpdateCowStatus,
  onRecordExit,
  onAddEvent,
  onDeleteCow,
}: CowManagerProps) {
  // Current Tab: Active Cows vs Archive/Exited vs Overall Events Log
  const [activeSubTab, setActiveSubTab] = useState<"active" | "archived" | "events_log">("active");

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);

  // Modal displays
  const [showAddCowModal, setShowAddCowModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Cow Registration Mode (Birth vs Purchase)
  const [regMethod, setRegMethod] = useState<EntryMethod>("birth");

  // --- Registration Form Fields ---
  const [regId, setRegId] = useState("");
  const [regRfid, setRegRfid] = useState("");
  const [regName, setRegName] = useState("");
  const [regBreed, setRegBreed] = useState("هولشتاين -Holstein");
  const [regBirthDate, setRegBirthDate] = useState(new Date().toISOString().split("T")[0]);
  const [regEntryDate, setRegEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [regGender, setRegGender] = useState<"female" | "male">("female");
  const [regStatus, setRegStatus] = useState<CowStatus>("heifer");
  const [regHealth, setRegHealth] = useState<HealthStatus>("excellent");
  const [regWeight, setRegWeight] = useState(150);
  const [regBirthWeight, setRegBirthWeight] = useState(40);
  const [regColor, setRegColor] = useState("أبيض وأسود");
  const [regBarn, setRegBarn] = useState("حظيرة التربية أ");
  const [regGroup, setRegGroup] = useState("العجلات الفتية");
  const [regMotherId, setRegMotherId] = useState("");
  const [regFatherId, setRegFatherId] = useState("");
  const [regFarmId, setRegFarmId] = useState(farms[0]?.id || "");
  // Purchase Fields
  const [regPurchasePrice, setRegPurchasePrice] = useState("");
  const [regSupplier, setRegSupplier] = useState("");
  const [regNumberOfCalvings, setRegNumberOfCalvings] = useState(0);
  const [regCurrentMilkYield, setRegCurrentMilkYield] = useState("");
  const [regLastInseminationDate, setRegLastInseminationDate] = useState("");
  const [regLastCalvingDate, setRegLastCalvingDate] = useState("");

  // --- Dynamic Event Adding Form States ---
  const [eventCowId, setEventCowId] = useState("");
  const [eventType, setEventType] = useState<EventType>("health_check");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventCost, setEventCost] = useState("");
  const [eventSeverity, setEventSeverity] = useState<"normal" | "warning" | "critical">("normal");
  const [eventNotes, setEventNotes] = useState("");

  // Event Specialized fields
  const [vaccineType, setVaccineType] = useState<'FMD' | 'Brucella' | 'LSD' | 'Other'>("FMD");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentDrug, setTreatmentDrug] = useState("");
  const [treatmentDose, setTreatmentDose] = useState("");
  const [doctorName, setDoctorName] = useState("د. ياسر العتيبي");
  const [treatmentEndDate, setTreatmentEndDate] = useState("");
  const [milkWithdrawalDays, setMilkWithdrawalDays] = useState(3);
  const [meatWithdrawalDays, setMeatWithdrawalDays] = useState(14);
  const [breedingTechnician, setBreedingTechnician] = useState("م. أحمد الشمري");
  const [breedingBull, setBreedingBull] = useState("");
  const [breedingSemenStrawId, setBreedingSemenStrawId] = useState("");
  const [breedingResult, setBreedingResult] = useState<'success' | 'failure' | 'pending' | 'repeat_heat'>("pending");
  const [pregnancyStatus, setPregnancyStatus] = useState<'pregnant' | 'non_pregnant' | 'twins'>("pregnant");
  const [pregnancyFetalAge, setPregnancyFetalAge] = useState(1);
  const [calvingEase, setCalvingEase] = useState<'easy' | 'assisted' | 'difficult' | 'cesarean'>("easy");
  const [calvingType, setCalvingType] = useState("طبيعية فردية");
  const [calvingAssistant, setCalvingAssistant] = useState("");
  const [calvingBabiesCount, setCalvingBabiesCount] = useState(1);
  // Calf Auto-Registration Fields inside Calving Event
  const [babyTag, setBabyTag] = useState("");
  const [babyGender, setBabyGender] = useState<"female" | "male">("female");
  const [babyWeight, setBabyWeight] = useState(38);
  const [babyColor, setBabyColor] = useState("أبيض وأسود");
  // Milking Fields
  const [milkMorning, setMilkMorning] = useState("");
  const [milkNoon, setMilkNoon] = useState("");
  const [milkEvening, setMilkEvening] = useState("");
  const [milkFat, setMilkFat] = useState("3.8");
  const [milkProtein, setMilkProtein] = useState("3.2");
  const [milkScc, setMilkScc] = useState("150");
  const [milkConductivity, setMilkConductivity] = useState("4.5");
  const [milkTemperature, setMilkTemperature] = useState("38.5");
  // Culling / Exit / Death Fields
  const [cullingReason, setCullingReason] = useState("Low milk production (قلة إنتاج الحليب)");
  const [exitNotes, setExitNotes] = useState("");
  const [deathCause, setDeathCause] = useState("Bloat & Abomasal Displacement (التفاف الأنفحة والانتفاخ)");
  const [burialPlace, setBurialPlace] = useState("المدفن الصحي الجنوبي للمزرعة");
  const [exitPrice, setExitPrice] = useState("");
  const [exitBuyer, setExitBuyer] = useState("");
  // Weaning & Barn Transfer
  const [weaningAgeDays, setWeaningAgeDays] = useState(60);
  const [newBarn, setNewBarn] = useState("حظيرة التربية ب");
  const [newGroup, setNewGroup] = useState("مجموعة التلقيح");

  // --- AI Report ---
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Helper: check milk drop alert
  const [milkDropAlert, setMilkDropAlert] = useState<string | null>(null);

  // --- Filtering and Partitioning ---
  const activeCows = cows.filter(c => c.status !== "sold" && c.status !== "deceased");
  const archivedCows = cows.filter(c => c.status === "sold" || c.status === "deceased");

  const currentHerdList = activeSubTab === "active" ? activeCows : archivedCows;

  const filteredCows = currentHerdList.filter((cow) => {
    const matchesSearch = 
      cow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cow.rfid && cow.rfid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cow.name && cow.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cow.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFarm = selectedFarmId === "all" || cow.farmId === selectedFarmId;
    const matchesStatus = statusFilter === "all" || cow.status === statusFilter;
    const matchesHealth = healthFilter === "all" || cow.healthStatus === healthFilter;

    return matchesSearch && matchesFarm && matchesStatus && matchesHealth;
  });

  const selectedCow = cows.find((c) => c.id === selectedCowId);
  const selectedCowEvents = events
    .filter((e) => e.cowId === selectedCowId)
    .sort((a, b) => b.date.localeCompare(a.date));

  // --- Add Cow Submit ---
  const handleAddCowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId) return;

    if (cows.some(c => c.id.trim().toUpperCase() === regId.trim().toUpperCase())) {
      alert("⚠️ عذراً! رقم السوار/القرط مكرر بالفعل في قاعدة بيانات مزارع أكبيطرة. يرجى اختيار معرّف فريد.");
      return;
    }

    const newCow: Cow = {
      id: regId.trim().toUpperCase(),
      rfid: regRfid ? regRfid.trim() : undefined,
      name: regName ? regName.trim() : undefined,
      breed: regBreed,
      birthDate: regBirthDate,
      entryDate: regEntryDate,
      entryMethod: regMethod,
      purchasePrice: regMethod === "purchase" && regPurchasePrice ? Number(regPurchasePrice) : undefined,
      gender: regGender,
      status: regMethod === "birth" ? "calf" : regStatus,
      healthStatus: regHealth,
      weight: Number(regWeight),
      birthWeight: regMethod === "birth" ? Number(regBirthWeight) : undefined,
      color: regColor ? regColor : undefined,
      barn: regBarn ? regBarn : undefined,
      group: regGroup ? regGroup : undefined,
      farmId: regFarmId,
      motherId: regMotherId ? regMotherId.trim().toUpperCase() : undefined,
      fatherId: regFatherId ? regFatherId.trim().toUpperCase() : undefined,
      supplier: regMethod === "purchase" && regSupplier ? regSupplier : undefined,
      numberOfCalvings: regMethod === "purchase" ? Number(regNumberOfCalvings) : 0,
      milkYield: (regMethod === "purchase" && regStatus === "milking" && regCurrentMilkYield) ? Number(regCurrentMilkYield) : undefined,
      lastInseminationDate: (regMethod === "purchase" && regLastInseminationDate) ? regLastInseminationDate : undefined,
      lastCalvingDate: (regMethod === "purchase" && regLastCalvingDate) ? regLastCalvingDate : undefined,
      milkStartOfSeasonDate: (regMethod === "purchase" && regStatus === "milking") ? regEntryDate : undefined,
      createdAt: new Date().toISOString(),
    };

    onAddCow(newCow);

    // Auto record registration event in timeline
    onAddEvent({
      cowId: newCow.id,
      farmId: newCow.farmId,
      type: regMethod === "birth" ? "birth" : "purchase",
      date: newCow.entryDate,
      title: regMethod === "birth" ? "سجل ولادة عجل جديد" : "عملية شراء واستيراد رأس جديد",
      description: regMethod === "birth"
        ? `ولادة طبيعية للعجل/البقرة ${newCow.name || newCow.id} في حظيرة ${newCow.barn}. الوزن عند الولادة: ${newCow.birthWeight} كجم. الأم: ${newCow.motherId || "غير معروف"}.`
        : `تم شراء واستيراد رأس جديد من المورد [${newCow.supplier || "غير محدد"}] بسعر ${newCow.purchasePrice} ل.س ودخولها في حظيرة ${newCow.barn}.`,
      severity: "normal",
      cost: regMethod === "purchase" && regPurchasePrice ? Number(regPurchasePrice) : 0,
      recordedBy: "م. أحمد الشمري (مدير قطاع السجلات)",
      notes: regMethod === "birth" ? "تم فحص المولود وتطهير السرة فوراً." : `الحالة الصحية عند الاستلام: ${newCow.healthStatus}`,
    });

    // Reset Form fields
    setRegId("");
    setRegRfid("");
    setRegName("");
    setRegBirthDate(new Date().toISOString().split("T")[0]);
    setRegEntryDate(new Date().toISOString().split("T")[0]);
    setRegWeight(150);
    setRegBirthWeight(40);
    setRegColor("أبيض وأسود");
    setRegMotherId("");
    setRegFatherId("");
    setRegPurchasePrice("");
    setRegSupplier("");
    setRegNumberOfCalvings(0);
    setRegCurrentMilkYield("");
    setRegLastInseminationDate("");
    setRegLastCalvingDate("");
    setShowAddCowModal(false);
    setSelectedCowId(newCow.id);
  };

  // --- Dynamic Event Submissions ---
  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCow = cows.find(c => c.id === eventCowId);
    if (!targetCow) return;

    let finalTitle = eventTitle;
    let finalDescription = eventDescription;
    let finalCost = eventCost ? Number(eventCost) : 0;

    // Extra Event Logic for exact steps matching (1 to 18)
    const extraFields: Partial<CattleEvent> = {};

    switch (eventType) {
      case "vaccination":
        finalTitle = `تحصين دوري ضد ${vaccineType}`;
        finalDescription = `تم إعطاء البقرة جرعة لقاح [${vaccineType}] بواسطة الطبيب [${doctorName}]. ملاحظات التطعيم: ${eventNotes || "لا يوجد"}`;
        extraFields.vaccineType = vaccineType;
        extraFields.doctorName = doctorName;
        break;

      case "treatment":
        finalTitle = `علاج طبي وعزل: ${diagnosis}`;
        finalDescription = `التشخيص: ${diagnosis}. تم وصف دواء [${treatmentDrug}] بجرعة [${treatmentDose}]. فترة سحب الحليب: ${milkWithdrawalDays} أيام. فترة سحب اللحم: ${meatWithdrawalDays} أيام. ينتهي في ${treatmentEndDate}.`;
        extraFields.diagnosis = diagnosis;
        extraFields.treatmentDrug = treatmentDrug;
        extraFields.treatmentDose = treatmentDose;
        extraFields.doctorName = doctorName;
        extraFields.treatmentEndDate = treatmentEndDate;
        extraFields.milkWithdrawalDays = milkWithdrawalDays;
        extraFields.meatWithdrawalDays = meatWithdrawalDays;
        
        // Auto update cow state
        onUpdateCowStatus(targetCow.id, "sick", "under_treatment");
        break;

      case "weight_record":
        finalTitle = "تسجيل الوزن الدوري لنمو القطيع";
        finalDescription = `تم وزن الحيوان وسجل زيادة جديدة. الوزن الحالي: ${regWeight} كجم.`;
        // Update cow's weight property
        targetCow.weight = regWeight;
        break;

      case "weaning":
        finalTitle = "عملية الفطام الرسمية (Weaning)";
        finalDescription = `تم فطام العجل بنجاح عند عمر ${weaningAgeDays} يوم بوزن فطام ${regWeight} كجم ونقله إلى حظيرة التربية ب.`;
        extraFields.weaningAgeDays = weaningAgeDays;
        targetCow.status = "heifer";
        targetCow.weight = regWeight;
        targetCow.barn = "حظيرة التربية ب";
        targetCow.group = "العجلات النامية";
        break;

      case "pen_transfer":
        finalTitle = "نقل الحيوان بين الحظائر";
        finalDescription = `تم تغيير حظيرة الحيوان من [${targetCow.barn || "غير محدد"}] إلى [${newBarn}] وضمن مجموعة [${newGroup}].`;
        extraFields.newBarn = newBarn;
        targetCow.barn = newBarn;
        targetCow.group = newGroup;
        break;

      case "breeding":
        finalTitle = "عملية تلقيح اصطناعي (Insemination)";
        finalDescription = `تم إجراء تلقيح اصطناعي للحيوان بواسطة الفني [${breedingTechnician}] باستخدام قشة السائل المنوي [${breedingSemenStrawId}] المأخوذة من الثور [${breedingBull}]. الحجر الأولي لمدة 30 يوماً للتأكد.`;
        extraFields.breedingTechnician = breedingTechnician;
        extraFields.breedingBull = breedingBull;
        extraFields.breedingSemenStrawId = breedingSemenStrawId;
        extraFields.breedingResult = breedingResult;
        targetCow.lastInseminationDate = eventDate;
        break;

      case "pregnancy_check":
        const checkResultArabic = {
          pregnant: "حامل مؤكدة (سونار إيجابي) 🤰",
          non_pregnant: "غير حامل (سونار سلبي) 🍂",
          twins: "حامل بتوأم! 🤰🤰"
        }[pregnancyStatus];
        
        finalTitle = "تشخيص وفحص الحمل الإعصاري (Pregnancy Check)";
        finalDescription = `فحص سونار للرحم بعد مرور فترة الانتظار. النتيجة: ${checkResultArabic}. عمر الجنين التقريبي: ${pregnancyFetalAge} شهر.`;
        extraFields.pregnancyStatus = pregnancyStatus;
        extraFields.pregnancyFetalAge = pregnancyFetalAge;

        if (pregnancyStatus === "pregnant" || pregnancyStatus === "twins") {
          onUpdateCowStatus(targetCow.id, "pregnant", "excellent");
        } else {
          onUpdateCowStatus(targetCow.id, "dry", "stable");
        }
        break;

      case "birth": // Calving/Delivery
        finalTitle = "حدث ولادة ناجحة وتفريخ عجل (Calving)";
        finalDescription = `ولادة ${calvingEase === 'easy' ? 'سهلة طبيعية' : calvingEase === 'assisted' ? 'بمساعدة بيطرية' : 'متعسرة وتدخل حرج'}. عدد المواليد: ${calvingBabiesCount} رأس. الطبيب المسؤول: ${doctorName}.`;
        extraFields.calvingEase = calvingEase;
        extraFields.calvingType = calvingType;
        extraFields.calvingAssistant = calvingAssistant;
        extraFields.calvingBabiesCount = calvingBabiesCount;

        // Auto change mother status to milking!
        targetCow.status = "milking";
        targetCow.numberOfCalvings = (targetCow.numberOfCalvings || 0) + 1;
        targetCow.lastCalvingDate = eventDate;
        targetCow.milkStartOfSeasonDate = eventDate;
        // Seed default initial milk yield for newly calving cow
        targetCow.milkYield = 25; 

        // AMAZING AUTOMATION: Auto register the new newborn calf in the database!
        if (babyTag) {
          const babyCow: Cow = {
            id: babyTag.trim().toUpperCase(),
            name: `عجل_${targetCow.name || targetCow.id}`,
            breed: targetCow.breed,
            birthDate: eventDate,
            entryDate: eventDate,
            entryMethod: "birth",
            gender: babyGender,
            status: "calf",
            healthStatus: "excellent",
            weight: babyWeight,
            birthWeight: babyWeight,
            color: babyColor,
            barn: "حظيرة العجول الرضيعة ب",
            group: "العجول حديثة الولادة",
            farmId: targetCow.farmId,
            motherId: targetCow.id,
            createdAt: new Date().toISOString(),
          };
          onAddCow(babyCow);
          
          finalDescription += `\n\n📌 تم تسجيل العجل الجديد ذي رقم السوار الدولي [${babyCow.id}] تلقائياً وربطه بنسب الأم بنجاح بوزن عند الولادة ${babyWeight} كجم.`;
        }
        break;

      case "milk_record":
        const morning = Number(milkMorning) || 0;
        const noon = Number(milkNoon) || 0;
        const evening = Number(milkEvening) || 0;
        const totalDayMilk = morning + noon + evening;

        finalTitle = "سجل إنتاج الحليب اليومي الفردي";
        finalDescription = `الإنتاج اليومي: ${totalDayMilk} لتر (صباحاً: ${morning}، ظهراً: ${noon}، مساءً: ${evening} لتر). نسبة الدسم: ${milkFat}%، البروتين: ${milkProtein}%. الخلايا الجسدية (SCC): ${milkScc}K. التوصيل الكهربائي: ${milkConductivity} mS. درجة حرارة الحليب: ${milkTemperature}م°`;
        
        extraFields.milkMorning = morning;
        extraFields.milkNoon = noon;
        extraFields.milkEvening = evening;
        extraFields.milkFat = Number(milkFat);
        extraFields.milkProtein = Number(milkProtein);
        extraFields.milkScc = Number(milkScc);
        extraFields.milkConductivity = Number(milkConductivity);
        extraFields.milkTemperature = Number(milkTemperature);

        // PRODUCTION ALERTS AUTOMATION (Step 9):
        // Compare with the cow's previous milk yield. If it drops by 25% or more, flag a warnings!
        if (targetCow.milkYield && targetCow.milkYield > 0) {
          const dropRatio = (targetCow.milkYield - totalDayMilk) / targetCow.milkYield;
          if (dropRatio >= 0.25) {
            const percentStr = Math.round(dropRatio * 100);
            const alertText = `⚠️ انخفاض حاد ومفاجئ في إنتاج الحليب للبقرة بنسبة ${percentStr}%! (الإنتاج الحالي: ${totalDayMilk} لتر مقارنة بالمتوسط السابق: ${targetCow.milkYield} لتر). يرجى فحصها فوراً للكشف عن التهاب الضرع أو حمى الحليب.`;
            setMilkDropAlert(alertText);
            finalDescription += `\n\n🚨 إنذار حاد: ${alertText}`;
            extraFields.severity = "critical";
            // Auto demote health status to check her
            targetCow.healthStatus = "under_treatment";
          } else {
            setMilkDropAlert(null);
          }
        } else {
          setMilkDropAlert(null);
        }

        // Update mother's current milk yield
        targetCow.milkYield = totalDayMilk;
        break;

      case "culling":
        finalTitle = "قرار استبعاد الحيوان من الإنتاج";
        finalDescription = `تم إصدار قرار استبعاد للرأس رقم ${targetCow.id} لسبب: [${cullingReason}]. ملاحظات: ${eventNotes}`;
        extraFields.cullingReason = cullingReason;
        
        // Update state and archive
        onRecordExit(targetCow.id, "culling", eventDate, undefined, `قرار استبعاد: ${cullingReason}. ${eventNotes}`);
        break;

      case "sale":
        finalTitle = "تسجيل خروج: عملية بيع تجارية";
        finalDescription = `تم بيع البقرة بمبلغ ${exitPrice} ل.س للطرف [${exitBuyer}]. سبب البيع والفرز: ${eventNotes}`;
        extraFields.cost = -Number(exitPrice); // Negative cost is revenue in reports
        
        onRecordExit(targetCow.id, "sale", eventDate, Number(exitPrice), `بيع للطرف [${exitBuyer}]. ${eventNotes}`);
        break;

      case "death":
        finalTitle = "وفاة ونفوق رسمي للحيوان 🪦";
        finalDescription = `أعلنت وفاة الرأس رقم ${targetCow.id} بسبب: [${deathCause}]. التشخيص النهائي: ${diagnosis}. المدفن والتخلص البيئي: ${burialPlace}. الطبيب البيطري: ${doctorName}`;
        extraFields.deathCause = deathCause;
        extraFields.diagnosis = diagnosis;
        extraFields.doctorName = doctorName;
        extraFields.burialPlace = burialPlace;

        onRecordExit(targetCow.id, "death", eventDate, undefined, `وفاة ونفوق بسبب: ${deathCause}. مكان التخلص: ${burialPlace}. د. ${doctorName}`);
        break;

      default:
        break;
    }

    onAddEvent({
      cowId: eventCowId,
      farmId: targetCow.farmId,
      type: eventType,
      date: eventDate,
      title: finalTitle,
      description: finalDescription,
      severity: eventSeverity,
      cost: finalCost || undefined,
      recordedBy: doctorName || "المدير الفني للمزرعة",
      notes: eventNotes || undefined,
      ...extraFields
    });

    // Clean up dynamic state variables & close modal
    setEventTitle("");
    setEventDescription("");
    setEventNotes("");
    setEventCost("");
    setDiagnosis("");
    setTreatmentDrug("");
    setTreatmentDose("");
    setBabyTag("");
    setMilkMorning("");
    setMilkNoon("");
    setMilkEvening("");
    setShowAddEventModal(false);
  };

  // --- Run AI Analysis via Gemini SDK ---
  const handleRunAIReport = async () => {
    if (!selectedCow) return;
    setLoadingAI(true);
    setAiReport(null);

    try {
      const response = await fetch("/api/ai/analyze-cow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cow: selectedCow,
          logs: selectedCowEvents,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAiReport(data.analysis);
      } else {
        setAiReport(`عذراً، لم نتمكن من تحليل الحالة: ${data.error}`);
      }
    } catch (error) {
      setAiReport("عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي لأكبيطرة.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Label UI helpers
  const getStatusLabel = (status: CowStatus) => {
    switch (status) {
      case "milking": return { text: "حلوب 🥛", color: "bg-sky-100 text-sky-800 border-sky-200" };
      case "dry": return { text: "جافة 🍂", color: "bg-orange-100 text-orange-800 border-orange-200" };
      case "pregnant": return { text: "حامل 🤰", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "heifer": return { text: "عجلة 🐄", color: "bg-teal-100 text-teal-800 border-teal-200" };
      case "calf": return { text: "عجل رضيع 🍼", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "sick": return { text: "مريضة 🩺", color: "bg-rose-100 text-rose-800 border-rose-200" };
      case "sold": return { text: "مباعة ومؤرشفة 💰", color: "bg-slate-100 text-slate-700 border-slate-300" };
      case "deceased": return { text: "نفوق ومؤرشف 🪦", color: "bg-red-200 text-red-900 border-red-300" };
    }
  };

  const getHealthLabel = (health: HealthStatus) => {
    switch (health) {
      case "excellent": return { text: "ممتازة", color: "text-emerald-700 bg-emerald-50" };
      case "stable": return { text: "مستقرة", color: "text-blue-700 bg-blue-50" };
      case "under_treatment": return { text: "تحت العلاج", color: "text-amber-700 bg-amber-50" };
      case "critical": return { text: "حالة حرجة", color: "text-rose-700 bg-rose-50" };
    }
  };

  const calculateAge = (birthDateStr: string) => {
    const birth = new Date(birthDateStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return Math.max(0, diffMonths);
  };

  return (
    <div className="space-y-6 text-right" id="cow-manager-root">
      
      {/* Dynamic Sub-tab Selector */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm" id="cow-manager-sub-tab-container">
        <div className="flex flex-wrap sm:flex-nowrap bg-slate-50 p-1.5 rounded-2xl border border-slate-200 gap-1.5 w-full xl:w-auto">
          <button
            onClick={() => {
              setActiveSubTab("active");
              setSelectedCowId(null);
              setSearchTerm("");
            }}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border-none flex-1 md:flex-none ${
              activeSubTab === "active"
                ? "bg-emerald-800 text-white shadow-lg"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>القطيع النشط ({activeCows.length})</span>
          </button>
          
          <button
            onClick={() => {
              setActiveSubTab("archived");
              setSelectedCowId(null);
              setSearchTerm("");
            }}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border-none flex-1 md:flex-none ${
              activeSubTab === "archived"
                ? "bg-slate-800 text-white shadow-lg"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>الأرشيف ({archivedCows.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("events_log");
              setSelectedCowId(null);
            }}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border-none flex-1 md:flex-none ${
              activeSubTab === "events_log"
                ? "bg-teal-800 text-white shadow-lg"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل العمليات العام</span>
          </button>
        </div>

        {/* Quick buttons */}
        {activeSubTab !== "events_log" && (
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full xl:w-auto">
            <button
              onClick={() => setShowAddCowModal(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-1.5 bg-emerald-800 text-white hover:bg-emerald-900 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[11px] sm:text-xs font-bold border-none shadow-md transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>تسجيل دخول رأس جديدة</span>
            </button>
            <button
              onClick={() => {
                if (activeCows.length > 0) {
                  setEventCowId(activeCows[0].id);
                  setShowAddEventModal(true);
                } else {
                  alert("⚠️ لا توجد أبقار نشطة مسجلة حالياً لتسجيل الأحداث.");
                }
              }}
              className="flex-1 xl:flex-none flex items-center justify-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[11px] sm:text-xs font-bold border-none transition-all whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>تسجيل حدث دورة الحياة</span>
            </button>
          </div>
        )}
      </div>

      {/* SEARCH AND FILTERS (Only show if not in full events log subtab) */}
      {activeSubTab !== "events_log" && (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="البحث برقم السوار الدولي، RFID، الاسم، السلالة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-right font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent border-none text-xs focus:outline-none text-slate-700 py-3 font-medium"
              >
                <option value="all">كل الحالات الإنتاجية</option>
                {activeSubTab === "active" ? (
                  <>
                    <option value="milking">حلوب 🥛</option>
                    <option value="dry">جافة 🍂</option>
                    <option value="pregnant">حامل 🤰</option>
                    <option value="heifer">عجلة 🐄</option>
                    <option value="calf">عجل رضيع 🍼</option>
                    <option value="sick">مريضة 🩺</option>
                  </>
                ) : (
                  <>
                    <option value="sold">مباعة ومصدرة 💰</option>
                    <option value="deceased">متوفاة/نافقة 🪦</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5">
              <HeartPulse className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="w-full bg-transparent border-none text-xs focus:outline-none text-slate-700 py-3 font-medium"
              >
                <option value="all">كل الحالات الصحية</option>
                <option value="excellent">ممتازة ✨</option>
                <option value="stable">مستقرة 👍</option>
                <option value="under_treatment">تحت العلاج 💊</option>
                <option value="critical">حرجة جداً 🚨</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FULL FARM EVENTS LOG VIEW */}
      {activeSubTab === "events_log" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="border-b pb-3 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">سجل الأحداث الكامل للقطيع (خط زمني عام)</h3>
            <span className="text-xs bg-teal-50 text-teal-800 px-3 py-1 rounded-full font-bold">
              إجمالي الأحداث: {events.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[100vh] overflow-y-auto pr-1">
            {events.map((evt) => {
              const matchingCow = cows.find(c => c.id === evt.cowId);
              return (
                <div key={evt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all text-right space-y-2">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        evt.type === "emergency" ? "bg-red-100 text-red-800 border border-red-200" :
                        evt.type === "vaccination" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        evt.type === "milk_record" ? "bg-sky-100 text-sky-800 border-sky-200" : "bg-slate-200 text-slate-700"
                      }`}>
                        {evt.type.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {matchingCow ? `${matchingCow.name || "بقرة"} (${matchingCow.id})` : `حيوان مجهول (${evt.cowId})`}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{evt.date}</span>
                  </div>

                  <h5 className="font-bold text-xs text-emerald-800">{evt.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{evt.description}</p>
                  
                  {evt.notes && (
                    <p className="text-xs text-slate-500 italic bg-white p-2 rounded-lg border">
                      ملاحظة إضافية: "{evt.notes}"
                    </p>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200/50 pt-2">
                    <span>تسجيل: {evt.recordedBy}</span>
                    {evt.cost && evt.cost !== 0 ? (
                      <span className={`font-mono font-bold ${evt.cost > 0 ? "text-red-600" : "text-emerald-700"}`}>
                        {evt.cost > 0 ? `تكلفة: -${evt.cost} ل.س` : `إيراد: +${Math.abs(evt.cost)} ل.س`}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATALOG GRID AREA */}
      {activeSubTab !== "events_log" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="catalog-area">
          
          {/* LEFT SIDE: COWS LIST */}
          <div className="lg:col-span-2 space-y-3 max-h-[80vh] overflow-y-auto pr-1">
            {filteredCows.length === 0 ? (
              <div className="bg-white text-center py-20 rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-sm flex flex-col items-center gap-2">
                <span>🔍</span>
                <span>لم نعثر على أي أبقار مسجلة تطابق مرشحات البحث الحالية.</span>
              </div>
            ) : (
              filteredCows.map((cow) => {
                const statusInfo = getStatusLabel(cow.status);
                const healthInfo = getHealthLabel(cow.healthStatus);
                const isSelected = selectedCowId === cow.id;

                return (
                  <div
                    key={cow.id}
                    onClick={() => {
                      setSelectedCowId(cow.id);
                      setAiReport(null);
                      setMilkDropAlert(null);
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-50/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/10"
                        : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                    }`}
                    id={`cow-card-${cow.id}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 font-bold shrink-0 text-xl border">
                          {cow.gender === "male" ? "🐂" : "🐄"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-800 text-base">
                              {cow.name ? `${cow.name} (${cow.id})` : `حيوان رقم ${cow.id}`}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo?.color}`}>
                              {statusInfo?.text}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-1">
                            {cow.breed} • {calculateAge(cow.birthDate)} شهر • {cow.barn || "حظيرة عامة"}
                          </p>
                          
                          {cow.rfid && (
                            <p className="text-[10px] text-teal-700 mt-1 font-mono">
                              🏷️ RFID: {cow.rfid}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${healthInfo?.color}`}>
                          {healthInfo?.text}
                        </span>
                        <p className="text-xs font-semibold text-slate-700 mt-2 font-mono">{cow.weight} كجم</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT SIDE: DETAILED ANCESTRY & EVENTS TIMELINE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md flex flex-col justify-between min-h-[60vh]" id="detail-panel">
            {selectedCow ? (
              <div className="space-y-6">
                
                {/* Header detail */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                      <span>{selectedCow.name || `حيوان رقم ${selectedCow.id}`}</span>
                      <span className="text-xs text-slate-400 font-mono">({selectedCow.id})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">السلالة: {selectedCow.breed} • اللون: {selectedCow.color || "غير محدد"}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("🚨 هل أنت متأكد من حذف هذا السجل بشكل نهائي ومطلق من خادم مزارع أكبيطرة؟")) {
                        onDeleteCow(selectedCow.id);
                        setSelectedCowId(null);
                      }
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none shrink-0"
                    title="حذف مطلق من السجلات"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Status and Action Quick Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border">
                  <h4 className="font-bold text-xs text-slate-700">تحديث الحالة السريع (دورة الحياة)</h4>
                  
                  {selectedCow.status === "sold" || selectedCow.status === "deceased" ? (
                    <div className="bg-slate-100 text-slate-700 p-3 rounded-xl text-xs font-semibold text-center border">
                      🔒 دورة حياة الحيوان منتهية ومؤرشفة ({selectedCow.status === "sold" ? "مباعة ومصدرة" : "متوفاة/نافقة"})
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onUpdateCowStatus(selectedCow.id, "milking", "excellent")}
                        className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-800 transition-all flex-1"
                      >
                        🥛 حلب
                      </button>
                      <button
                        onClick={() => onUpdateCowStatus(selectedCow.id, "pregnant", "stable")}
                        className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-800 transition-all flex-1"
                      >
                        🤰 حمل
                      </button>
                      <button
                        onClick={() => onUpdateCowStatus(selectedCow.id, "dry", "stable")}
                        className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-amber-500 hover:text-amber-800 transition-all flex-1"
                      >
                        🍂 تجفيف
                      </button>
                      <button
                        onClick={() => {
                          setEventCowId(selectedCow.id);
                          setEventType("culling");
                          setShowAddEventModal(true);
                        }}
                        className="px-2.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-all flex-1"
                      >
                        🚨 استبعاد/بيع
                      </button>
                    </div>
                  )}
                </div>

                {/* Cow detailed parameters */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-slate-400 mb-1">رمز الـ RFID</p>
                    <p className="font-bold text-slate-800 font-mono">{selectedCow.rfid || "لم يثبت"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-slate-400 mb-1">الوزن الحالي</p>
                    <p className="font-bold text-slate-800 font-mono">{selectedCow.weight} كجم</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-slate-400 mb-1">الحظيرة</p>
                    <p className="font-bold text-slate-800">{selectedCow.barn || "التربية العامة"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-slate-400 mb-1">المجموعة الإنتاجية</p>
                    <p className="font-bold text-slate-800">{selectedCow.group || "مجموعة عامة"}</p>
                  </div>
                  {selectedCow.milkYield !== undefined && (
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-slate-400 mb-1">إنتاج الحليب</p>
                      <p className="font-bold text-sky-800 font-mono">{selectedCow.milkYield} لتر/يوم</p>
                    </div>
                  )}
                  {selectedCow.numberOfCalvings !== undefined && (
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-slate-400 mb-1">عدد ولادات سابقة</p>
                      <p className="font-bold text-slate-800 font-mono">{selectedCow.numberOfCalvings} مرات</p>
                    </div>
                  )}
                  {selectedCow.lastInseminationDate && (
                    <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                      <p className="text-slate-400 mb-1">تاريخ آخر تلقيح</p>
                      <p className="font-bold text-indigo-900 font-mono">{selectedCow.lastInseminationDate}</p>
                    </div>
                  )}
                  {selectedCow.lastCalvingDate && (
                    <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                      <p className="text-slate-400 mb-1">تاريخ آخر ولادة</p>
                      <p className="font-bold text-emerald-900 font-mono">{selectedCow.lastCalvingDate}</p>
                    </div>
                  )}

                  {/* Ancestry النسب العائلي */}
                  <div className="bg-emerald-50/30 p-3 rounded-xl col-span-2 border border-emerald-100">
                    <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span>تتبع النسب الوراثي والسلالة (Pedigree)</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">الأم (Dam ID)</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedCow.motherId || "سجل خارجي / غير معروف"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">الأب/الثور (Sire ID)</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedCow.fatherId || "سجل خارجي / غير معروف"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exit details archived */}
                {(selectedCow.status === "sold" || selectedCow.status === "deceased") && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-2">
                    <h4 className="font-bold text-amber-900 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>بيانات الخروج والمغادرة والأرشفة</span>
                    </h4>
                    <div className="space-y-1 text-slate-700 font-medium">
                      <p>تاريخ المغادرة: <span className="font-mono font-bold text-slate-900">{selectedCow.exitDate}</span></p>
                      <p>سبب الخروج: <span className="font-bold text-slate-900">{selectedCow.exitReason === "sale" ? "بيع" : selectedCow.exitReason === "culling" ? "استبعاد طبي/إنتاجي" : "وفاة ونفوق رسمي"}</span></p>
                      {selectedCow.exitPrice !== undefined && (
                        <p>قيمة الصفقة: <span className="font-bold text-emerald-800 font-mono">{selectedCow.exitPrice} ل.س</span></p>
                      )}
                      {selectedCow.exitNotes && (
                        <p className="text-slate-600 bg-white p-2.5 rounded-lg border mt-1 italic font-normal">
                          "{selectedCow.exitNotes}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Gemini Veterinary Assistant */}
                <div className="bg-gradient-to-l from-emerald-950 to-teal-900 text-white p-5 rounded-2xl space-y-3 shadow-md relative overflow-hidden border border-emerald-800">
                  <div className="flex items-center gap-1.5 text-emerald-200">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                    <span className="font-bold text-xs">مستشار التشخيص وعلاجات Gemini AI</span>
                  </div>
                  <p className="text-[10px] text-emerald-100 leading-relaxed">
                    مراجعة ذكية لجميع الأحداث الطارئة والتلقيحات وصحة الضرع وسجلات الحليب لتقديم خطة حظيرة وتغذية وعلاجات فورية.
                  </p>
                  
                  <button
                    onClick={handleRunAIReport}
                    disabled={loadingAI}
                    className="w-full py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loadingAI ? "جاري قراءة خط الحياة الطبي..." : "تحليل السجل الصحي الذكي"}
                  </button>

                  {aiReport && (
                    <div className="bg-white/10 p-3 rounded-lg text-[11px] leading-relaxed max-h-52 overflow-y-auto text-emerald-50 text-right mt-2 scrollbar-thin">
                      <h5 className="font-bold text-amber-300 mb-1 border-b border-white/20 pb-1 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        <span>توصيات المستشار البيطري الاصطناعي:</span>
                      </h5>
                      <div className="whitespace-pre-line font-sans">{aiReport}</div>
                    </div>
                  )}
                </div>

                {/* Selected Cow Events Timeline */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 border-b pb-2">
                    <History className="w-4 h-4 text-slate-400" />
                    <span>الخط الزمني لحياة الحيوان (Timeline)</span>
                  </h4>

                  <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                    {selectedCowEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">لا توجد أحداث ومذكرات مسجلة لهذا الرأس بعد.</p>
                    ) : (
                      selectedCowEvents.map((evt) => (
                        <div key={evt.id} className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl relative border border-slate-100 text-right">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              evt.type === 'emergency' ? 'bg-red-100 text-red-800' :
                              evt.type === 'birth' ? 'bg-emerald-100 text-emerald-800' :
                              evt.type === 'breeding' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {evt.type === 'emergency' ? '🚨 طارئ' : evt.type}
                            </span>
                            <span className="text-slate-400 font-mono">{evt.date}</span>
                          </div>

                          <h5 className="font-bold text-slate-800 text-xs mt-1.5 flex items-center gap-1">
                            <span>{evt.title}</span>
                          </h5>
                          
                          <p className="text-slate-600 text-[11px] mt-1 leading-normal whitespace-pre-line">{evt.description}</p>
                          
                          {evt.notes && (
                            <p className="text-slate-500 text-[10px] mt-1 italic font-normal bg-white p-1.5 rounded border">
                              ملاحظة: "{evt.notes}"
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 border-t pt-1.5">
                            <span>دكتور: {evt.doctorName || evt.recordedBy}</span>
                            {evt.cost !== undefined && evt.cost !== 0 && (
                              <span className="font-mono text-slate-500 font-bold">التكلفة: {evt.cost} ل.س</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-28 text-slate-400 text-xs my-auto flex flex-col items-center gap-3">
                <span className="text-5xl">🐂</span>
                <span className="font-semibold text-slate-500">مرحباً بك في إدارة دورة حياة الأبقار ومتابعتها.</span>
                <span className="max-w-xs text-slate-400">اختر أي رأس بقرة من القائمة الجانبية لتتمكن من إضافة علاجات، فحص حمل، تسجيل إنتاج حليب، فطام، تلقيح، أو تتبع شجرة النسب.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- MODAL 1: ADD COW MODAL (Birth / Purchase) --- */}
      <AnimatePresence>
        {showAddCowModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 text-right max-h-[92vh] overflow-y-auto"
              id="add-cow-modal"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCowModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 border-none shrink-0"
                >
                  ✕
                </button>
                <h3 className="font-bold text-lg text-slate-800">إدخال وتسجيل رأس بقرة جديدة للقطيع 🏷️</h3>
              </div>

              {/* Sub-toggle: Birth vs Purchase */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border">
                <button
                  type="button"
                  onClick={() => {
                    setRegMethod("birth");
                    setRegStatus("calf");
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border-none transition-all ${
                    regMethod === "birth" ? "bg-emerald-800 text-white shadow" : "text-slate-600"
                  }`}
                >
                  🤰 ولادة جديدة داخل المزرعة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegMethod("purchase");
                    setRegStatus("milking");
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border-none transition-all ${
                    regMethod === "purchase" ? "bg-emerald-800 text-white shadow" : "text-slate-600"
                  }`}
                >
                  💰 شراء واستيراد خارجي
                </button>
              </div>

              <form onSubmit={handleAddCowSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Global Fields */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">رقم السوار الدولي (Ear Tag ID) *</label>
                  <input
                    type="text"
                    required
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder="مثال: COW-1008"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">رقم الـ RFID الإلكتروني (إن وجد)</label>
                  <input
                    type="text"
                    value={regRfid}
                    onChange={(e) => setRegRfid(e.target.value)}
                    placeholder="مثال: RFID9821034"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">اسم البقرة أو اللقب المخصص</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: صبحية، بركة"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">السلالة الجينية</label>
                  <select
                    value={regBreed}
                    onChange={(e) => setRegBreed(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white"
                  >
                    <option value="هولشتاين -Holstein">هولشتاين - Holstein</option>
                    <option value="جيرسي - Jersey">جيرسي - Jersey</option>
                    <option value="سيمنتال - Simmental">سيمنتال - Simmental</option>
                    <option value="بلدي محسّن">بلدي محسّن</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">المزرعة المستضيفة</label>
                  <select
                    value={regFarmId}
                    onChange={(e) => setRegFarmId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">تاريخ الولادة / الميلاد</label>
                  <input
                    type="date"
                    required
                    value={regBirthDate}
                    onChange={(e) => setRegBirthDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">تاريخ الدخول والتقييد في المزرعة</label>
                  <input
                    type="date"
                    required
                    value={regEntryDate}
                    onChange={(e) => setRegEntryDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">اللون والسمات الجسدية</label>
                  <input
                    type="text"
                    value={regColor}
                    onChange={(e) => setRegColor(e.target.value)}
                    placeholder="مثال: أبيض وأسود، بني، أسود بالكامل"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">اسم الحظيرة المبدئية</label>
                  <input
                    type="text"
                    value={regBarn}
                    onChange={(e) => setRegBarn(e.target.value)}
                    placeholder="مثال: حظيرة الحوامل أ"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">المجموعة الإنتاجية التابعة</label>
                  <input
                    type="text"
                    value={regGroup}
                    onChange={(e) => setRegGroup(e.target.value)}
                    placeholder="مثال: مجموعة إنتاج الحليب العالي"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">سوار الأم لربط شجرة العائلة (Dam Tag)</label>
                  <input
                    type="text"
                    value={regMotherId}
                    onChange={(e) => setRegMotherId(e.target.value)}
                    placeholder="سوار الأم"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">رقم الأب/الثور الملقح للنسب (Sire Tag)</label>
                  <input
                    type="text"
                    value={regFatherId}
                    onChange={(e) => setRegFatherId(e.target.value)}
                    placeholder="رقم الأب"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">الجنس</label>
                  <div className="flex gap-4 p-2 bg-slate-50 rounded-xl border">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs flex-1 justify-center font-bold">
                      <input
                        type="radio"
                        checked={regGender === "female"}
                        onChange={() => setRegGender("female")}
                      />
                      <span>أنثى (Female)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs flex-1 justify-center font-bold">
                      <input
                        type="radio"
                        checked={regGender === "male"}
                        onChange={() => setRegGender("male")}
                      />
                      <span>ذكر (Male)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">الوزن الحالي بالكيلوغرام *</label>
                  <input
                    type="number"
                    required
                    value={regWeight}
                    onChange={(e) => setRegWeight(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                  />
                </div>

                {/* MODE SPECIFIC FIELDS */}
                {regMethod === "birth" ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">الوزن عند الولادة (كجم)</label>
                      <input
                        type="number"
                        value={regBirthWeight}
                        onChange={(e) => setRegBirthWeight(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">سعر الشراء الفعلي بالليرة السورية *</label>
                      <input
                        type="number"
                        required
                        value={regPurchasePrice}
                        onChange={(e) => setRegPurchasePrice(e.target.value)}
                        placeholder="سعر رأس الماشية"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">اسم المورد أو المستورد</label>
                      <input
                        type="text"
                        value={regSupplier}
                        onChange={(e) => setRegSupplier(e.target.value)}
                        placeholder="المورد الحيواني"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">الحالة الإنتاجية البدئية عند الشراء</label>
                      <select
                        value={regStatus}
                        onChange={(e) => setRegStatus(e.target.value as CowStatus)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white"
                      >
                        <option value="heifer">عجلة 🐄</option>
                        <option value="milking">حلوب 🥛</option>
                        <option value="pregnant">حامل 🤰</option>
                        <option value="dry">جافة 🍂</option>
                        <option value="sick">تحت العلاج 🩺</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">الحالة الصحية العامة</label>
                      <select
                        value={regHealth}
                        onChange={(e) => setRegHealth(e.target.value as HealthStatus)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white"
                      >
                        <option value="excellent">ممتازة ✨</option>
                        <option value="stable">مستقرة 👍</option>
                        <option value="under_treatment">تحت العلاج 💊</option>
                        <option value="critical">حرجة 🚨</option>
                      </select>
                    </div>

                    {regStatus === "milking" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500">مستوى إنتاج الحليب الحالي عند الشراء (لتر/يوم)</label>
                        <input
                          type="number"
                          value={regCurrentMilkYield}
                          onChange={(e) => setRegCurrentMilkYield(e.target.value)}
                          placeholder="مثال: 30"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">عدد ولدات السابقة (عدد الولادات)</label>
                      <input
                        type="number"
                        value={regNumberOfCalvings}
                        onChange={(e) => setRegNumberOfCalvings(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">تاريخ آخر تلقيح (إن وجد)</label>
                      <input
                        type="date"
                        value={regLastInseminationDate}
                        onChange={(e) => setRegLastInseminationDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">تاريخ آخر ولادة (إن وجد)</label>
                      <input
                        type="date"
                        value={regLastCalvingDate}
                        onChange={(e) => setRegLastCalvingDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white font-mono"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100 col-span-1 md:col-span-2">
                  <button
                    type="submit"
                    className="flex-1 p-3.5 bg-emerald-800 text-white font-bold rounded-2xl hover:bg-emerald-900 shadow-md transition-all border-none text-xs"
                  >
                    حفظ وتسجيل البيانات في السجل
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCowModal(false)}
                    className="flex-1 p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all border-none text-xs"
                  >
                    إلغاء وتراجع
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: ADD DETAILED LIFECYCLE EVENT MODAL (18 steps) --- */}
      <AnimatePresence>
        {showAddEventModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 text-right max-h-[92vh] overflow-y-auto"
              id="add-event-modal"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 border-none shrink-0"
                >
                  ✕
                </button>
                <h3 className="font-bold text-lg text-slate-800">تسجيل أحداث وإجراءات دورة حياة البقرة 📑</h3>
              </div>

              <form onSubmit={handleAddEventSubmit} className="space-y-4">
                
                {/* Cow Selection & Event Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">اختر رأس البقرة المعنية بالحدث *</label>
                    <select
                      value={eventCowId}
                      onChange={(e) => setEventCowId(e.target.value)}
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white font-bold"
                    >
                      {activeCows.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name ? `${c.name} (${c.id})` : `بقرة رقم ${c.id}`} - {c.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">نوع الإجراء / الحدث البيطري والإنتاجي *</label>
                    <select
                      value={eventType}
                      onChange={(e) => {
                        setEventType(e.target.value as EventType);
                        setEventTitle(`إجراء: ${e.target.value}`);
                      }}
                      required
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white font-bold text-emerald-800"
                    >
                      <option value="vaccination">💉 تحصين ولقاح (Vaccination)</option>
                      <option value="treatment">🩺 علاج ووصفة بيطرية (Treatment)</option>
                      <option value="weight_record">⚖️ تسجيل وزن دوري (Weight Record)</option>
                      <option value="weaning">🍼 فطام العجل (Weaning)</option>
                      <option value="pen_transfer">🚚 نقل بين الحظائر (Pen Transfer)</option>
                      <option value="breeding">🧬 عملية تلقيح اصطناعي (Breeding/AI)</option>
                      <option value="pregnancy_check">🤰 فحص السونار وتشخيص الحمل</option>
                      <option value="birth">🎉 ولادة جديدة / تفريخ عجل (Calving)</option>
                      <option value="milk_record">🥛 تسجيل إنتاج الحليب (Milking Log)</option>
                      <option value="health_check">🩺 فحص دوري عام (Health Check)</option>
                      <option value="emergency">🚨 حالة طارئة واستدعاء بيطري (Emergency)</option>
                      <option value="culling">🍂 استبعاد من المزرعة (Culling)</option>
                      <option value="sale">💰 بيع تجاري وتصدير خارج المزرعة (Sale)</option>
                      <option value="death">🪦 نفوق أو تخلص بيئي (Death/Loss)</option>
                    </select>
                  </div>
                </div>

                {/* Date & Title Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">تاريخ تسجيل الحدث</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">عنوان موجز للحدث</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="عنوان يعبر عن العملية"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right"
                    />
                  </div>
                </div>

                {/* --- DYNAMIC FIELD SECTIONS ACCORDING TO USER'S 18-STEP SPECIFICATION --- */}
                
                {/* 1. Vaccination Sub-form */}
                {eventType === "vaccination" && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <h4 className="font-bold text-xs text-blue-800">معايير التحصينات واللقاحات (Step 2)</h4>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">نوع التحصين المعتمد</label>
                      <select
                        value={vaccineType}
                        onChange={(e) => setVaccineType(e.target.value as any)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right bg-white"
                      >
                        <option value="FMD">FMD (الحمى القلاعية)</option>
                        <option value="Brucella">Brucella (البروسيلا)</option>
                        <option value="LSD">LSD (الجلد العقدي)</option>
                        <option value="Other">لقاح مخصص آخر</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">اسم الطبيب المعالج</label>
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Treatment Sub-form */}
                {eventType === "treatment" && (
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <h4 className="font-bold text-xs text-amber-800">تفاصيل كورس العلاج البيطري وفترات السحب (Step 11)</h4>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">التشخيص الطبي (المرض)</label>
                      <input
                        type="text"
                        required
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="مثال: التهاب الضرع Mastitis، حمى الكرش"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">اسم الدواء الموصوف</label>
                      <input
                        type="text"
                        required
                        value={treatmentDrug}
                        onChange={(e) => setTreatmentDrug(e.target.value)}
                        placeholder="مثال: البنسلين، أوفلوكساسين"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">الجرعة البيطرية اليومية</label>
                      <input
                        type="text"
                        required
                        value={treatmentDose}
                        onChange={(e) => setTreatmentDose(e.target.value)}
                        placeholder="مثال: 10 مل بالوريد"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">تاريخ انتهاء الكورس</label>
                      <input
                        type="date"
                        required
                        value={treatmentEndDate}
                        onChange={(e) => setTreatmentEndDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">فترة سحب الحليب (أيام لتفادي الهرمونات)</label>
                      <input
                        type="number"
                        value={milkWithdrawalDays}
                        onChange={(e) => setMilkWithdrawalDays(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">فترة سحب اللحم (أيام للتطهير)</label>
                      <input
                        type="number"
                        value={meatWithdrawalDays}
                        onChange={(e) => setMeatWithdrawalDays(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Weight Sub-form */}
                {eventType === "weight_record" && (
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-indigo-800">
                      ⚖️ تسجيل بيانات النمو والوزن (Step 2-3)
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">الوزن المسجل الحالي (كجم)</label>
                      <input
                        type="number"
                        required
                        value={regWeight}
                        onChange={(e) => setRegWeight(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Weaning Sub-form */}
                {eventType === "weaning" && (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-emerald-800">
                      🍼 تسجيل فطام عجل رضيع ونقله للتربية (Step 2)
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">عمر الفطام بالأيام</label>
                      <input
                        type="number"
                        value={weaningAgeDays}
                        onChange={(e) => setWeaningAgeDays(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">الوزن الفعلي عند الفطام (كجم)</label>
                      <input
                        type="number"
                        required
                        value={regWeight}
                        onChange={(e) => setRegWeight(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Pen Transfer Sub-form */}
                {eventType === "pen_transfer" && (
                  <div className="p-4 bg-slate-50 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-slate-800">
                      🚚 نقل الحيوان وتغيير حظيرة التربية (Step 2-3)
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">الحظيرة الجديدة المنقول إليها</label>
                      <input
                        type="text"
                        required
                        value={newBarn}
                        onChange={(e) => setNewBarn(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">المجموعة الجديدة</label>
                      <input
                        type="text"
                        required
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Breeding Sub-form */}
                {eventType === "breeding" && (
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-purple-800">
                      🧬 فحص الشبق والتلقيح الاصطناعي (Step 3-4)
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">رقم الثور الملقح أو سلالته</label>
                      <input
                        type="text"
                        required
                        value={breedingBull}
                        onChange={(e) => setBreedingBull(e.target.value)}
                        placeholder="مثال: BULL-HOLSTEIN-98"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">رقم قشة السائل المنوي (Semen Straw ID)</label>
                      <input
                        type="text"
                        required
                        value={breedingSemenStrawId}
                        onChange={(e) => setBreedingSemenStrawId(e.target.value)}
                        placeholder="مثال: STRA-872"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">اسم الفني المسؤول</label>
                      <input
                        type="text"
                        value={breedingTechnician}
                        onChange={(e) => setBreedingTechnician(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>
                  </div>
                )}

                {/* 7. Pregnancy Check Sub-form */}
                {eventType === "pregnancy_check" && (
                  <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-teal-800">
                      🤰 فحص الحمل بالأمواج الصوتية (Step 5)
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">نتيجة فحص السونار</label>
                      <select
                        value={pregnancyStatus}
                        onChange={(e) => setPregnancyStatus(e.target.value as any)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right bg-white"
                      >
                        <option value="pregnant">حامل مؤكد (Pregnant) 🤰</option>
                        <option value="twins">حامل بتوأم (Twins) 🤰🤰</option>
                        <option value="non_pregnant">غير حامل / شبق متكرر (Repeat Heat)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">عمر الجنين بالشهور (في حال الحمل)</label>
                      <input
                        type="number"
                        min={1}
                        max={9}
                        value={pregnancyFetalAge}
                        onChange={(e) => setPregnancyFetalAge(Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 8. Calving / Delivery Sub-form with newborn auto creation! */}
                {eventType === "birth" && (
                  <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-pink-800">
                      🎉 حدث ولادة الأبقار (Calving) - سينشأ عجل جديد تلقائياً في القطيع! (Step 7)
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">سهولة ويسر الولادة</label>
                      <select
                        value={calvingEase}
                        onChange={(e) => setCalvingEase(e.target.value as any)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right bg-white font-bold"
                      >
                        <option value="easy">سهلة وطبيعية بالكامل 👍</option>
                        <option value="assisted">بمساعدة بيطرية وسحب يدوي</option>
                        <option value="difficult">متعسرة وتدخل مجهد للضرع</option>
                        <option value="cesarean">عملية قيصرية جراحية 🩺</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">اسم الطبيب أو الفني المساعد</label>
                      <input
                        type="text"
                        value={calvingAssistant}
                        onChange={(e) => setCalvingAssistant(e.target.value)}
                        placeholder="المساعد الميداني"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>

                    {/* Newborn Baby Form Fields */}
                    <div className="col-span-2 p-3 bg-white rounded-xl border border-pink-200 space-y-3">
                      <p className="font-bold text-xs text-slate-700">📋 بطاقة تعريف المولود الجديد (العجل)</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-semibold text-slate-400">رقم سوار العجل المولود فريد *</label>
                          <input
                            type="text"
                            required
                            value={babyTag}
                            onChange={(e) => setBabyTag(e.target.value)}
                            placeholder="مثال: CALF-120A"
                            className="w-full p-2.5 rounded-lg border text-xs text-right font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-semibold text-slate-400">الوزن عند الولادة (كجم)</label>
                          <input
                            type="number"
                            value={babyWeight}
                            onChange={(e) => setBabyWeight(Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border text-xs text-right font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-semibold text-slate-400">جنس المولود</label>
                          <select
                            value={babyGender}
                            onChange={(e) => setBabyGender(e.target.value as any)}
                            className="w-full p-2.5 rounded-lg border text-xs text-right bg-white"
                          >
                            <option value="female">أنثى (عجلة) 🐄</option>
                            <option value="male">ذكر (عجل رضيع) 🍼</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-semibold text-slate-400">لون المولود</label>
                          <input
                            type="text"
                            value={babyColor}
                            onChange={(e) => setBabyColor(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-xs text-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Milk Record Sub-form with alert warning dropped */}
                {eventType === "milk_record" && (
                  <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
                    <div className="font-bold text-xs text-sky-800">
                      🥛 قياس ومراقبة إنتاج الحليب اليومي (Step 8-9)
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500">إنتاج الصباح (لتر)</label>
                        <input
                          type="number"
                          required
                          value={milkMorning}
                          onChange={(e) => setMilkMorning(e.target.value)}
                          placeholder="0"
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500">إنتاج الظهر (لتر)</label>
                        <input
                          type="number"
                          value={milkNoon}
                          onChange={(e) => setMilkNoon(e.target.value)}
                          placeholder="0"
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500">إنتاج المساء (لتر)</label>
                        <input
                          type="number"
                          value={milkEvening}
                          onChange={(e) => setMilkEvening(e.target.value)}
                          placeholder="0"
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-500">نسبة الدسم %</label>
                        <input
                          type="text"
                          value={milkFat}
                          onChange={(e) => setMilkFat(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs text-right font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-500">نسبة البروتين %</label>
                        <input
                          type="text"
                          value={milkProtein}
                          onChange={(e) => setMilkProtein(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs text-right font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-500">خلايا جسدية SCC</label>
                        <input
                          type="text"
                          value={milkScc}
                          onChange={(e) => setMilkScc(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs text-right font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-500">درجة التوصيل mS</label>
                        <input
                          type="text"
                          value={milkConductivity}
                          onChange={(e) => setMilkConductivity(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs text-right font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. Culling / Discard Sub-form */}
                {eventType === "culling" && (
                  <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-red-800">
                      🍂 قرار استبعاد الحيوان ومغادرة القطيع (Step 15)
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="block text-xs font-semibold text-slate-500">سبب الاستبعاد الرئيسي</label>
                      <select
                        value={cullingReason}
                        onChange={(e) => setCullingReason(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right bg-white"
                      >
                        <option value="Low milk production (قلة إنتاج الحليب)">قلة الإنتاجية اليومية من الحليب</option>
                        <option value="Infertility / Reproductive failure (عقم)">العقم وعدم نجاح التلقيح المتكرر</option>
                        <option value="Severe Lameness / Injury (عرج وأمراض ضرع)">العرج المزمن وتلف أنسجة الضرع</option>
                        <option value="Age / Senility (كِبر السن)">وصول الحيوان لسن متقدمة</option>
                        <option value="Chronic sickness (أمراض بكتيرية ومزمنة)">إصابة بمرض بكتيري مزمن وعزله</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 11. Sale Sub-form */}
                {eventType === "sale" && (
                  <div className="p-4 bg-slate-100 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-slate-800">
                      💰 تسجيل صفقة بيع وتصدير الحيوان (Step 16)
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">سعر البيع النهائي المتفق عليه *</label>
                      <input
                        type="number"
                        required
                        value={exitPrice}
                        onChange={(e) => setExitPrice(e.target.value)}
                        placeholder="سعر الصفقة"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">اسم المشتري / الجهة المستلمة</label>
                      <input
                        type="text"
                        required
                        value={exitBuyer}
                        onChange={(e) => setExitBuyer(e.target.value)}
                        placeholder="التاجر أو الشركة الحيوانية"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>
                  </div>
                )}

                {/* 12. Death / Loss Sub-form */}
                {eventType === "death" && (
                  <div className="p-4 bg-red-100/50 rounded-2xl border border-red-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 font-bold text-xs text-red-900">
                      🪦 إعلان نفوق ووفاة الحيوان والتخلص الصحي (Step 17)
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">سبب النفوق المباشر</label>
                      <input
                        type="text"
                        required
                        value={deathCause}
                        onChange={(e) => setDeathCause(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-500">مكان الدفن أو محرقة التخلص البيئي</label>
                      <input
                        type="text"
                        required
                        value={burialPlace}
                        onChange={(e) => setBurialPlace(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                      />
                    </div>
                  </div>
                )}

                {/* Base Cost & Severity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">التكلفة المالية المصاحبة بالليرة السورية</label>
                    <input
                      type="number"
                      value={eventCost}
                      onChange={(e) => setEventCost(e.target.value)}
                      placeholder="0 (مثال: ثمن اللقاح أو كشف الطبيب)"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">مستوى الخطورة / الأهمية</label>
                    <select
                      value={eventSeverity}
                      onChange={(e) => setEventSeverity(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right bg-white"
                    >
                      <option value="normal">عادي / روتيني (Normal)</option>
                      <option value="warning">متوسط الأهمية / تحذيري (Warning)</option>
                      <option value="critical">حرج جداً / خطير (Critical)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500">الطبيب البيطري أو الفني المشرف</label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                    />
                  </div>
                </div>

                {/* Description & Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">تفاصيل وسرد العملية (Description) *</label>
                  <textarea
                    required
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="اكتب بالتفصيل نتائج الفحص، درجات الحرارة، أو حالة الضرع..."
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500">ملاحظات تكميلية إضافية</label>
                  <input
                    type="text"
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                    placeholder="ملاحظات الحظر أو الأغذية المخصصة..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 p-3.5 bg-emerald-800 text-white font-bold rounded-2xl hover:bg-emerald-900 shadow-md transition-all border-none text-xs"
                  >
                    حفظ وإدراج في خط حياة الحيوان
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(false)}
                    className="flex-1 p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all border-none text-xs"
                  >
                    تراجع وإغلاق
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
