require('ts-node').register();
const { connectDB } = require('./src/config/database');
connectDB().then(() => {
  console.log("DB connected successfully");
  process.exit(0);
}).catch(err => {
  console.error("Error connecting DB:", err);
  process.exit(1);
});
