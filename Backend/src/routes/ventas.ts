import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { crearVenta, obtenerVentasPorUsuario, obtenerCompradores } from "../controllers/venta";

const router = Router();

router.post("/nueva", verifyToken, crearVenta);
router.get("/obtener", verifyToken, obtenerVentasPorUsuario);
router.get("/compradores", verifyToken, obtenerCompradores);

export default router