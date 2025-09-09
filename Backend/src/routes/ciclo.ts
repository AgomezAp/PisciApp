import { Router } from 'express';
import {crearCiclo, cerrarCiclo, actualizarBajas, ingresarAlimento, ingresarQuimico, cambiarTanque, verCiclo} from '../controllers/ciclo';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post("/crear", /* verifyToken, */ crearCiclo);
router.get("/obtener/:ciclo_id", /* verifyToken, */ verCiclo)
router.post("/cerrar", /* verifyToken, */ cerrarCiclo);
router.post("/bajas", /* verifyToken, */ actualizarBajas);
router.post("/alimento/:ciclo_id", /* verifyToken, */ ingresarAlimento);
router.post("/quimico/:ciclo_id", /* verifyToken, */ ingresarQuimico);
router.post("/cambiar-tanque", /* verifyToken, */ cambiarTanque);

export default router;