export const CalculatorSelector = ({ loanType, onChange }) => (
  <div className="selector">
    <button 
      className={loanType === 'mortgage' ? 'active' : ''}
      onClick={() => onChange('mortgage')}
    >
      Ипотека
    </button>
    <button
      className={loanType === 'auto' ? 'active' : ''}
      onClick={() => onChange('auto')}
    >
      Автокредит
    </button>
  </div>
);