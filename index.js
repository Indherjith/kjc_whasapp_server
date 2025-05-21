const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Setup WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(), // saves session
  puppeteer: {
    args: ['--no-sandbox'],
  }
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

client.initialize();

// API to send message
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Missing number or message' });
  }

  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

    await client.sendMessage(formattedNumber, message);
    return res.status(200).json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/', (req, res) => {
  res.send('WhatsApp Web API is running');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
