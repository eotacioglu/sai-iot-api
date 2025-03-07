// routes/operationsRoutes.js
const express = require("express");
const { Conveyor } = require("../schemas/Conveyor"); // Operations modelini içe aktar

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const conveyor = await Conveyor.find();
        res.json(conveyor);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});
router.post("/", async (req, res) => {
    try {
        console.log(req.body)
        const { name, area } = req.body;
        const conveyor = new Conveyor({ name, area });
        await conveyor.save();
        res.status(200).json({ message: "Bant eklendi", conveyor });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

router.post("/update", async (req, res) => {
    try {

        const { _id, name, area } = req.body; // JSON'dan id, name ve area al

        if (!_id) {
            return res.status(400).json({ error: "Güncelleme için ID gereklidir" });
        }

        const updatedConveyor = await Conveyor.findByIdAndUpdate(
            _id,
            { name, area },
            { new: true } // Güncellenmiş veriyi döndür
        );

        if (!updatedConveyor) {
            return res.status(404).json({ error: "Bant bulunamadı" });
        }

        res.json({ message: "Bant güncellendi", conveyor: updatedConveyor });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
})

router.post("/delete", async (req, res) => {
    try {
        const { _id } = req.body; // JSON'dan id al

        if (!_id) {
            return res.status(400).json({ error: "Silme işlemi için ID gereklidir" });
        }
        const deletedConveyor = await Conveyor.findOneAndUpdate({ _id }, { isActive: false });

        if (!deletedConveyor) {
            return res.status(404).json({ error: "Bant bulunamadı" });
        }

        res.json({ message: "Bant silindi" });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

module.exports = router;
