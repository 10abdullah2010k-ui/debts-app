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
        process.exit(1); // إنهاء العملية إذا فشل الاتصال
    }
}

// 4. نقاط النهاية (API Endpoints)

// جلب كل الديون
app.get('/api/debts', async (req, res) => {
    try {
        const debts = await db.collection('debts').find({}).toArray();
        res.json(debts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// إضافة دين جديد
app.post('/api/debts', async (req, res) => {
    try {
        const newDebt = req.body;
        const result = await db.collection('debts').insertOne(newDebt);
        // نرسل المستند الذي تم إدراجه بالكامل للواجهة الأمامية
        res.status(201).json(result.ops[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// حذف دين
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


// 5. تشغيل الخادم والاتصال بقاعدة البيانات
connectDB().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`الخادم يعمل على المنفذ ${port}`);
    });
});
