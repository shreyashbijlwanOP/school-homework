import mongoose from 'mongoose';
export function connectToDatabase() {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/', {
      dbName: 'mydatabase'
    })
    .then((conn) => {
      console.log('Connected to MongoDB');
      conn.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      conn.connection.on('disconnected', () => {
        console.log('MongoDB connection disconnected');
      });
      conn.connection.on('connected', () => {
        console.log('MongoDB connection reconnected');
      });
    });
}
