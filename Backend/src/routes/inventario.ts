import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { addInventario, deleteInventario, getInventario, getInventarioById, updateInventario } from "../controllers/inventario";

const router = Router();

router.post("/agregar", verifyToken, addInventario);    
router.get("/obtener", verifyToken, getInventario);    
router.get("/obtener_id/:id", verifyToken, getInventarioById);
router.put("/actualizar/:id", verifyToken, updateInventario);
router.delete("/eliminar/:id", verifyToken, deleteInventario);

export default router;