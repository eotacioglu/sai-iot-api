// const mongoose = require("mongoose");

// const deviceProcessSchema = new mongoose.Schema({
//     processCount: { type: Number, default: 1 },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
//     time: { type: Date, default: Date.now }
// });
// const DeviceProcess = mongoose.model("DeviceProcess", deviceProcessSchema, "deviceprocess");

// module.exports = { DeviceProcess };



const mongoose = require("mongoose");

const deviceProcessSchema = new mongoose.Schema({
    processCount: { type: Number, default: 1 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    operation: { type: mongoose.Schema.Types.ObjectId, ref: 'Operations' },
    time: { type: Date, default: Date.now }
});
const DeviceProcess = mongoose.model("DeviceProcess", deviceProcessSchema, "deviceprocess");

module.exports = { DeviceProcess };