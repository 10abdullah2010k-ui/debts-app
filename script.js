// script.js

// -->> هذا هو السطر المهم الذي يجب تغييره <<--
const apiUrl = 'https://my-debts-app.vercel.app/api/debts';

document.addEventListener('DOMContentLoaded', ( ) => {
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
            creditorName: document.getElementById('creditorName').value,
            amount: parseFloat(document.getElementById('amount').value),
            dueDate: document.getElementById('dueDate').value,
            description: document.getElementById('description').value,
            isPaid: document.getElementById('isPaid').checked,
            debtType: document.querySelector('input[name="debtType"]:checked').value
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDebt),
            });

            if (!response.ok) {
                throw new Error('حدث خطأ أثناء إضافة الدين');
            }

            const addedDebt = await response.json();
            addDebtToTable(addedDebt); // إضافة الدين الجديد إلى الجدول
            debtForm.reset();
            debtFormContainer.style.display = 'none';
            addDebtBtn.style.display = 'block';

        } catch (error) {
            console.error('Error:', error);
            alert('فشل في إضافة الدين. الرجاء المحاولة مرة أخرى.');
        }
    });

    // جلب وعرض الديون عند تحميل الصفحة
    async function fetchAndDisplayDebts() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('فشل في جلب البيانات');
            }
            const debts = await response.json();
            const debtsTableBody = document.getElementById('debts-table-body');
            debtsTableBody.innerHTML = ''; // مسح الجدول قبل إضافة البيانات الجديدة
            debts.forEach(addDebtToTable);
        } catch (error) {
            console.error('Error:', error);
            alert('فشل في تحميل قائمة الديون.');
        }
    }

    // دالة لإضافة صف دين إلى الجدول
    function addDebtToTable(debt) {
        const debtsTableBody = document.getElementById('debts-table-body');
        const row = document.createElement('tr');

        // تحديد لون الصف بناءً على نوع الدين
        row.classList.add(debt.debtType === 'payable' ? 'payable' : 'receivable');

        row.innerHTML = `
            <td>${debt.creditorName}</td>
            <td>${debt.amount}</td>
            <td>${new Date(debt.dueDate).toLocaleDateString()}</td>
            <td>${debt.description}</td>
            <td>${debt.isPaid ? 'نعم' : 'لا'}</td>
            <td>
                <button class="delete-btn" data-id="${debt._id}">حذف</button>
            </td>
        `;
        debtsTableBody.appendChild(row);
    }

    // التعامل مع حذف الدين
    document.getElementById('debts-table-body').addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const debtId = e.target.dataset.id;
            
            if (confirm('هل أنت متأكد من أنك تريد حذف هذا الدين؟')) {
                try {
                    const response = await fetch(`${apiUrl}/${debtId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        throw new Error('فشل في حذف الدين');
                    }

                    // إزالة الصف من الجدول في الواجهة
                    e.target.closest('tr').remove();

                } catch (error) {
                    console.error('Error:', error);
                    alert('فشل في حذف الدين. الرجاء المحاولة مرة أخرى.');
                }
            }
        }
    });

    // استدعاء الدالة لجلب البيانات عند تحميل الصفحة
    fetchAndDisplayDebts();
});
