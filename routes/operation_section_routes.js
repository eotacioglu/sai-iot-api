// routes/operationsRoutes.js
const express = require("express");
const {OperationsSections} = require("../schemas/OperationsSections"); // Operations modelini içe aktar

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const operationSections = await OperationsSections.find();
        res.json(operationSections);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});
router.post("/", async (req, res) => {
    try {
        console.log(req.body)
        const { name } = req.body;
        const operationSections = new OperationsSections({ name });
        await operationSections.save();
        res.status(200).json({ message: "Operasyon Kategorisi eklendi", operationSections });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


module.exports = router;
