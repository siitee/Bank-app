import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Paper, Typography, Box, Tabs, Tab } from '@mui/material';
import './CalculatorPage.css';
import { sendCalculationResults } from '../services/EmailService';

const DEFAULT_CONFIGS = {
  mortgage: {
    loanType: 'mortgage',
    title: 'Ипотека',
    interestRate: 9.6,
    minAmount: 100000,
    maxAmount: 5000000,
    minTerm: 1,
    maxTerm: 30,
    minDownPayment: 10,
    maxDownPayment: 90
  },
  auto: {
    loanType: 'auto',
    title: 'Автокредит',
    interestRate: 3.5,
    minAmount: 100000,
    maxAmount: 3000000,
    minTerm: 1,
    maxTerm: 7,
    minDownPayment: 15,
    maxDownPayment: 80
  },
  consumer: {
    loanType: 'consumer',
    title: 'Потребительский кредит',
    interestRate: 14.5,
    minAmount: 50000,
    maxAmount: 1000000,
    minTerm: 1,
    maxTerm: 5,
    minDownPayment: 0,
    maxDownPayment: 0
  },
  education: {
    loanType: 'education',
    title: 'Кредит на образование',
    interestRate: 7.9,
    minAmount: 50000,
    maxAmount: 2000000,
    minTerm: 1,
    maxTerm: 10,
    minDownPayment: 0,
    maxDownPayment: 0
  },
  business: {
    loanType: 'business',
    title: 'Кредит для бизнеса',
    interestRate: 12.0,
    minAmount: 500000,
    maxAmount: 10000000,
    minTerm: 1,
    maxTerm: 15,
    minDownPayment: 20,
    maxDownPayment: 60
  }
};

export default function CreditCalculator() {
  const [loanTypes, setLoanTypes] = useState([]);
  const [loanType, setLoanType] = useState('mortgage');
  const [propertyValue, setPropertyValue] = useState('');
  const [term, setTerm] = useState(5);
  const [downPayment, setDownPayment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [result, setResult] = useState(null);


useEffect(() => {
  const savedConfigs = localStorage.getItem('loanConfigs');
  if (savedConfigs) {
    setLoanTypes(JSON.parse(savedConfigs));
  } else {
    const initialConfigs = Object.values(DEFAULT_CONFIGS);
    setLoanTypes(initialConfigs);
    localStorage.setItem('loanConfigs', JSON.stringify(initialConfigs));
  }
}, []);

const handleSendEmail = async () => {
  try {
    if (!userEmail || !result) {
      throw new Error("Заполните email и сделайте расчёт");
    }

    const currentLoan = loanTypes.find(loan => loan.loanType === loanType);
    const response = await sendCalculationResults(
      userEmail,
      {
        monthlyPayment: result.monthlyPayment,
        totalPayment: result.totalPayment,
        overpayment: result.overpayment,
        loanType: currentLoan ? currentLoan.title : loanType
      }
    );

    alert(`Результаты отправлены на ${userEmail}`);
  } catch (error) {
    alert(`Ошибка: ${error.message}`);
    console.error("Детали ошибки:", error);
  }
};

const calculateLoan = () => {
  if (propertyValue === '' || (loanType !== 'consumer' && downPayment === '')) return;
  
  const currentLoan = loanTypes.find(loan => loan.loanType === loanType);
  if (!currentLoan) return;
  
  const loanAmount = loanType === 'consumer' 
    ? Number(propertyValue) 
    : Number(propertyValue) - Number(downPayment);
  
  const monthlyRate = currentLoan.interestRate / 12 / 100;
  const months = term * 12;
  
  const totalRate = Math.pow(1 + monthlyRate, months);
  const monthlyPayment = loanAmount * monthlyRate * totalRate / (totalRate - 1);
  
  setResult({
    monthlyPayment,
    totalPayment: monthlyPayment * months,
    overpayment: monthlyPayment * months - loanAmount,
    requiredIncome: monthlyPayment * 2.5,
    loanAmount
  });
};

const handleLoanTypeChange = (newType) => {
  setLoanType(newType);
  setResult(null);
};

const getInputLabel = () => {
  const currentLoan = loanTypes.find(loan => loan.loanType === loanType);
  if (!currentLoan) return 'Сумма кредита';
  
  switch(loanType) {
    case 'mortgage': return 'Стоимость недвижимости';
    case 'auto': return 'Стоимость автомобиля';
    case 'education': return 'Стоимость обучения';
    case 'business': return 'Необходимая сумма';
    default: return 'Сумма кредита';
  }
};

const getAvailableTerms = () => {
  const currentLoan = loanTypes.find(loan => loan.loanType === loanType);
  if (!currentLoan) return [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];
  
  const terms = [];
  for (let i = currentLoan.minTerm; i <= currentLoan.maxTerm; i++) {
    terms.push(i);
  }
  return terms;
};

const getCurrentInterestRate = () => {
  const currentLoan = loanTypes.find(loan => loan.loanType === loanType);
  return currentLoan ? currentLoan.interestRate : 0;
};

  return (
    <Box className="calculator-container">
      <Paper elevation={3} className="calculator-paper">
        <Typography variant="h5" gutterBottom className="calculator-title">
          Банковский калькулятор
        </Typography>

        {loanTypes.length > 0 && (
          <Tabs 
            value={loanType} 
            onChange={(_, newValue) => handleLoanTypeChange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            className="calculator-tabs"
          >
            {loanTypes.map((loan) => (
              <Tab 
                key={loan.loanType} 
                label={`${loan.title} (${loan.interestRate}%)`} 
                value={loan.loanType} 
              />
            ))}
          </Tabs>
        )}

        <Box className="calculator-form">
          <Box className="calculator-form-section">
            <TextField
              label={getInputLabel()}
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value ? e.target.value : '')}
              fullWidth
              type="number"
              className="calculator-field"
            />

            {loanType !== 'consumer' && (
              <TextField
                label="Первоначальный взнос"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value ? e.target.value : '')}
                fullWidth
                type="number"
                className="calculator-field"
              />
            )}

            <TextField
              label={`Срок (${term} ${term === 1 ? 'год' : term < 5 ? 'года' : 'лет'})`}
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              fullWidth
              className="calculator-field"
              select
            >
              {getAvailableTerms().map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Процентная ставка"
              value={getCurrentInterestRate()}
              fullWidth
              type="number"
              className="calculator-field"
              InputProps={{
                endAdornment: '%',
                readOnly: true
              }}
            />

            <TextField
              label="Ваш email для отправки результатов"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              fullWidth
              type="email"
              className="calculator-field"
            />

            <Button
              variant="contained"
              onClick={calculateLoan}
              fullWidth
              size="large"
              disabled={propertyValue === '' || (loanType !== 'consumer' && downPayment === '')}
              className="calculator-button"
            >
              Рассчитать
            </Button>
          </Box>

          <Box className="calculator-form-section">
            {result && (
              <Box className="calculator-result">
                <Typography variant="h6" gutterBottom className="calculator-result-title">
                  Результаты расчета {loanTypes.find(loan => loan.loanType === loanType)?.title || loanType}
                </Typography>

                <Box className="calculator-result-content">
                  <Typography>Сумма кредита: <strong>{result.loanAmount.toLocaleString()} ₽</strong></Typography>
                  <Typography>Ежемесячный платеж: <strong>{result.monthlyPayment.toFixed(2)} ₽</strong></Typography>
                  <Typography>Общая сумма выплат: <strong>{result.totalPayment.toLocaleString()} ₽</strong></Typography>
                  <Typography>Переплата: <strong>{result.overpayment.toLocaleString()} ₽</strong></Typography>
                  {loanType !== 'business' && (
                    <Typography>Необходимый доход: <strong>{result.requiredIncome.toLocaleString()} ₽</strong></Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendEmail}
                  disabled={!userEmail || !result}
                  className="calculator-send-button"
                >
                  Отправить результаты на email
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}