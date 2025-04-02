import mongoose from "mongoose";
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plan: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid"], // More specific statuses
    required: true,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: {
      expires: 600,
      partialFilterExpression: { status: "pending" },
    },
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
