export const ResultDisplay = ({ result, onEmailOpen }) => {
  if (!result) return null;

  return (
    <div className="results">
      <h3>Результаты расчета</h3>
      <p>Ежемесячный платеж: {result.monthlyPayment} ₽</p>
      <p>Общая переплата: {result.overpayment} ₽</p>
      <button onClick={onEmailOpen}>Отправить на email</button>
    </div>
  );
};