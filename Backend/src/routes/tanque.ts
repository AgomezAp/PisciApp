import { Router } from "express";
 import { crearTanque, eliminarTanque, editarTanque, actualizarMediciones, obtenerTanqueId, obtenerMedTanqueId, obtenerTanque} from "../controllers/tanque";
import { verifyToken } from "../middlewares/verifyToken";

 const router = Router();

router.post("/crear",/* verifyToken, */ crearTanque);
router.get("/ver/:id", obtenerTanqueId);
router.get("/obtener/:usuario_id", obtenerTanque)
router.delete("/eliminar", /* verifyToken, */ eliminarTanque);
router.put("/editar/:id", /* verifyToken, */ editarTanque);
router.put("/mediciones/:tanque_id", /* verifyToken, */ actualizarMediciones);
router.get("/obtenermed/:tanque_id", /* verifyToken, */ obtenerMedTanqueId);


export default router;