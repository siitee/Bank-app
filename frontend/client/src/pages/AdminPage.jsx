import React, { useState, useEffect } from 'react';
import './AdminPage.css';

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

const loanTitles = Object.keys(DEFAULT_CONFIGS).reduce((acc, key) => {
  acc[key] = DEFAULT_CONFIGS[key].title;
  return acc;
}, {});

const AdminPage = () => {
  const [configs, setConfigs] = useState([]);
  const [results, setResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentConfigId, setCurrentConfigId] = useState(null);
  const [formData, setFormData] = useState({
    loanType: '',
    title: '',
    interestRate: '',
    minAmount: '',
    maxAmount: '',
    minTerm: '',
    maxTerm: '',
    minDownPayment: '',
    maxDownPayment: ''
  });

  useEffect(() => {
    const savedConfigs = localStorage.getItem('loanConfigs');
    if (savedConfigs) {
      setConfigs(JSON.parse(savedConfigs));
    } else {
      const initialConfigs = Object.values(DEFAULT_CONFIGS);
      setConfigs(initialConfigs);
      localStorage.setItem('loanConfigs', JSON.stringify(initialConfigs));
    }
    
    setResults([{
      id: 1,
      params: { 
        loanType: 'mortgage',
        email: 'test@test.com',
        amount: 2000000,
        term: 10,
        downPayment: 30
      },
      result: { monthlyPayment: 18500 },
      createdAt: new Date()
    }]);
  }, []);

  useEffect(() => {
    if (configs.length > 0) {
      localStorage.setItem('loanConfigs', JSON.stringify(configs));
    }
  }, [configs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentConfigId !== null) {
      setConfigs(prev => prev.map(config => 
        config.loanType === currentConfigId ? { ...formData } : config
      ));
    } else {
      setConfigs(prev => [...prev, { 
        ...formData,
        title: formData.title || `Кредит ${formData.loanType}`
      }]);
    }
    
    setIsModalOpen(false);
    setCurrentConfigId(null);
  };

  const handleDelete = (loanType) => {
    if (window.confirm(`Удалить конфиг "${formData.title || loanType}"?`)) {
      setConfigs(prev => prev.filter(config => config.loanType !== loanType));
    }
  };

  const handleEdit = (config) => {
    setFormData(config);
    setCurrentConfigId(config.loanType);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      loanType: '',
      title: '',
      interestRate: '',
      minAmount: '',
      maxAmount: '',
      minTerm: '',
      maxTerm: '',
      minDownPayment: '',
      maxDownPayment: ''
    });
    setCurrentConfigId(null);
    setIsModalOpen(true);
  };
  
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Админ-панель</h2>
        <div>
          <button 
            className="admin-button add-button"
            onClick={handleAddNew}
          >
            + Добавить калькулятор
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h3>Конфигурации калькуляторов</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Тип кредита</th>
              <th>Название</th>
              <th>Ставка (%)</th>
              <th>Сумма</th>
              <th>Срок</th>
              <th>Перв. взнос</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {configs.map(config => (
              <tr key={config.loanType}>
                <td>{config.loanType}</td>
                <td>{config.title}</td>
                <td>{config.interestRate}%</td>
                <td>{config.minAmount.toLocaleString()} - {config.maxAmount.toLocaleString()} ₽</td>
                <td>{config.minTerm} - {config.maxTerm} лет</td>
                <td>{config.minDownPayment} - {config.maxDownPayment}%</td>
                <td>
                  <button 
                    className="admin-button edit-button"
                    onClick={() => handleEdit(config)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="admin-button delete-button"
                    onClick={() => handleDelete(config.loanType)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{currentConfigId ? 'Редактирование' : 'Создание'} калькулятора</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Тип кредита:</label>
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleInputChange}
                  disabled={!!currentConfigId}
                  required
                >
                  <option value="">Выберите тип</option>
                  {Object.keys(loanTitles).map(type => (
                    <option key={type} value={type}>{loanTitles[type]}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Процентная ставка (%):</label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Мин. сумма (₽):</label>
                  <input
                    type="number"
                    name="minAmount"
                    value={formData.minAmount}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Макс. сумма (₽):</label>
                  <input
                    type="number"
                    name="maxAmount"
                    value={formData.maxAmount}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Мин. срок (лет):</label>
                  <input
                    type="number"
                    name="minTerm"
                    value={formData.minTerm}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Макс. срок (лет):</label>
                  <input
                    type="number"
                    name="maxTerm"
                    value={formData.maxTerm}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Мин. первоначальный взнос (%):</label>
                  <input
                    type="number"
                    name="minDownPayment"
                    value={formData.minDownPayment}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Макс. первоначальный взнос (%):</label>
                  <input
                    type="number"
                    name="maxDownPayment"
                    value={formData.maxDownPayment}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="save-button"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;