import { Router } from "express";
 import { crearTanque, eliminarTanque, editarTanque, actualizarMediciones} from "../controllers/tanque";
import { verifyToken } from "../middlewares/verifyToken";

 const router = Router();

router.post("/crear", verifyToken, crearTanque);
router.delete("/eliminar/:id", verifyToken, eliminarTanque);
router.put("/editar/:id", verifyToken, editarTanque);
router.put("/mediciones/:tanque_id", verifyToken, actualizarMediciones);

export default router;