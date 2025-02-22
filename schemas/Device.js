const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    deviceName: { type: String, default: "" },
    deviceId: String,
    isActive: { type: Boolean, default: false },
});
const Device = mongoose.model("Device", deviceSchema, "devices");

module.exports = { Device };