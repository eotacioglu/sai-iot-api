// routes/performance_reports_routes.js.js
const express = require("express");
const { Process } = require("../schemas/Process"); // Operations modelini içe aktar
const { Device } = require("../schemas/Device"); // Operations modelini içe aktar
const { Conveyor } = require("../schemas/Conveyor"); // Operations modelini içe aktar
const { User } = require("../schemas/User"); // Operations modelini içe aktar
const { Operations } = require("../schemas/Operations"); // Operations modelini içe aktar

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
            performance.createdDate = process[i].time;


            performanceList.push(performance);
        }
        res.json(performanceList);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

router.get("/dashboard", async (req, res) => {
    let allCompanyQuantity = 0;
    let conveyorMap = {};
    let allLostMinutes = 0;
    let allActiveMinutes = 0;
    let allTotalMinutes = 0;
    let userMap = {};
    let operationMap = {};
    let deviceMap = {};

    try {
        // Önce tüm bantları çekelim
        const allConveyors = await Conveyor.find(); // Conveyor modelinin adını senin yapına göre düzenle
        const allProcess = await Process.find();
        const allDevices = await Device.find();
        const allUsers = await User.find();
        const alloperations = await Operations.find().populate("section");

        // Önce tüm bantları 0 processCount ile ekleyelim
        allConveyors.forEach(conveyor => {
            conveyorMap[conveyor.name] = {
                conveyor: conveyor.name,
                processCount: 0,
            };
        });

        // Şimdi process'leri ekleyelim
        for (let i = 0; i < allProcess.length; i++) {
            allCompanyQuantity += allProcess[i].processCount;

            let device = await Device.findOne({ deviceId: allProcess[i].device.deviceId }).populate("conveyor");

            if (device && device.conveyor) {
                let conveyorName = device.conveyor.name;

                // ProcessCount'u artır
                conveyorMap[conveyorName].processCount += allProcess[i].processCount;
            }
        }
        // Processs içerisindeki banatlara göre kaç adet operasyon var her operasyonun adet sayısı
        for (let i = 0; i < allProcess.length; i++) {
            let device = await Device.findOne({ deviceId: allProcess[i].device.deviceId }).populate("conveyor");
        
            if (device && device.conveyor) {
                let conveyorName = device.conveyor.name;
        
                if (!conveyorMap[conveyorName].processList) {
                    conveyorMap[conveyorName].processList = [];
                }
        
                // Check if the operation already exists in the array
                let existingOpIndex = conveyorMap[conveyorName].processList.findIndex(
                    op => op.name === allProcess[i].operation.name
                );
        
                if (existingOpIndex !== -1) {
                    // If operation exists, update its count
                    conveyorMap[conveyorName].processList[existingOpIndex].count += allProcess[i].processCount;
                } else {
                    // If operation doesn't exist, add it to the array
                    conveyorMap[conveyorName].processList.push({
                        name: allProcess[i].operation.name,
                        count: allProcess[i].processCount
                    });
                }
            }
        }

        //Her bir bant için çalışan operatör sayısını da getirelim
        for (let i = 0; i < allProcess.length; i++) {
            let device = await Device.findOne({ deviceId: allProcess[i].device.deviceId }).populate("conveyor");
        
            if (device && device.conveyor) {
                let conveyorName = device.conveyor.name;
        
                if (!conveyorMap[conveyorName].userList) {
                    conveyorMap[conveyorName].userList = [];
                }
        
                // Check if the user already exists in the array
                let existingUserIndex = conveyorMap[conveyorName].userList.findIndex(
                    user => user.name === allProcess[i].user.name
                );
        
                if (existingUserIndex !== -1) {
                    // If user exists, update its count
                    conveyorMap[conveyorName].userList[existingUserIndex].count += allProcess[i].processCount;
                } else {
                    // If user doesn't exist, add it to the array
                    conveyorMap[conveyorName].userList.push({
                        name: allProcess[i].user.name,
                        count: allProcess[i].processCount
                    });
                }
            }
        }
// Şimdi buraya tüm kayıp zamanları aktif çalışma zamanını ve toplam çalışma zamanını ekleyelim
        for (let i = 0; i < allProcess.length; i++) {
            let device = await Device.findOne({ deviceId: allProcess[i].device.deviceId }).populate("conveyor");
        
            if (device && device.conveyor) {
                let conveyorName = device.conveyor.name;
        
                if (!conveyorMap[conveyorName].lostMinutes) {
                    conveyorMap[conveyorName].lostMinutes = 0;
                }
        
                if (!conveyorMap[conveyorName].activeMinutes) {
                    conveyorMap[conveyorName].activeMinutes = 0;
                }
        
                if (!conveyorMap[conveyorName].totalMinutes) {
                    conveyorMap[conveyorName].totalMinutes = 0;
                }
        
                // Tarihleri JavaScript Date nesnesine çevir
                const dateObjects = allProcess[i].processDates.map(date => new Date(date)).sort((a, b) => a - b);
        
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
        
                conveyorMap[conveyorName].lostMinutes += lostMinutes;
                conveyorMap[conveyorName].activeMinutes += activeMinutes;
                conveyorMap[conveyorName].totalMinutes += totalMinutes;
            }
        }
     
/// Aslında bant bazlı olmayan processler içerisindeki kayıp zamanları aktif çalışma zamanını ve toplam çalışma zamanını ekleyelim
        for (let i = 0; i < allProcess.length; i++) {
            // Tarihleri JavaScript Date nesnesine çevir
            const dateObjects = allProcess[i].processDates.map(date => new Date(date)).sort((a, b) => a - b);
        
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
        
            allLostMinutes += lostMinutes;
            allActiveMinutes += activeMinutes;
            allTotalMinutes += totalMinutes;
        }


//şimdi buraya tüm kullancıların toplam çalışma sayılarını ve hangi operasyonda ne kadar iş yaptıklarını gösteren datayı ekleyelim
        for (let i = 0; i < allProcess.length; i++) {
            let user = allProcess[i].user;
        
            if (!userMap[user.name]) {
                userMap[user.name] = {
                    name: user.name,
                    processCount: 0,
                    processList: []
                };
            }
        
            userMap[user.name].processCount += allProcess[i].processCount;
        
            // Check if the operation already exists in the array
            let existingOpIndex = userMap[user.name].processList.findIndex(
                op => op.name === allProcess[i].operation.name
            );
        
            if (existingOpIndex !== -1) {
                // If operation exists, update its count
                userMap[user.name].processList[existingOpIndex].count += allProcess[i].processCount;
            } else {
                // If operation doesn't exist, add it to the array
                userMap[user.name].processList.push({
                    name: allProcess[i].operation.name,
                    count: allProcess[i].processCount
                });
            }
        }

        
   
        
//şimdi buraya tüm operasyonların toplam çalışma sayılarını gösteren datayı ekleyelim
        for (let i = 0; i < allProcess.length; i++) {
            let operation = allProcess[i].operation;
        
            if (!operationMap[operation.name]) {
                operationMap[operation.name] = {
                    name: operation.name,
                    processCount: 0
                };
            }
        
            operationMap[operation.name].processCount += allProcess[i].processCount;
        }
       
//şimdi buraya tüm cihazların toplam çalışma sayılarını gösteren datayı ekleyelim
        for (let i = 0; i < allProcess.length; i++) {
            let device = await Device.findOne({ deviceId: allProcess[i].device.deviceId }).populate("conveyor");
        
            if (device) {
                if (!deviceMap[device.deviceId]) {
                    deviceMap[device.deviceId] = {
                        deviceId: device.deviceId,
                        deviceName: device.deviceName,
                        conveyor: device.conveyor.name,
                        processCount: 0
                    };
                }
        
                deviceMap[device.deviceId].processCount += allProcess[i].processCount;
            }}

        // Objeyi array'e çevirme
        let conveyorAllProcessList = Object.values(conveyorMap);
        let userAllProcessList = Object.values(userMap);
        let operationAllProcessList = Object.values(operationMap);
        let deviceAllProcessList = Object.values(deviceMap);

        res.json({
            allCompanyQuantity: allCompanyQuantity,
            conveyorAllProcessList: conveyorAllProcessList,
            userAllProcessList: userAllProcessList,
            operationAllProcessList,
            deviceAllProcessList,
            
            allDevicesCount: allDevices.length,
            activeDevicesCount: allDevices.filter(device => device.isActive === true).length,
            deactiveDeciessCount: allDevices.filter(device => device.isActive === false).length,
            allUserCount: allUsers.length,
            allOperationsCount: alloperations.length,
            allConveyorCount: allConveyors.length,
            allOperationsCount: alloperations.length,
            allLostMinutes,
            allActiveMinutes,
            allTotalMinutes




            
        });
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});





module.exports = router;
