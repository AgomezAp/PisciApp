import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { crearVenta, obtenerVentasPorUsuario } from "../controllers/venta";

const router = Router();

router.post("/nueva",/* verifyToken , */crearVenta);
router.get("/obtener",/* verifyToken , */ obtenerVentasPorUsuario)

export default router