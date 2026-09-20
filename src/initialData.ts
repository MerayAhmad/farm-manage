import { Farm, Cow, CattleEvent } from "./types";

export const INITIAL_FARMS: Farm[] = [
  {
    id: "farm-1",
    name: "مزرعة البركة النموذجية",
    location: "منطقة الرياض، المملكة العربية السعودية",
    capacity: 150,
    notes: "مزرعة مجهزة بأنظمة حلب آلية حديثة ووحدة رعاية بيطرية متكاملة.",
    createdAt: "2024-01-10"
  },
  {
    id: "farm-2",
    name: "مزرعة الروابي للألبان",
    location: "سهل البقاع، لبنان",
    capacity: 80,
    notes: "مزرعة متخصصة في تربية سلالات الحليب العالي لإنتاج الأجبان.",
    createdAt: "2024-05-15"
  }
];

export const INITIAL_COWS: Cow[] = [
  {
    id: "COW-1001",
    name: "جميلة",
    breed: "هولشتاين -Holstein",
    birthDate: "2021-03-12",
    entryDate: "2021-03-12",
    entryMethod: "birth",
    gender: "female",
    status: "milking",
    healthStatus: "excellent",
    weight: 620,
    farmId: "farm-1",
    motherId: "COW-0900",
    milkYield: 32,
    createdAt: "2021-03-12T00:00:00.000Z"
  },
  {
    id: "COW-1002",
    name: "نجمة",
    breed: "جيرسي - Jersey",
    birthDate: "2022-01-05",
    entryDate: "2023-04-10",
    entryMethod: "purchase",
    purchasePrice: 4500,
    gender: "female",
    status: "pregnant",
    healthStatus: "stable",
    weight: 510,
    farmId: "farm-1",
    motherId: "MOCK-MOM",
    milkYield: 18,
    createdAt: "2023-04-10T00:00:00.000Z"
  },
  {
    id: "COW-1003",
    name: "بسمة",
    breed: "سيمنتال - Simmental",
    birthDate: "2023-08-20",
    entryDate: "2023-08-20",
    entryMethod: "birth",
    gender: "female",
    status: "heifer",
    healthStatus: "excellent",
    weight: 340,
    farmId: "farm-2",
    motherId: "COW-1001",
    createdAt: "2023-08-20T00:00:00.000Z"
  },
  {
    id: "COW-1004",
    name: "شهاب",
    breed: "هولشتاين -Holstein",
    birthDate: "2024-05-01",
    entryDate: "2024-05-01",
    entryMethod: "birth",
    gender: "male",
    status: "calf",
    healthStatus: "under_treatment",
    weight: 120,
    farmId: "farm-1",
    motherId: "COW-1002",
    createdAt: "2024-05-01T00:00:00.000Z"
  },
  {
    id: "COW-1005",
    name: "بدرة",
    breed: "بلدي محسّن",
    birthDate: "2020-02-15",
    entryDate: "2021-11-20",
    entryMethod: "purchase",
    purchasePrice: 3200,
    gender: "female",
    status: "sick",
    healthStatus: "critical",
    weight: 480,
    farmId: "farm-2",
    milkYield: 8,
    createdAt: "2021-11-20T00:00:00.000Z"
  },
  // Sold Cow
  {
    id: "COW-1006",
    name: "سخية",
    breed: "جيرسي - Jersey",
    birthDate: "2019-06-18",
    entryDate: "2019-06-18",
    entryMethod: "birth",
    gender: "female",
    status: "sold",
    healthStatus: "stable",
    weight: 540,
    farmId: "farm-1",
    exitDate: "2025-06-10",
    exitReason: "sale",
    exitPrice: 5800,
    exitNotes: "تم بيعها لتاجر محلي لتقليص حجم القطيع والتركيز على سلالات أخرى.",
    createdAt: "2019-06-18T00:00:00.000Z"
  },
  // Deceased Cow
  {
    id: "COW-1007",
    name: "عبلة",
    breed: "هولشتاين -Holstein",
    birthDate: "2022-10-14",
    entryDate: "2022-10-14",
    entryMethod: "birth",
    gender: "female",
    status: "deceased",
    healthStatus: "critical",
    weight: 420,
    farmId: "farm-2",
    exitDate: "2026-02-05",
    exitReason: "death",
    exitNotes: "وفاة مفاجئة بسبب التفاف الأنفحة الحاد وهبوط الدورة الدموية رغم التدخل الإسعافي السريع.",
    createdAt: "2022-10-14T00:00:00.000Z"
  }
];

export const INITIAL_EVENTS: CattleEvent[] = [
  {
    id: "evt-1",
    cowId: "COW-1001",
    farmId: "farm-1",
    type: "birth",
    date: "2021-03-12",
    title: "ولادة البقرة 'جميلة'",
    description: "ولدت البقرة جميلة في المزرعة ولادة طبيعية وصحة ممتازة بوزن 40 كجم.",
    severity: "normal",
    recordedBy: "م. أحمد الشمري",
    notes: "الأم بقرة عالية الإنتاج رقم COW-0900"
  },
  {
    id: "evt-2",
    cowId: "COW-1001",
    farmId: "farm-1",
    type: "vaccination",
    date: "2025-01-15",
    title: "لقاح الحمى القلاعية",
    description: "تم تحصين البقرة بالجرعة الدورية ضد مرض الحمى القلاعية والجدري.",
    severity: "normal",
    cost: 150,
    recordedBy: "د. ياسر العتيبي",
    notes: "لا توجد أعراض جانبية بعد اللقاح."
  },
  {
    id: "evt-3",
    cowId: "COW-1002",
    farmId: "farm-1",
    type: "breeding",
    date: "2025-02-20",
    title: "تلقيح اصطناعي ناجح",
    description: "تلقيح اصطناعي باستخدام سائل منوي مجمد مستورد من سلالة جيرسي نقية.",
    severity: "normal",
    cost: 400,
    recordedBy: "د. ياسر العتيبي",
    notes: "تم التأكد من الحمل لاحقاً بالفحص بالأشعة التلفزيونية (السونار)."
  },
  {
    id: "evt-4",
    cowId: "COW-1005",
    farmId: "farm-2",
    type: "emergency",
    date: "2026-07-15",
    title: "اشتباه بالتهاب الضرع الحاد (Mastitis)",
    description: "لوحظ انتفاخ واحمرار في الربع الخلفي الأيسر للضرع مع حرارة مرتفعة وهبوط حاد في إنتاج الحليب.",
    severity: "critical",
    cost: 650,
    recordedBy: "د. سامي الحداد",
    notes: "تم عزل البقرة فوراً وبدء كورس مضادات حيوية ومضادات التهاب بالوريد."
  },
  {
    id: "evt-5",
    cowId: "COW-1004",
    farmId: "farm-1",
    type: "health_check",
    date: "2026-07-18",
    title: "متابعة علاج إسهال العجول",
    description: "فحص العجل شهاب بعد إصابته بجفاف وإسهال بكتيري. تم إعطاؤه محاليل تعويضية ومضاد حيوي.",
    severity: "warning",
    cost: 220,
    recordedBy: "د. ياسر العتيبي",
    notes: "تتحسن حالته تدريجياً وبدأ يرضع بصورة طبيعية."
  },
  {
    id: "evt-6",
    cowId: "COW-1007",
    farmId: "farm-2",
    type: "emergency",
    date: "2026-02-05",
    title: "حالة طارئة: انتفاخ حاد والتفاف الأنفحة",
    description: "هبوط حاد ومفاجئ في العلامات الحيوية مع انتفاخ شديد بالكرش وضيق تنفس.",
    severity: "critical",
    cost: 1200,
    recordedBy: "د. سامي الحداد",
    notes: "تم إجراء جراحة إسعافية طارئة ولكن لم تنجُ البقرة وتوفيت أثناء الجراحة بسبب صدمة قلبية."
  },
  {
    id: "evt-7",
    cowId: "COW-1007",
    farmId: "farm-2",
    type: "death",
    date: "2026-02-05",
    title: "تسجيل حالة وفاة رسمية",
    description: "إعلان وفاة البقرة عبلة وتم اتخاذ الإجراءات الصحية للتخلص الآمن من الجثة بالدفن الصحي.",
    severity: "critical",
    recordedBy: "د. سامي الحداد",
    notes: "السبب: التواء الأنفحة الحاد (Abomasal Displacement)."
  },
  {
    id: "evt-8",
    cowId: "COW-1006",
    farmId: "farm-1",
    type: "sale",
    date: "2025-06-10",
    title: "بيع البقرة سلالة جيرسي",
    description: "بيع البقرة 'سخية' بسعر تجاري مميز لغرض تجديد الدماء في المزرعة.",
    severity: "normal",
    cost: -5800, // سلبية لتعني عائداً مادياً
    recordedBy: "م. أحمد الشمري",
    notes: "المشتري: تاجر أبقار معتمد - شركة نماء الحيوانية."
  }
];
