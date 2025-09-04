import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import * as path from "path";
import sequelize from "../database/connection";
import "../models";
import { iniciarCronJobs } from "../services/cronJobs";
import helmet from "helmet";
// Importar rutas (cuando las tengas creadas)
import RUsuario from "../routes/usuario";
import RAuth from "../routes/auth";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import RInventario from "../routes/inventario";
import RProducto from "../routes/producto";
import RTanque from "../routes/tanque";
/* 
/* 
import RCiclo from "../routes/ciclo";
import RTarea from "../routes/tarea";
import RCompra from "../routes/compra"; */

dotenv.config();
iniciarCronJobs();

class Server {
  private app: Application;
  private port?: string;

  constructor() {
    this.app = express();
    this.app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "http://localhost:3010", "data:", "blob:"], // imágenes locales y base64
          scriptSrc: ["'self'", "http://localhost:4200"],
          styleSrc: ["'self'", "http://localhost:4200", "'unsafe-inline'"],
        },
      })
    );
    this.port = process.env.PORT!;
    this.middlewares();
    this.router();
    this.DBconnect();
    this.listen();
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("✅ Server running on port: " + this.port);
    });
  }

  router() {
    const authLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: 5, // 5 requests
      message: { message: "Demasiados intentos, espere un momento" },
    });

    this.app.use("/usuarios", RUsuario);
    this.app.use("/auth", RAuth);
    this.app.use("/inventario", RInventario);
    this.app.use("/tanque", RTanque);
    this.app.use("/productos", RProducto);
    /*     this.app.use("/usuarios", RUsuario);
    this.app.use("/ciclos", RCiclo);
    this.app.use("/tareas", RTarea);
    this.app.use("/inventario", RInventario);
    this.app.use("/compras", RCompra); */
  }

  middlewares() {
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../../uploads"))
    );
    this.app.use(
      "/assets",
      express.static(path.join(__dirname, "../../src/assets"))
    );
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(
      cors({
        origin: "http://localhost:4200",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );
  }

  async DBconnect() {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });

      console.log(
        "✅ Conexión establecida y tablas sincronizadas correctamente"
      );
    } catch (error) {
      console.log("❌ Error de conexión:", error);
    }
  }
}

export default Server;
