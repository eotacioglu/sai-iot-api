

// routes/operationsRoutes.js
const express = require("express");
const {Process} = require("../schemas/Process"); // Operations modelini içe aktar

const router = express.Router();



router.get('/', async (req, res) => {
    try {
        // const { date } = req.query;
        // if (!date) {
        //     return res.status(400).json({ error: "Lütfen bir tarih belirtin (YYYY-MM-DD)!" });
        // }

        // const startDate = new Date(date);
        // startDate.setHours(0, 0, 0, 0);
        // const endDate = new Date(startDate);
        // endDate.setDate(startDate.getDate() + 1);

        // const processes = await Process.find({
        //     time: { $gte: startDate, $lt: endDate }
        // });

        const processes = await Process.find();

        res.json(processes);
    } catch (error) {
        console.error("❌ Hata:", error);
        res.status(500).json({ error: "Sunucu hatası!" });
    }
});




module.exports = router;