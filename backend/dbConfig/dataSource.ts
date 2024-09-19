import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserTokens } from "../models/UserTokens"; // Import your entities

require("dotenv").config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [UserTokens], // Your entities here
  synchronize: true, // Automatically sync database schema
  logging: true, // Enable logging for better debugging
});