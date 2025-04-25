// Libraries
import { config } from "dotenv";

// Dot env config
config();

export default {
  NODE_ENVIRONMENT: process.env.ENVIRONMENT || "ENVIRONMENT",
  PORT: process.env.PORT || 3001,
  MICRO_NAME: process.env.MICRO_NAME || "main",
  // DB CONFIG DB default
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_DATABASE: process.env.DB_DATABASE || "EquirentApp",
  DB_USER: process.env.DB_USER || "DB",
  DB_PASSWORD: process.env.DB_PASSWORD || "neiderhamburger99",

  JWT_KEY: process.env.JWT_KEY || "secret",
  JWT_EXPIRES: process.env.JWT_EXPIRES || "365d",
  TWILIO_KEY: process.env.TWILIO_KEY || "TWILIO_KEY",
  TWILIO_CL: process.env.TWILIO_CL || "TWILIO_CL",
  EMAIL_USER: process.env.EMAIL_USER || "fleet@equisoft.app",
  EMAIL_PASS: process.env.EMAIL_PASS || "aekj hmko rdwn ebvy",
  JWT_SECRET: process.env.JWT_SECRET || "lamondasadsdas",
};
