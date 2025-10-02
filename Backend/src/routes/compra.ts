import { Router } from "express";
import { createCompra } from "../controllers/compra";

const router = Router();

router.post("/crear-compra", createCompra);

export default router;
