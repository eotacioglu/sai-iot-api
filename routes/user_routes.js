

// routes/operationsRoutes.js
const express = require("express");
const {User} = require("../schemas/User"); // Operations modelini içe aktar

const router = express.Router();




router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});
router.post("/", async (req, res) => {
    try {
        console.log(req.body)
        const { name, cardId } = req.body;
        const user = new User({ name, cardId });
        await user.save();
        res.status(200).json({ message: "Kullanıcı eklendi", user });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

router.post("/update", async (req, res) => {
    try {

        const { _id, name, cardId } = req.body; // JSON'dan id, name ve cardId al

        if (!_id) {
            return res.status(400).json({ error: "Güncelleme için ID gereklidir" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            { name, cardId },
            { new: true } // Güncellenmiş veriyi döndür
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }

        res.json({ message: "Kullanıcı güncellendi", user: updatedUser });
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

        const deletedUser = await User.findByIdAndDelete(_id);

        if (!deletedUser) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }

        res.json({ message: "Kullanıcı silindi" });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


module.exports = router;