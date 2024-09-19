// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import driveRoute from "./routes/drives";
// import documentsRoute from "./routes/documents"
// import {AppDataSource} from './dbConfig/dataSource';
// import 'reflect-metadata';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 4001;

// app.use(express.json());
// app.use(cors({
//   origin: "*",
//   credentials: true
// }));

// app.use("/api/v1/drive", driveRoute);
// app.use("/api/v1/documents", documentsRoute);

// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// console.log("Printing DB Username: ", process.env.DB_USER);
// console.log("Printing DB pASS: ", process.env.DB_PASSWORD);
// console.log("Printing DB Name: ", process.env.DB_NAME);



// // Initialize the database connection
// AppDataSource.initialize()
//   .then(() => {
//     console.log("PostgreSQL Data Source has been initialized!");
//   })
//   .catch((err) => {
//     console.error("Error during Data Source initialization", err);
//   });





// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import session from 'express-session'; // Import express-session
// import driveRoute from "./routes/drives";
// import documentsRoute from "./routes/documents";
// import authRoute from "./routes/auth"
// import { AppDataSource } from './dbConfig/dataSource';
// import 'reflect-metadata';

// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 4001;

// // Middleware
// app.use(express.json());
// app.use(cors({
//   origin: "*",
//   credentials: true
// }));

// // Session middleware setup
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-secret-key', // Set a secret key
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Set to true if using HTTPS
// }));

// // Routes
// app.use("/api/v1/drive", driveRoute);
// app.use("/api/v1/documents", documentsRoute);
// app.use("/api/v1/auth", authRoute); // Add authRoute

// // Test route
// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });

// app.get('/app/google/callback', (req, res) => {
//   res.send('Hello, world!');
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// // Log database configuration
// console.log("Printing DB Username: ", process.env.DB_USER);
// console.log("Printing DB Password: ", process.env.DB_PASSWORD);
// console.log("Printing DB Name: ", process.env.DB_NAME);

// // Initialize the database connection
// AppDataSource.initialize()
//   .then(() => {
//     console.log("PostgreSQL Data Source has been initialized!");
//   })
//   .catch((err) => {
//     console.error("Error during Data Source initialization", err);
//   });



import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { AppDataSource } from './dbConfig/dataSource';
import authRoutes from "./routes/authRoutes";
import driveRoutes from "./routes/driveRoutes";
import documentRoutes from "./routes/documents"

dotenv.config();

const app = express();
const PORT = 4001;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(cookieParser());

// Initialize the TypeORM Data Source
AppDataSource.initialize().then(() => {
  console.log("Data Source has been initialized!");

  // Use Routes
  app.use(authRoutes);
  app.use(driveRoutes);
  app.use(documentRoutes);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Error during Data Source initialization", err);
});
