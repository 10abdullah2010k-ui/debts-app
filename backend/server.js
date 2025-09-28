// server.js

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
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

// دالة للاتصال بقاعدة البيانات
async function connectDB() {
  try {
    await client.connect();
    db = client.db('debtsDB');
    console.log('تم الاتصال بنجاح بقاعدة بيانات MongoDB');
  } catch (err) {
    console.error('فشل الاتصال بقاعدة البيانات', err);
    process.exit(1);
  }
}

// 4. نقاط النهاية (API Endpoints)
// نقطة نهاية لجلب كل الديون (GET)
app.get('/api/debts', async (req, res) => {
  try {
    const debts = await db.collection('debtsCollection').find({}).toArray();
    res.json(debts);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// نقطة نهاية لإضافة دين جديد (POST)
app.post('/api/debts', async (req, res) => {
  try {
    const newDebt = req.body;
    const result = await db.collection('debtsCollection').insertOne(newDebt);
    const insertedDebt = await db.collection('debtsCollection').findOne({ _id: result.insertedId });
    console.log('تم إضافة دين جديد بنجاح:', insertedDebt);
    res.status(201).json(insertedDebt);
  } catch (err) {
    console.error("خطأ في نقطة النهاية POST:", err);
    res.status(500).json({ message: 'خطأ في إضافة الدين' });
  }
});

// --- نقطة النهاية الجديدة للحذف ---
app.delete('/api/debts/:id', async (req, res) => {
  try {
    const { id } = req.params; // الحصول على id الدين من الرابط
    
    // التحقق من أن الـ id صالح قبل استخدامه
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'معرف الدين غير صالح' });
    }

    const result = await db.collection('debtsCollection').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'لم يتم العثور على الدين' });
    }

    res.status(200).json({ message: 'تم حذف الدين بنجاح' });
  } catch (err) {
    console.error("خطأ في نقطة النهاية DELETE:", err);
    res.status(500).json({ message: 'خطأ في حذف الدين' });
  }
});


// 5. تشغيل الخادم والاتصال بقاعدة البيانات
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`السيرفر يعمل الآن على الرابط http://localhost:${port}` );
  });
});
