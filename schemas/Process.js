// const mongoose = require("mongoose");

// const processSchema = new mongoose.Schema({
//     // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     // device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
//     user: { type: Object, required: true },  // `userId` yerine direkt `User` nesnesi
//     device: { type: Object, required: true },
//     processCount: { type: Number, default: 1 },
//     time: { type: Date, default: Date.now }
// });
// const Process = mongoose.model("Process", processSchema, "process");

// module.exports = { Process };


const mongoose = require("mongoose");

const processSchema = new mongoose.Schema({
    // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    user: { type: Object, required: true },  // `userId` yerine direkt `User` nesnesi
    device: { type: Object, required: true },
    operation: { type: Object, required: true },
    processCount: { type: Number, default: 1 },
    processDates: { type: [ Date ], default: [] },
    time: { type: Date, default: Date.now }
});
const Process = mongoose.model("Process", processSchema, "process");

module.exports = { Process };