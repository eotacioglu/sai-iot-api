const express = require("express");
const {Device} = require("../schemas/Device"); // Operations modelini içe aktar

const router = express.Router();



router.get("/", async (req, res) => {
    try {
        const devices = await Device.find();
        console.log(devices[0].isActive);
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});
router.post("/update", async (req, res) => {
    try {

        const { _id, deviceName } = req.body; // JSON'dan id, name ve cardId al

        if (!_id) {
            return res.status(400).json({ error: "Güncelleme için ID gereklidir" });
        }

        const updatedDevice = await Device.findByIdAndUpdate(
            _id,
            { deviceName },
            { new: true } // Güncellenmiş veriyi döndür
        );

        if (!updatedDevice) {
            return res.status(404).json({ error: "Aygıt bulunamadı" });
        }

        res.json({ message: "Kullanıcı güncellendi", device: updatedDevice });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
});
router.post("/delete", async (req, res) => {
    try {
        const { _id } = req.body; // JSON'dan id al

        if (!_id) {
            return res.status(400).json({ error: "Silme işlemi için ID gereklidir" });
        }

        const deletedDevice = await Device.findByIdAndDelete(_id);

        if (!deletedDevice) {
            return res.status(404).json({ error: "Aygıt bulunamadı" });
        }

        res.json({ message: "Aygıt silindi" });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

module.exports = router;