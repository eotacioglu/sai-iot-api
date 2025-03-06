const mongoose = require("mongoose");
const xlsx = require("xlsx");
const { OperationsSections } = require("./schemas/OperationsSections");
const { Operations } = require("./schemas/Operations");
const DB_USER = 'admin';
const DB_PASS = 'secret';
const DB_HOST = 'localhost';
const DB_PORT = '27017';
const DB_NAME = 'sai-iot-db';
const mongoURI = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;// MongoDB bağlantı adresi

mongoose.connect(mongoURI).then(async () => {
    console.log("MongoDB bağlantısı başarılı");

    // 1. OperationsSections ekleyelim
    const sectionNames = [ "DK", "TL", "HZ" ];
    let sections = await OperationsSections.find({ name: { $in: sectionNames } });

    if (sections.length === 0) {
        sections = await OperationsSections.insertMany(
            sectionNames.map(name => ({ name }))
        );
        console.log("OperationsSections eklendi");
    }

    // 2. Excel dosyasını oku
    const workbook = xlsx.readFile("operationsmock.xlsx");
    const sheet = workbook.Sheets[ workbook.SheetNames[ 0 ] ];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const operations = [];
    for (let i = 3; i <= 85; i++) {
        const row = data[ i ] || [];
        console.log(`Satır ${i}:`, row);  // Satır içeriğini logla

        const sectionName = String(row[ 0 ] || "").trim();  // 🔥 B sütunu yerine A sütunu (row[0])
        const orderDesc = row[ 1 ] || "";  
        const operationCode = parseInt(orderDesc, 10) || 0;  // 🔥 C sütunu yerine B sütunu (row[1])
        const name = row[ 2 ] || "";         // 🔥 D sütunu yerine C sütunu (row[2])
        const defaultTime = row[ 3 ] || 0;   // 🔥 E sütunu yerine D sütunu (row[3])

        console.log(`İşlenen sectionName: "${sectionName}"`); // Bölüm ismini logla

        const section = sections.find(s => s.name === sectionName);
        if (!section) {
            console.warn(`Bilinmeyen bölüm: "${sectionName}", atlanıyor.`);
            continue;
        }

        operations.push({
            section: section._id,
            orderDesc,
            operationCode,
            name,
            defaultTime: Number(defaultTime) || 0,
        });
    }

    await Operations.insertMany(operations);
    console.log("Operasyonlar başarıyla eklendi");

    mongoose.connection.close();
}).catch(err => {
    console.error("Bağlantı hatası:", err);
    mongoose.connection.close();
});
