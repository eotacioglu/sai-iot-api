const mongoose = require("mongoose");

const operationsSchema = new mongoose.Schema({
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'OperationsSections' },
    orderDesc: String,
    operationCode: Number,
    name: String,
    defaultTime: Number,
    time: { type: Date, default: Date.now }
});
const Operations = mongoose.model("Operations", operationsSchema, "operations");

module.exports = { Operations };