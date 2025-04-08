import api from './api';

export const getCalculatorConfigs = async () => {
  const response = await api.get('/admin/calculators');
  return response.data;
};

export const getCalculatorConfig = async (loanType) => {
  const response = await api.get(`/admin/calculators/${loanType}`);
  return response.data;
};

export const createCalculatorConfig = async (config) => {
  const response = await api.post('/admin/calculators', config);
  return response.data;
};

export const updateCalculatorConfig = async (loanType, config) => {
  const response = await api.put(`/admin/calculators/${loanType}`, config);
  return response.data;
};

export const deleteCalculatorConfig = async (loanType) => {
  await api.delete(`/admin/calculators/${loanType}`);
};

export const getCalculationResults = async () => {
  const response = await api.get('/admin/results');
  return response.data;
};

export const exportResultsToCSV = async () => {
  const response = await api.get('/admin/results/export', { responseType: 'blob' });
  return response.data;
};