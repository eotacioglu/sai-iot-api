const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    deviceName: { type: String, default: "" },
    deviceId: String,
    conveyor: { type: mongoose.Schema.Types.ObjectId, ref: 'Conveyor' },
    isActive: { type: Boolean, default: false },
});
const Device = mongoose.model("Device", deviceSchema, "devices");

module.exports = { Device };