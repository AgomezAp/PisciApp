import { Router } from 'express';
import {crearCiclo, cerrarCiclo, actualizarBajas, ingresarAlimento, ingresarQuimico, cambiarTanque} from '../controllers/ciclo';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post("/crear", verifyToken, crearCiclo);
router.post("/cerrar", verifyToken, cerrarCiclo);
router.post("/bajas", verifyToken, actualizarBajas);
router.post("/alimento", verifyToken, ingresarAlimento);
router.post("/quimico", verifyToken, ingresarQuimico);
router.post("/cambiar-tanque", verifyToken, cambiarTanque);

export default router;