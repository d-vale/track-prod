import express from "express";
import createError from "http-errors";
import logger from "morgan";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import activitiesRoutes from "./routes/activitiesRoutes.mjs";
import usersRoutes from "./routes/usersRoutes.mjs";
import mediasRoutes from "./routes/mediasRoutes.mjs";
import mongoose from "mongoose";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.mjs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is missing in environment variables");
}

mongoose
  .connect(process.env.DATABASE_URL)
  .catch((err) => console.error("❌ Erreur MongoDB:", err));

const app = express();

app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
        // En production monolithique, accepter les requêtes du même domaine ou sans origin (same-origin)
        if (!origin || origin === process.env.FRONTEND_URL) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : true,
  credentials: true
};

app.use(cors(corsOptions));

const openApiDocument = yaml.load(fs.readFileSync("./openapi.yml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(logger("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use("/api/auth", authRoutes)
app.use("/api/activities", activitiesRoutes);
app.use("/api/medias", mediasRoutes);
app.use("/api/users", usersRoutes);

// Servir les fichiers statiques du frontend en production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../frontend/dist');

  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 __dirname:', __dirname);
  console.log('🔧 Frontend dist path:', frontendDistPath);

  // Vérifier si le dossier existe
  if (fs.existsSync(frontendDistPath)) {
    console.log('✅ Frontend dist path exists');
    const files = fs.readdirSync(frontendDistPath);
    console.log('📁 Files in dist:', files);
  } else {
    console.error('❌ Frontend dist path does NOT exist!');
  }

  // Servir les fichiers statiques en premier
  app.use(express.static(frontendDistPath));

  // Gérer les routes SPA - renvoyer index.html pour toutes les routes non-API
  // Ce middleware s'exécute seulement si express.static n'a pas trouvé de fichier
  app.use((req, res, next) => {
    // Ignorer les routes API et les fichiers statiques
    if (req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }
    console.log('📄 Serving index.html for:', req.path);
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // En développement, catch 404 pour les routes API uniquement
  app.use(function (req, res, next) {
    next(createError(404));
  });
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});


export default app;
