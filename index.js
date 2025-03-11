
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const { DeviceProcess } = require("./schemas/DeviceProcess");

const operationsRoutes = require("./routes/operation_routes");
const usersRoutes = require("./routes/user_routes");
const deviceRoutes = require("./routes/device_routes");
const processRoutes = require("./routes/process_routes");
const operationsSectionsRoutes = require("./routes/operation_section_routes");
const conveyorRoutes = require("./routes/conveyor_routes");
const performance_reports_routes = require("./routes/performance_reports_routes");
const xlsx = require("xlsx");

const cors = require("cors");
require("dotenv").config();

const DB_USER = 'admin';
const DB_PASS = 'secret';
const DB_HOST = 'sai-iot-db-service';
const DB_PORT = '27017';
const DB_NAME = 'sai-iot-db';
const mongoURI = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin&replicaSet=rs0`;// MongoDB bağlantı adresi
mongoose.connect(mongoURI).then(async () => {
    console.log("MongoDB bağlantısı başarılı");

}).catch(err => {
    console.error("Bağlantı hatası:", err);
    mongoose.connection.close();
});

const app = express();
app.use(express.json());
app.use(cors());

// 🌍 HTTP Sunucusu ve WebSocket Başlat
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = []; // Bağlı WebSocket istemcilerini saklamak için

wss.on("connection", async (ws) => {
    console.log("🔌 Yeni istemci bağlandı");
    clients.push(ws);
    let data = await DeviceProcess.find()
        .populate('user') // user referansını doldur
        .populate({
            path: 'operation', // Önce device'ı doldur
            populate: { path: 'section' } // Sonra device içindeki conveyor'u doldur
        })
        .populate({
            path: 'device', // Önce device'ı doldur
            populate: { path: 'conveyor' } // Sonra device içindeki conveyor'u doldur
        })
        .exec();
    // Tüm bağlı istemcilere mesaj gönder
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: "Process koleksiyonunda değişiklik var", data: data }));
        }
    });
    ws.on("close", () => {
        console.log("❌ İstemci bağlantısı kesildi");
        clients = clients.filter(client => client !== ws);
    });
});

// 🟢 MongoDB Change Stream ile değişiklikleri dinle
const changeStream = DeviceProcess.watch();
// changeStream.on("change", async (change) => {

//     console.log("🔄 Process koleksiyonunda değişiklik oldu:", change);
//     let data = await DeviceProcess.find().populate('user').populate('device').exec();
//     // Tüm bağlı istemcilere mesaj gönder
//     clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify({ message: "Process koleksiyonunda değişiklik var", data: data }));
//         }
//     });
// });
changeStream.on("change", async (change) => {
    console.log("🔄 Process koleksiyonunda değişiklik oldu:", change);

    let data = await DeviceProcess.find()
        .populate('user') // user referansını doldur
        .populate({
            path: 'operation', // Önce device'ı doldur
            populate: { path: 'section' } // Sonra device içindeki conveyor'u doldur
        })
        .populate({
            path: 'device', // Önce device'ı doldur
            populate: { path: 'conveyor' } // Sonra device içindeki conveyor'u doldur
        })
        .exec();

    // Tüm bağlı istemcilere mesaj gönder
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: "Process koleksiyonunda değişiklik var", data: data }));
        }
    });
});



app.use("/operations", operationsRoutes);
app.use("/users", usersRoutes);
app.use("/devices", deviceRoutes);
app.use("/processes", processRoutes);
app.use("/operationSections", operationsSectionsRoutes);
app.use("/conveyors", conveyorRoutes);
app.use("/conveyors", conveyorRoutes);
app.use("/performance-reports", performance_reports_routes);

// 📌 API Endpoint'leri



// 🌍 HTTP Sunucuyu Başlat
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`📡 WebSocket API çalışıyor: ws://localhost:${PORT}`);
});
