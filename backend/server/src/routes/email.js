import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const formatEmailHtml = (results) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
      <h2 style="color: #2c3e50;">Результаты кредитного расчета</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        ${Object.entries(results).map(([key, value]) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${key}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              ${typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
            </td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
};

router.post('/send-email', async (req, res) => {
  const { recipientEmail, results } = req.body;

  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return res.status(400).json({ error: 'Укажите корректный email' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: `Bank Calculator <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Ваши результаты расчета кредита',
    html: formatEmailHtml(results),
    text: JSON.stringify(results, null, 2)
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка отправки:', error);
    res.status(500).json({ error: 'Не удалось отправить письмо' });
  }
});

export default router;