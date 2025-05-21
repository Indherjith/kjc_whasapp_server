const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// WhatsApp client setup
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '/opt/render/project/src/session' // Make sure this matches the Render disk mount path
  }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// QR Code handling
client.on('qr', (qr) => {
  console.log('🔒 Scan the QR Code below to authenticate:');
  qrcode.generate(qr, { small: true });
});

// Ready event
client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

// Error event
client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Client disconnected:', reason);
});

// Initialize WhatsApp client
client.initialize();

// API route to send a message
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Missing number or message' });
  }

  // Format number (e.g., 918072454199 → 918072454199@c.us)
  const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

  try {
    await client.sendMessage(chatId, message);
    console.log(`📤 Message sent to ${number}: ${message}`);
    return res.status(200).json({ success: true, message: 'Message sent' });
  } catch (err) {
    console.error('❌ Error sending message:', err);
    return res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

// Root test route
app.get('/', (req, res) => {
  res.send('📡 WhatsApp Message Sender API is running!');
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
