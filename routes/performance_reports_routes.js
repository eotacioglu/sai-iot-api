// routes/performance_reports_routes.js.js
const express = require("express");
const { Process } = require("../schemas/Process"); // Operations modelini içe aktar
const { Device } = require("../schemas/Device"); // Operations modelini içe aktar

const router = express.Router();
// gün süresi	:	540 dk
// hedef verim 	:	85%
// adet	:	850
// standart süre	:	1,05  cdk
// operasyon adı	:	kemer takma

// örnek verecek olursak formül şu şekildedir;											

// standart süre 	x	adet	/	540	=	Verimlilik					

// 1,05	x	500	/	540	=	97%	buna işletme verimliliği diyoruz				






// örneğin operatörün 30 dakika kayıp zamanı var											
// örnek verecek olursak formül şu şekildedir;											

// standart süre 	x	adet	/	540	-	30	=	Verimlilik			

// 1,05	x	500	/	540	-	30	=	103%	buna kişisel verimlilik diyoruz		


router.get("/", async (req, res) => {
    const companyDayTime = 540;
    const companyTargetEfficiency = 85;
    let performanceList = [];

    try {
        const process = await Process.find();

        for (let i = 0; i < process.length; i++) {
            let performance = {};
            // Tarihleri JavaScript Date nesnesine çevir
            const dateObjects = process[i].processDates.map(date => new Date(date)).sort((a, b) => a - b);

            // En erken ve en geç tarihi bul
            const minDate = dateObjects[0];
            const maxDate = dateObjects[dateObjects.length - 1];

            // Toplam süreyi dakika cinsinden hesapla
            const totalMinutes = Math.floor((maxDate - minDate) / (1000 * 60));

            // Kaybolan zamanı hesapla
            let lostMinutes = 0;
            for (let i = 1; i < dateObjects.length; i++) {
                lostMinutes += Math.floor((dateObjects[i] - dateObjects[i - 1]) / (1000 * 60));
            }

            // Çalışılan zamanı hesapla
            const activeMinutes = totalMinutes - lostMinutes;

            console.log(`Toplam çalışma süresi: ${totalMinutes} dakika`);
            console.log(`Toplam kayıp zaman: ${lostMinutes} dakika`);
            console.log(`Gerçek aktif çalışma süresi: ${activeMinutes} dakika`);
            console.log(`Toplam çalışma süresi: ${totalMinutes} dakika`);
            const device = await Device.findOne({ deviceId: process[i].device.deviceId }).populate("conveyor");

            /// totalMinuts verildiğinde kulanıcının gün içerisindeki mesai süresi
            ///540 verildiğinde işletmenin standart mesai süresi
            performance.processResult = ((process[i].operation.defaultTime * process[i].processCount) / 540) * 100;
            performance.reelProcessResult = ((process[i].operation.defaultTime * process[i].processCount) / activeMinutes) * 100;
            performance.operationName = process[i].operation.name;
            performance.userName = process[i].user.name;
            performance.defaultTime = process[i].operation.defaultTime;
            performance.processCount = process[i].processCount;
            performance.conveyorName = device.conveyor.name;
            performance.processTime = totalMinutes;
            performance.lostMinutes = lostMinutes;
            performance.activeMinutes = activeMinutes;


            performanceList.push(performance);
        }
        res.json(performanceList);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});



module.exports = router;
