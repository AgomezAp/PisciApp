import { Router } from 'express';
import {crearCiclo, cerrarCiclo, actualizarBajas, ingresarAlimento, ingresarQuimico, cambiarTanque, verCiclo, verCicloTanques} from '../controllers/ciclo';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post("/crear", /* verifyToken, */ crearCiclo);
router.get("/obtener/:usuario_id", /* verifyToken, */ verCiclo)
router.get("/tanques/:ciclo_id", /* verifyToken, */ verCicloTanques);
router.post("/cerrar", /* verifyToken, */ cerrarCiclo);
router.post("/bajas/:ciclo_id", /* verifyToken, */ actualizarBajas);
router.post("/alimento/:ciclo_id", /* verifyToken, */ ingresarAlimento);
router.post("/quimico/:ciclo_id", /* verifyToken, */ ingresarQuimico);
router.post("/cambiar-tanque/:ciclo_id", /* verifyToken, */ cambiarTanque);

export default router;