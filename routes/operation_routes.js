// routes/operationsRoutes.js
const express = require("express");
const { Operations } = require("../schemas/Operations"); // Operations modelini içe aktar

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const operations = await Operations.find().populate('section');
        res.json(operations);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

// Yeni operasyon ekleme
router.post("/", async (req, res) => {
    try {
        console.log(req.body);

        const { sectionId, ...otherFields } = req.body;
        const operation = new Operations({
            section: sectionId, // ObjectId olarak kaydet
            ...otherFields
        });

        await operation.save();
        res.status(200).json({ message: "Operasyon eklendi", operation });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası", details: error.message });
    }
});

// 📌 **Operasyon Güncelleme (POST)**
router.post("/update", async (req, res) => {
    try {
        const { id, sectionId, ...updateFields } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Güncellenecek operasyonun ID'si gereklidir" });
        }

        // Eğer sectionId varsa ObjectId formatına çevir
        if (sectionId) {
            updateFields.section = sectionId;
        }

        // Güncellemeyi gerçekleştir
        const updatedOperation = await Operations.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedOperation) {
            return res.status(404).json({ error: "Operasyon bulunamadı" });
        }

        res.status(200).json({ message: "Operasyon güncellendi", updatedOperation });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası", details: error.message });
    }
});

module.exports = router;
