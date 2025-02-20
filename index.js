
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const { User } = require("./schemas/User");
const { Device } = require("./schemas/Device");
const { Process } = require("./schemas/Process");
const cors = require("cors");
require("dotenv").config();

const DB_USER = 'admin';
const DB_PASS = 'secret';
const DB_HOST = 'sai-iot-db-service';
const DB_PORT = '27017';
const DB_NAME = 'sai-iot-db';
const mongoURI = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin&replicaSet=rs0`;// MongoDB bağlantı adresi
mongoose.connect(mongoURI)
    .then(() => console.log("📦 MongoDB'ye bağlandı"))
    .catch(err => console.error("MongoDB bağlantı hatası:", err));

const app = express();
app.use(express.json());
app.use(cors());

// 🌍 HTTP Sunucusu ve WebSocket Başlat
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = []; // Bağlı WebSocket istemcilerini saklamak için

wss.on("connection", (ws) => {
    console.log("🔌 Yeni istemci bağlandı");
    clients.push(ws);

    ws.on("close", () => {
        console.log("❌ İstemci bağlantısı kesildi");
        clients = clients.filter(client => client !== ws);
    });
});

// 🟢 MongoDB Change Stream ile değişiklikleri dinle
const changeStream = Process.watch();
changeStream.on("change", (change) => {
    console.log("🔄 Process koleksiyonunda değişiklik oldu:", change);

    // Tüm bağlı istemcilere mesaj gönder
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: "Process koleksiyonunda değişiklik var", data: change }));
        }
    });
});

// 📌 API Endpoint'leri
app.get("/devices", async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

app.get('/processes', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "Lütfen bir tarih belirtin (YYYY-MM-DD)!" });
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const processes = await Process.find({
            time: { $gte: startDate, $lt: endDate }
        });

        res.json(processes);
    } catch (error) {
        console.error("❌ Hata:", error);
        res.status(500).json({ error: "Sunucu hatası!" });
    }
});

// 🌍 HTTP Sunucuyu Başlat
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`📡 WebSocket API çalışıyor: ws://localhost:${PORT}`);
});
