import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
