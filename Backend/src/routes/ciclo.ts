import { Router } from 'express';
import {crearCiclo, cerrarCiclo, actualizarBajas, ingresarAlimento, ingresarQuimico, cambiarTanque} from '../controllers/ciclo';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post("/ciclo/crear", verifyToken, crearCiclo);
router.post("/ciclo/cerrar", verifyToken, cerrarCiclo);
router.post("/ciclo/bajas", verifyToken, actualizarBajas);
router.post("/ciclo/alimento", verifyToken, ingresarAlimento);
router.post("/ciclo/quimico", verifyToken, ingresarQuimico);
router.post("/ciclo/cambiar-tanque", verifyToken, cambiarTanque);

export default router;