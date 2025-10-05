import mongoose from "mongoose";

const connectDB = async () => {
  console.log(process.env.MONGO_URI);
  
  try {
    const conn = await mongoose.connect(`${process.env.MONGO_URI}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected !! DB host: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB: " + error);
    process.exit(1);
  }
};

export default connectDB;
