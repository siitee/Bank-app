export const sendCalculationResults = async (userEmail, results) => {
  try {
    const response = await fetch('http://localhost:5000/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: userEmail,
        results: {
          monthlyPayment: results.monthlyPayment?.toFixed(2),
          totalPayment: results.totalPayment?.toFixed(2),
          loanType: results.loanType || "Кредит"
        }
      }),
    });

    if (!response.ok) throw new Error('Ошибка сервера');
    return await response.json();
  } catch (error) {
    throw new Error(`Ошибка отправки: ${error.message}`);
  }
};