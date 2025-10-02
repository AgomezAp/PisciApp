import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {createProducto, getProducto, updateProducto, deleteProducto} from "../controllers/producto";

const router = Router();


router.post("/crear",createProducto); //, verifyToken
router.get("/ver-productos", getProducto); //, verifyToken
router.put("/actualizar/:id", updateProducto); //, verifyToken
router.delete("/eliminar/:id", deleteProducto); //, verifyToken

export default router;
