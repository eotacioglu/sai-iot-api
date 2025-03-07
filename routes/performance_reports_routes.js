// routes/performance_reports_routes.js.js
const express = require("express");
const { Process } = require("../schemas/Process"); // Operations modelini içe aktar

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
            let dateObjects = process[i].processDates.map(date => new Date(date));

            // En erken ve en geç tarihi bul
            let minDate = new Date(Math.min(...dateObjects));
            let maxDate = new Date(Math.max(...dateObjects));
            let resultData;

            // Farkı dakika cinsinden hesapla
            let totalMinutes = Math.floor((maxDate - minDate) / (1000 * 60));

            console.log(`Toplam çalışma süresi: ${totalMinutes} dakika`);
            performance.totalMinutes = totalMinutes;
            resultData = ((process[i].operation.defaultTime * process[i].processCount) / totalMinutes) * 100;
            performanceList.push(resultData);
        }
        res.json(performanceList);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});



module.exports = router;
