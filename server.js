const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(__dirname)); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// 🔥 FIREBASE ADMIN
const serviceAccount = {
  "type": "service_account",
  "project_id": "comparex-cebd8",
  "private_key_id": "4458cc74c296df7ca90ebc462efb8c2fad77714e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7gzyXPdfHFgZY\nisrH19glBRj48ObMR2dXXMUxP8u0RJQs45ghawsDukocaxZ1bG7Mm3lpy0O+YMaY\nSJFaqyYppqTPrnOAq0TZ8aComJTBkpHh2D9/74rakM7qrqJ6wcT5Q3hvNTlQqela\ne26erKETjh7mSEfgkYJ6tAlEwm8iVa4UZELEHye9e1YJtE+1kGTcx89ZEzH6ycM7\nTLUlG95vuhILmkHlb5gNPfL7Ria7tTw0d9vWGlzWk0Pf0tf4XfGwU5P5H8T10LO+\nRAdN8cAVFqxuBJuO43g1+tAWnjQlfbLkWkmwYy7cFPDuNhyWwkI66cSu/AVvZzrj\naW/jGfXPAgMBAAECggEAE5VStCbwzKmHsyKXqARqXf9oysL6D7abW9vj+k9D2olZ\nAlEot8DCrzp69/nVKCFRdwv7w6lHY3Ae/ZOCnroGK85sIwaAqJz6fVqHYWRCEO9a\nTgB0LUvasBX0jjz72h83j6LUxqSD3mFIbjs649Z6ohyzLHC7FQCNZHw+BZDa43Zq\nfSLIE+Pbd++66T6jHB1uVmsvivkkpqaIgpL1tS3NrGM+vY/mEUTV3vg9qFZKdyNU\nTP1QfauYAcu/rDTJe3vIaZhS8A7e6YkCbWJ38sboA7ZvtVHWL6JRoya2n/7TG6lc\nNyjj72rOjz+rJh12dlat/47T+Dk0ewCcuXiXgCoWvQKBgQDl4gmfcWkRNLMyaI10\nIQAjjHyIYOkKhpw7hykkTLe7HJYGUCCgyTmyYNZVqXPyhUpQuIUrotL++Q4ssjsT\nfw7EqW662zS0z68pFcTtaEqRe7vAyiawMrbNOnalHgNPHrrBQwftNo+rEPjf6XxR\nZ+hRmeXPUO2Is3/ANVaLajP7rQKBgQDQ0ORrh/l+A/V1L6cY0TDrICzVTEG7S0pO\nHmsuP2WLzQm1ttnJKWrMJ1eG20uQJmrKjugaqqBXD+25gXgP3eSQhYd9oqDzmIdj\ntSk7U1c5ReAE/UG1XvX09yCJWRYOd/q75qlfxkR4eiTSi8gA8AKaM7uCWnpnaCz7\nnwuBrudm6wKBgCTOXRYPNXBQzMQsY0GNqxUGAEZhpc5OoSMSz+6E7gHiYM7f82lq\n7nb19DtA51SULMLh2EiVSE0UmUVkv/quJDIuopD+WeD9Q6FDYAVW5mGGuxfyBeG+\nLPCNBMQJGySG2gXpcpJzYutTy1UmcAYkqdiu2FGqNm3lt3WR1Kp7tZj9AoGAPmVd\nC+CqpYQLUYP2u0yvAGMx4l6R+aRKxMMEJeKdtkODVkAYHar5lZ1f4xUeJCnGmVZQ\ndr9rf/hrgZX1SVB1ntW3ocv5qjB2rE2Sz35cvulpQjRm8Qo6FoPNvhzXoWUqkAEh\ntVOqXBGrdRp9ngIZ1PgGXLIqh0Gyx1FD//FChhcCgYBNOepcnbl0+weqsXpp5dbu\nSuMOxU9c5uG0o6Q/jE6DZyqurfQVI29yWXyAoGqXC7olZbsX2FIXPrvEm5Ah6eZ+\npAHHQd/wAa9s6yIBwR2VDAT1tEzbcB/CXRnb+hpwFS32XWa11QDSlHlQugvzinNH\nD8XhPXHaxWrSVcv0cK8tXw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@comparex-cebd8.iam.gserviceaccount.com",
  "client_id": "102259297259634447880",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_BOT_TOKEN'; 
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || 'YOUR_CHAT_ID'; 

// 🔥 BOT POLLING FIX (409 CONFLICT ERROR FIX)
const bot = new TelegramBot(TELEGRAM_TOKEN);
setTimeout(() => {
    bot.deleteWebhook().then(() => {
        bot.startPolling();
        console.log("🤖 Telegram Bot Started!");
    });
}, 3000);

const userSockets = {}; 

io.on('connection', (socket) => {
    socket.on('register_user', (email) => { if(email) userSockets[email] = socket.id; });

    socket.on('new_transaction', async (data) => {
        const { txId, type, amount, userId, userName, method, details } = data;
        
        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if(userDoc.exists) {
                let userData = userDoc.data();
                let txs = userData.transactions || [];
                txs.unshift({ id: txId, type, amount, method, details, status: 'Pending', date: new Date().toLocaleString() });
                await userRef.update({ transactions: txs });
            }
        } catch(e) { console.log(e); }

        const text = `🚨 *NEW ${type.toUpperCase()}* 🚨\n\n🆔 *Order ID:* \`${txId}\`\n👤 *User:* ${userId}\n💰 *Amount:* ₹${amount}\n\n👇 Verify:`;
        const keyboard = { reply_markup: { inline_keyboard: [[ { text: '✅ Approve', callback_data: `approve_${txId}_${userId}` }, { text: '❌ Reject', callback_data: `reject_${txId}_${userId}` } ]] } };
        bot.sendMessage(ADMIN_CHAT_ID, text, { parse_mode: 'Markdown', ...keyboard });
    });
});

bot.on('callback_query', async (query) => {
    const [action, txId, userId] = query.data.split('_');

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;
        
        let userData = userDoc.data();
        let txs = userData.transactions || [];
        const txIndex = txs.findIndex(t => t.id === txId);
        if (txIndex === -1) return;

        if(action === 'approve') {
            txs[txIndex].status = 'Approved';
            if (txs[txIndex].type === 'deposit') {
                userData.balance = Number(userData.balance) + Number(txs[txIndex].amount);
            }
            await userRef.update({ balance: userData.balance, transactions: txs });
            
            bot.editMessageText(`✅ *APPROVED*\nOrder ID: \`${txId}\``, { chat_id: query.message.chat.id, message_id: query.message.message_id, parse_mode: 'Markdown' });
        } else {
            txs[txIndex].status = 'Rejected';
            if(txs[txIndex].type === 'withdraw') {
                userData.balance = Number(userData.balance) + Number(txs[txIndex].amount);
            }
            await userRef.update({ balance: userData.balance, transactions: txs });
            bot.editMessageText(`❌ *REJECTED*\nOrder ID: \`${txId}\``, { chat_id: query.message.chat.id, message_id: query.message.message_id, parse_mode: 'Markdown' });
        }
        
        const socketId = userSockets[userId];
        if(socketId) io.to(socketId).emit(`transaction_${action}d`, txId);
        bot.answerCallbackQuery(query.id);
    } catch(e) { console.log(e); }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
