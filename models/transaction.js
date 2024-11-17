const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dataSchemaObj = {
    location: { type: String, required: true },
  amount: { type: Number, required: true }, 
  category: { type: String },
  note: { type: String, default: '' }, 
  date: { type: Date, default: Date.now } 
};

// Create mongoose schema
const transactionSchema = mongoose.Schema(dataSchemaObj);

// Create and export mongoose model
module.exports = mongoose.model("Transaction", transactionSchema);
