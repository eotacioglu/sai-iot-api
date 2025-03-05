const mongoose = require("mongoose");

const operationsSectionsSchema = new mongoose.Schema({
    name: String,
    time: { type: Date, default: Date.now }
});
const OperationsSections = mongoose.model("OperationsSections", operationsSectionsSchema, "operationsSections");

module.exports = { OperationsSections };