const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Product",
    required: true,
  },
  customer_uid: {
    type: String,
    required: true,
  },
  order_qnt: {
    type: Number,
    required: true,
  },
  order_status: {
    type: String,
    required: true,
  },
  order_bill: {
    type: Number,
    required: true,
  },
  tnx_id: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Order", orderSchema);
