import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// Global middleware

// Security headers
app.use(helmet());

// JSON body parsing
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(","),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Routes
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "OK" });
});

const PORT_NO = 4000;

app.listen(PORT_NO, () =>
  console.log(`Server is running on port no: ${PORT_NO}`),
);
