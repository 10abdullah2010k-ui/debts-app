// script.js

document.addEventListener('DOMContentLoaded', () => {
    const addDebtBtn = document.getElementById('add-debt-btn');
    const debtFormContainer = document.getElementById('debt-form-container');
    const debtForm = document.getElementById('debt-form');
    const cancelBtn = document.getElementById('cancel-btn');

    // إظهار نموذج الإضافة عند الضغط على الزر
    addDebtBtn.addEventListener('click', () => {
        debtFormContainer.style.display = 'block';
        addDebtBtn.style.display = 'none';
    });

    // إخفاء النموذج عند الضغط على إلغاء
    cancelBtn.addEventListener('click', () => {
        debtFormContainer.style.display = 'none';
        addDebtBtn.style.display = 'block';
        debtForm.reset();
    });

    // التعامل مع إرسال النموذج
    debtForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newDebt = {
            name: document.getElementById('creditorName').value,
            amount: parseFloat(document.getElementById('amount').value),
            type: document.getElementById('type').value,
            dueDate: document.getElementById('dueDate').value,
            notes: document.getElementById('notes').value,
            isPaid: document.getElementById('isPaid').checked,
        };

        try {
            const response = await fetch('http://localhost:3000/api/debts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDebt ),
            });

            if (!response.ok) {
                throw new Error('فشل في حفظ الدين');
            }

            // إعادة تحميل قائمة الديون وتحديثها
            fetchDebts();

            // إخفاء النموذج وإعادة تعيينه
            debtFormContainer.style.display = 'none';
            addDebtBtn.style.display = 'block';
            debtForm.reset();

        } catch (error) {
            console.error('خطأ:', error);
            alert('حدث خطأ أثناء حفظ الدين.');
        }
    });

    // جلب وعرض الديون عند تحميل الصفحة
    fetchDebts();
});

// دالة لجلب الديون من الخادم
async function fetchDebts() {
    try {
        const response = await fetch('http://localhost:3000/api/debts' );
        if (!response.ok) {
            throw new Error('فشل جلب البيانات');
        }
        const debts = await response.json();
        displayDebts(debts);
    } catch (error) {
        console.error('خطأ:', error);
    }
}

// --- دالة عرض الديون المحدثة (مع زر الحذف) ---
function displayDebts(debts) {
    const debtList = document.getElementById('debt-list');
    debtList.innerHTML = '';
    debts.forEach(debt => {
        const debtItem = document.createElement('div');
        debtItem.className = 'debt-item';
        // تغيير لون الشريط الجانبي بناءً على نوع الدين
        debtItem.style.borderLeftColor = debt.type === 'on-me' ? '#dc3545' : '#28a745';

        debtItem.innerHTML = `
            <div class="debt-details">
                <strong>${debt.name}</strong>
                <span>المبلغ: ${debt.amount} ريال</span>
                <span>تاريخ الاستحقاق: ${new Date(debt.dueDate).toLocaleDateString('ar-SA')}</span>
            </div>
            <div class="debt-actions">
                <button class="delete-btn" data-id="${debt._id}">حذف</button>
            </div>
        `;
        debtList.appendChild(debtItem);
    });
}

// --- كود جديد: الاستماع للنقرات على قائمة الديون (لحذف دين) ---
document.getElementById('debt-list').addEventListener('click', async (e) => {
    // التأكد من أن المستخدم ضغط على زر الحذف
    if (e.target.classList.contains('delete-btn')) {
        const debtId = e.target.dataset.id; // الحصول على ID الدين من الزر
        
        if (confirm('هل أنت متأكد من أنك تريد حذف هذا الدين؟')) {
            try {
                const response = await fetch(`http://localhost:3000/api/debts/${debtId}`, {
                    method: 'DELETE',
                } );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'فشل حذف الدين من الخادم');
                }

                // إعادة تحميل قائمة الديون من الخادم لعرضها محدثة
                fetchDebts(); 
                
            } catch (error) {
                console.error('خطأ:', error);
                alert(`حدث خطأ أثناء محاولة حذف الدين: ${error.message}`);
            }
        }
    }
});
