import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";
import orderRoute from "./routes/orderRoute.js";

const PORT = process.env.PORT || 5500;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

const app = express();
app.use(cors());

app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));

app.use(express.json());

app.use("/api/user", userRoute);
app.use("/api/order", orderRoute);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
