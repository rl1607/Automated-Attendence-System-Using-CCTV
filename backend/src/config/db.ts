import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/automated_attendance';
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('✔ MongoDB Connected Successfully.');
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.warn('⚠️ Warning: Application is running without a persistent database connection.');
  }
};
