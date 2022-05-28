const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  min_order: {
    type: Number,
    required: true,
  },
  max_order: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  pd_manager: {
    type: mongoose.SchemaTypes.ObjectId,
    required: false,
  },
});

module.exports = mongoose.model("Product", productSchema);
