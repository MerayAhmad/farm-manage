export type CowStatus = 'milking' | 'dry' | 'pregnant' | 'heifer' | 'calf' | 'sick' | 'sold' | 'deceased';

export type HealthStatus = 'excellent' | 'stable' | 'under_treatment' | 'critical';

export type EntryMethod = 'birth' | 'purchase';

export type ExitReason = 'sale' | 'death' | 'culling';

export type EventType = 
  | 'birth'
  | 'purchase'
  | 'vaccination'
  | 'treatment'
  | 'weight_record'
  | 'weaning'
  | 'pen_transfer'
  | 'breeding'
  | 'pregnancy_check'
  | 'milk_record'
  | 'health_check'
  | 'emergency'
  | 'culling'
  | 'sale'
  | 'death';

export interface Farm {
  id: string;
  name: string;
  location: string;
  capacity: number;
  notes?: string;
  createdAt: string;
  governorate?: string; // المحافظة في سوريا
  district?: string; // المنطقة الإدارية
  ownerEmail?: string; // بريد المربي المسجل
  ownerName?: string; // اسم المربي
}

export interface RegistrationNotification {
  id: string;
  email: string;
  farmName: string;
  governorate: string;
  district: string;
  date: string;
  read: boolean;
}

export interface VisitAnnouncement {
  id: string;
  governorate: string;
  district: string;
  visitDate: string;
  title: string;
  description: string;
  createdAt: string;
  registrations: string[]; // farmIds or breeder emails who registered
}

export interface UserAccount {
  email: string;
  password?: string;
  username?: string;
  role: 'admin' | 'breeder';
  farmId?: string; // يربط المربي بمزرعته
  phone?: string; // رقم الهاتف
  nationalId?: string; // الرقم الوطني / رقم الهوية
  address?: string; // العنوان التفصيلي
}

export interface Cow {
  id: string; // Ear Tag ID (رقم السوار/القرط الدولي)
  rfid?: string; // رمز RFID الإلكتروني
  name?: string; // اسم البقرة أو اللقب
  breed: string; // السلالة (هولشتاين، جيرسي، بلدي، إلخ)
  birthDate: string; // تاريخ الميلاد
  entryDate: string; // تاريخ دخول المزرعة
  entryMethod: EntryMethod; // ولادة أم شراء
  purchasePrice?: number; // سعر الشراء بالعملة المحلية
  gender: 'female' | 'male'; // الجنس
  status: CowStatus; // الحالة الإنتاجية/الحيوية
  healthStatus: HealthStatus; // الحالة الصحية العامة
  weight: number; // الوزن الحالي بالكيلوغرام
  birthWeight?: number; // الوزن عند الولادة بالكيلوغرام
  color?: string; // لون البقرة
  barn?: string; // اسم الحظيرة (مثلاً: حظيرة الحوامل، حظيرة العجول)
  group?: string; // المجموعة (مثلاً: عالية الإنتاج، حديثة الولادة)
  farmId: string; // المزرعة التي تتبع لها
  motherId?: string; // رقم الأم (إن وجد)
  fatherId?: string; // رقم الأب (إن وجد)
  supplier?: string; // المورد (في حال الشراء)
  numberOfCalvings?: number; // عدد الولادات السابقة
  lastInseminationDate?: string; // تاريخ آخر تلقيح
  lastCalvingDate?: string; // تاريخ آخر ولادة
  milkStartOfSeasonDate?: string; // تاريخ بداية موسم الحليب
  milkYield?: number; // متوسط إنتاج الحليب اليومي (لتر)
  exitDate?: string; // تاريخ المغادرة (بيع، نفوق، استبعاد)
  exitReason?: ExitReason; // سبب المغادرة
  exitPrice?: number; // سعر البيع إن وجد
  exitNotes?: string; // ملاحظات الوفاة أو تفاصيل البيع والاستبعاد
  createdAt: string;
}

export interface CattleEvent {
  id: string;
  cowId: string;
  farmId: string;
  type: EventType;
  date: string;
  title: string;
  description: string;
  severity: 'normal' | 'warning' | 'critical';
  cost?: number; // تكاليف طبية، بيطرية، أو مصاريف
  recordedBy: string; // الشخص الذي سجل الحدث
  notes?: string;

  // --- Specialized Fields matching the 18 steps lifecycle ---
  // Vaccinations
  vaccineType?: 'FMD' | 'Brucella' | 'LSD' | 'Other';
  // Treatments & Emergency
  diagnosis?: string; // التشخيص الطبية
  treatmentDrug?: string; // الدواء
  treatmentDose?: string; // الجرعة
  doctorName?: string; // الطبيب المسؤول
  treatmentEndDate?: string; // تاريخ الانتهاء
  milkWithdrawalDays?: number; // فترة سحب الحليب (أيام)
  meatWithdrawalDays?: number; // فترة سحب اللحم (أيام)
  // Breeding (Artificial Insemination)
  breedingTechnician?: string; // فني التلقيح
  breedingBull?: string; // الثور الملقح
  breedingSemenStrawId?: string; // رقم قشة السائل المنوي
  breedingResult?: 'success' | 'failure' | 'pending' | 'repeat_heat';
  // Pregnancy check
  pregnancyStatus?: 'pregnant' | 'non_pregnant' | 'twins';
  pregnancyFetalAge?: number; // عمر الجنين بالشهور
  // Calving / Delivery
  calvingEase?: 'easy' | 'assisted' | 'difficult' | 'cesarean'; // سهولة الولادة
  calvingType?: string; // نوع الولادة
  calvingAssistant?: string; // المساعد
  calvingBabiesCount?: number; // عدد المواليد
  calvingBabyDetails?: string; // معلومات وجنس ووزن المواليد
  // Detailed Daily Milking Properties
  milkMorning?: number;
  milkNoon?: number;
  milkEvening?: number;
  milkFat?: number; // نسبة الدسم
  milkProtein?: number; // نسبة البروتين
  milkScc?: number; // الخلايا الجسدية SCC
  milkConductivity?: number; // التوصيل الكهربائي
  milkTemperature?: number; // درجة حرارة الحليب
  // Death / Loss
  deathCause?: string; // سبب النفوق
  burialPlace?: string; // مكان الدفن/التخلص
  cullingReason?: string; // سبب الاستبعاد
  // Weaning & Barn Transfer
  weaningAgeDays?: number; // عمر الفطام بالأيام
  newBarn?: string; // الحظيرة الجديدة المنقول إليها
}

export interface FarmStats {
  totalCows: number;
  milkingCows: number;
  pregnantCows: number;
  sickCows: number;
  soldCows: number;
  deceasedCows: number;
  totalMilkToday: number; // إجمالي إنتاج الحليب اليومي
  averageWeight: number;
  emergenciesCount: number; // إجمالي الأحداث الطارئة في الشهر الأخير
}
