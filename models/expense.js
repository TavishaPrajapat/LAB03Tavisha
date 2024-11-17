const mongoose = require("mongoose");

const schemaObj = {
    name: { type: String, required: true, unique: true }, 
    description: { type: String} 
};

const mongooseSchema = mongoose.Schema(schemaObj);
module.exports = mongoose.model("Expense", mongooseSchema);
