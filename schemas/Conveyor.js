const mongoose = require("mongoose");

const conveyorSchema = new mongoose.Schema({
    name: String,
    area: String,
    isActive: { type: Boolean, default: true },
    time: { type: Date, default: Date.now }
});
const Conveyor = mongoose.model("Conveyor", conveyorSchema, "conveyor");

module.exports = { Conveyor };