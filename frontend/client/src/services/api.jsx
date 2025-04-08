export const sendCalculation = async (params) => {
  const response = await fetch('/api/calculations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return await response.json();
};

export const sendEmail = async (email, data) => {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, data }),
  });
  return await response.json();
};

const api = {
  sendCalculation,
  sendEmail
};

export default api;