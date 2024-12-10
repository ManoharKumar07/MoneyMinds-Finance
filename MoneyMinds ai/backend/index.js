const express = require("express");
const app = express();
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./db/db");
const cors = require("cors");
const env = require("dotenv");
env.config();

connectDB();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Use the same routing style for /api/v1/user
app.use("/api/v1/user", require("./routes/userRoutes"));

// Use the same routing style for all other routes under /api/v1
app.use("/api/v1", require("./routes/transactions"));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is Running on port ${port}`.bgCyan.white);
});
