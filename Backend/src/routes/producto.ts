import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {createProducto, getproductos, updateproductos, deleteProductos} from "../controllers/producto";

const router = Router();

router.post("/crear", verifyToken,createProducto);
router.get("/ver-productos", verifyToken, getproductos);
router.put("/actaulizar", verifyToken, updateproductos);
router.delete("/eliminar", verifyToken, deleteProductos);

export default router;
