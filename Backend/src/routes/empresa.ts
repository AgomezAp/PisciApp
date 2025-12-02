import { Router } from 'express'
import { crearEmpresa, editarEmpresa, verEmpresa} from '../controllers/empresa'
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post("/crear",verifyToken, crearEmpresa);
router.put("/editar/:id",verifyToken, editarEmpresa);
router.get("/obtener/:id",verifyToken, verEmpresa);

export default router;