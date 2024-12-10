const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  payment: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Subschema for a bid
const bidSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const roscaSchema = new mongoose.Schema({
  roscaName: {
    type: String,
    required: true,
    message: "Name is required",
  },
  size: {
    type: Number,
    required: true,
    message: "Size is required",
  },
  amount: {
    type: Number,
    required: true,
    message: "Amount is required",
  },
  isAdmin: {
    type: Boolean,
  },
  duration: {
    type: String,
  },
  aadharNo: {
    type: Number,
  },
  members: {
    type: [memberSchema], // Array of member objects
    required: true,
    default: [], // Initialize with an empty array
  },
  bid: {
    type: [bidSchema], // Array of bid objects
    default: [], // Initialize with an empty array
  },
});

const roscaModel = mongoose.model("roscas", roscaSchema);

module.exports = roscaModel;
