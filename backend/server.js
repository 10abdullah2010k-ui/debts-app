// 1. استيراد المكتبات الأساسية
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// 2. إعدادات التطبيق
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

// 3. إعدادات الاتصال بقاعدة البيانات
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
let db;

// دالة للاتصال بقاعدة البيانات
async function connectDB() {
    try {
        await client.connect();
        db = client.db('debts_db'); // اسم قاعدة البيانات
        console.log("تم الاتصال بنجاح بقاعدة بيانات MongoDB");
    } catch (err) {
        console.error("فشل الاتصال بقاعدة البيانات:", err);
        process.exit(1);
    }
}

// 4. نقاط نهاية الديون (Debts API) - (سيتم تأمينها لاحقاً)

// جلب كل الديون (مؤقتاً، سيتم التعديل)
app.get('/api/debts', async (req, res) => {
    try {
        const debts = await db.collection('debts').find({}).toArray();
        res.json(debts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// إضافة دين جديد (مؤقتاً، سيتم التعديل)
app.post('/api/debts', async (req, res) => {
    try {
        const newDebt = req.body;
        const result = await db.collection('debts').insertOne(newDebt);
        res.status(201).json(result.ops[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// حذف دين (مؤقتاً، سيتم التعديل)
app.delete('/api/debts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('debts').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.status(200).json({ message: "تم حذف الدين بنجاح" });
        } else {
            res.status(404).json({ message: "لم يتم العثور على الدين" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 6. نقاط نهاية المصادقة (Authentication)

// إنشاء حساب جديد
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // التحقق مما إذا كان البريد الإلكتروني موجوداً بالفعل
        const existingUser = await db.collection('users').findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "هذا البريد الإلكتروني مستخدم بالفعل." });
        }

        // حفظ المستخدم الجديد (كلمة المرور كنص عادي بناءً على طلبك)
        const result = await db.collection('users').insertOne({ email, password });
        
        // إرسال المستخدم الجديد كاستجابة (بدون كلمة المرور)
        res.status(201).json({
            _id: result.insertedId,
            email: email
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // البحث عن المستخدم عن طريق البريد الإلكتروني
        const user = await db.collection('users').findOne({ email: email });

        // التحقق مما إذا كان المستخدم موجوداً وكلمة المرور متطابقة
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
        }
        
        // إرسال بيانات المستخدم كاستجابة (بدون كلمة المرور)
        res.status(200).json({
            _id: user._id,
            email: user.email
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// 7. تشغيل الخادم والاتصال بقاعدة البيانات
connectDB().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`الخادم يعمل على المنفذ ${port}`);
    });
});
