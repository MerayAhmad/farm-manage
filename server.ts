import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize Gemini client on the server side
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not defined. AI features will be unavailable.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API:", error);
}

// AI Endpoint: Cow Health and Condition Analyzer
app.post("/api/ai/analyze-cow", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "الخدمة الذكية غير متوفرة حالياً لعدم وجود مفتاح API." });
  }

  const { cow, logs } = req.body;
  if (!cow) {
    return res.status(400).json({ error: "يرجى تقديم بيانات البقرة." });
  }

  const prompt = `
أنت خبير بيطري ومستشار متخصص في إدارة مزارع الأبقار وإنتاج الحليب.
قم بتحليل حالة البقرة التالية وقدم تقريراً مفصلاً ونصائح طبية وعملية باللغة العربية الفصحى.

بيانات البقرة:
- المعرف/الاسم: ${cow.name || cow.id}
- السلالة: ${cow.breed}
- العمر: ${cow.age} شهر
- الحالة الحالية: ${cow.status} (مثلاً: حلب، جافة، تلقيح، مريضة، طارئة، إلخ)
- طريقة الدخول: ${cow.entryMethod === 'birth' ? 'ولادة في المزرعة' : 'شراء'}
- الوزن الحالي: ${cow.weight} كجم
- إنتاج الحليب اليومي (إن وجد): ${cow.milkYield || 0} لتر/يوم
- الحالة الصحية العامة: ${cow.healthStatus}

سجل الأحداث الطبية والطارئة الأخير:
${JSON.stringify(logs || [], null, 2)}

المطلوب تقديم تقرير منظم يشمل:
1. تقييم سريع للحالة العامة والوزن والإنتاجية مقارنة بسنها وسلالتها.
2. نصائح غذائية مخصصة لزيادة الإنتاجية أو تحسين الصحة.
3. التوصيات الطبية والتحصينات (اللقاحات) المطلوبة في هذه المرحلة.
4. إرشادات خاصة بالتعامل مع الأحداث الطارئة أو الأمراض المسجلة في تاريخها إن وجدت.
5. خطة رعاية مستقبلية مقترحة.

يرجى صياغة التقرير بأسلوب مهني ومقنع وواضح ومريح للقراءة مع استخدام التنسيق المناسب (نقاط، عناوين عريضة).
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini Error during cow analysis:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي." });
  }
});

// AI Endpoint: General Farm Advice & Q&A
app.post("/api/ai/farm-advice", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "الخدمة الذكية غير متوفرة حالياً لعدم وجود مفتاح API." });
  }

  const { query, farmDetails } = req.body;
  if (!query) {
    return res.status(400).json({ error: "يرجى كتابة السؤال أو الاستفسار." });
  }

  const prompt = `
أنت طبيب بيطري ومستشار خبير في إدارة مزارع الأبقار وتدير تطبيق "مراعي" الذكي.
أجب عن استفسار المزارع باللغة العربية الفصحى وبشكل علمي وعملي ومبسط.

تفاصيل المزرعة الحالية (إن وجدت):
- عدد الأبقار الكلي: ${farmDetails?.cowsCount || 0}
- الموقع/الاسم: ${farmDetails?.name || 'غير محدد'}

استفسار المزارع:
"${query}"

يرجى تقديم إجابة شاملة ومنظمة تغطي الجوانب الطبية، الغذائية، أو الإدارية المطلوبة مع نصائح وقائية لحماية القطيع.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Gemini Error during farm advice:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء معالجة الاستفسار." });
  }
});

// Setup Vite Dev Middleware / Production static file server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cattle Farm Management Server running on port ${PORT}`);
  });
}

startServer();
