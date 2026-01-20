import { Request, Response } from "express";
import { MedicionesCalidad, Tanque } from "../models/tanque";
import sequelize from "../database/connection";

export const crearTanque = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction();
    try {
        const {tipoTanque, usuario_id, forma, profundidad, largo, ancho, diametro } = req.body;
        if (!tipoTanque || !usuario_id || !forma || !profundidad){
            await tra.rollback();
            res.status(400).json({ error: "Todos los campos son requeridos." });
        }

        const ultimo_id_usuario = await Tanque.max('tanque_id_usuario', {
            where: {usuario_id},
            transaction: tra,
        });
        const siguienteId = (Number(ultimo_id_usuario) || 0) + 1;
        let nombreFinal = '';
        if (!nombreFinal) {
            nombreFinal = `tanque ${siguienteId}`;
        }

        let volumenFinal;
        if(forma === 'Rectangular') {
            volumenFinal = Math.round(largo * ancho * profundidad * Math.pow(10, 2)) / Math.pow(10, 2);
        }
        if(forma === 'Redondo') {
            volumenFinal = Math.round(Math.PI * diametro * profundidad * Math.pow(10, 2)) /  Math.pow(10, 2);
        }
        const nuevoTanque = await Tanque.create(
            {nombre: nombreFinal, forma, profundidad, largo, ancho, diametro, volumen: volumenFinal, tipoTanque, disponible: true, usuario_id, tanque_id_usuario: siguienteId},
            { transaction: tra}
        );

        await tra.commit();
        res.status(201).json(nuevoTanque);
    } catch (error) {
        await tra.rollback();
        console.error(error);
        res.status(500).json({error: "Error interno del servidor"});
    }
}

export const obtenerTanqueId = async (req: Request, res: Response): Promise<any> => {
    try {
        const tanque_id = req.params.id;
        console.log(tanque_id)
        if (!tanque_id) {
            return res.status(400).json({ error: "tanque_id y usuario_id son requeridos." });
        }
        const tanque = await Tanque.findOne({ where: { id: tanque_id } });
        if (!tanque) {
            return res.status(404).json({ error: "Tanque no encontrado." });
        }
        return res.status(200).json(tanque);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

export const obtenerTanque = async (req: Request, res: Response): Promise<any> => {
    try {
        const usuario_id = req.params.usuario_id || req.body.usuario_id;
        if (!usuario_id) {
            res.status(400).json({ error: "usuario_id es requerido." });
        }
        const tanque = await Tanque.findAll({
            where: { usuario_id },
            include: [
                {model: MedicionesCalidad, as: "mediciones"}
            ]
        });
        if (!tanque) {
            res.status(404).json({ error: "Tanques no encontrados." });
        }
        res.status(200).json(tanque);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

export const eliminarTanque = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction(); 
    try {
        const tanque_id = req.params.id

        const usuario_id = (req as any).usuario?.id || req.body.usuario_id
        if (!tanque_id || !usuario_id) {
            await tra.rollback();
            return res.status(400).json({ error: "tanque_id y usuario_id son requeridos." });
        }
        const tanque = await Tanque.findOne({ where: { id: tanque_id, usuario_id } });
        if (!tanque) {
            await tra.rollback();
            return res.status(404).json({ error: "Tanque no encontrado." });
        }
        await MedicionesCalidad.destroy({where: {tanque_id}, transaction: tra})
        await tanque.destroy({transaction: tra});
        await tra.commit();
        return res.status(200).json({ message: "Tanque eliminado correctamente." });
    } catch (error) {
        await tra.rollback();
        console.error(error);
        return res.status(500).json({error: "Error interno del servidor"});
    }
}

export const editarTanque = async (req: Request, res: Response): Promise<any> => {
    const tanque_id = req.params.id;
    const { tipoTanque, usuario_id, forma, profundidad, largo, ancho, diametro , disponible } = req.body;
    try {
        console.log("Editar tanque:", tanque_id, usuario_id);
        if (!tanque_id || !usuario_id) {
            return res.status(400).json({ error: "tanque_id y usuario_id son requeridos." });
        }
        const tanque = await Tanque.findOne({ where: { id: tanque_id, usuario_id } });
        if (!tanque) {
            return res.status(404).json({ error: "Tanque no encontrado." });
        }
        
        let volumen;
        if (forma && profundidad) {
            if (forma === 'rectangular' && largo && ancho) {
                volumen = largo * ancho * profundidad;
            } else if (forma === 'redondo' && diametro) {
                volumen = Math.PI * Math.pow(diametro/2, 2) * profundidad;
            }
        }
        const camposActualizar = Object.entries({tipoTanque, forma, profundidad, 
            largo, ancho, diametro, volumen, disponible})
            .reduce((acc, [key, value]) => {
                if (value!== undefined) acc[key] = value;
                return acc;
            }, {} as any);
        
        if (Object.keys(camposActualizar).length === 0) {
            return res.status(400).json({error: "No se enviaron campos a actualizar"});
        } 
        await tanque.update(camposActualizar);

        res.status(200).json(tanque);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Error interno del servidor"});
    }
}

export const obtenerMedTanqueId = async (req: Request, res: Response): Promise<any> => {
    try {
        const tanque_id = req.params.tanque_id;
        console.log(tanque_id)
        if (!tanque_id) {
            return res.status(400).json({ error: "tanque_id son requeridos." });
        }
        const mediciones = await MedicionesCalidad.findAll({ where: { tanque_id }, order: [['createdAt', 'ASC']]});
        return res.status(200).json(mediciones || []);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}
export const actualizarMediciones = async (req: Request, res: Response): Promise<any> => {
    try {
        const tanque_id = req.params.tanque_id;
        const { ph, oxigeno_disuelto, temperatura, nitritos,
            amoniaco, nitratos, dureza, salinidad} = req.body;

        if (!tanque_id) {
            return res.status(400).json({error: "tanque_id es requerido."});
        }
        const medicion = await MedicionesCalidad.findOne({where: {tanque_id}, order: [['createdAt', 'DESC']]});
        if (!medicion) {
            return res.status(404).json({error: "Medicion no encontrada"})
        }
        const camposActualizar = Object.entries({ph, oxigeno_disuelto, temperatura, nitritos, amoniaco, nitratos, dureza, salinidad})
            .reduce((acc, [key, value]) => {
                if (value!== undefined) acc[key] = value;
                return acc;
            }, {} as any);

        if (Object.keys(camposActualizar).length === 0) {
            return res.status(400).json({error: "No se enviaron campos a actualizar"});
        }

        await medicion.update(camposActualizar);
        res.status(200).json(medicion);
    } catch (error) {
        return res.status(500).json({error:"Error interno del servidor"});
    }
}

export const nuevaMedicion = async (req: Request, res: Response): Promise<any> => {
    try {
        const tanque_id = req.params.tanque_id;
        const { ph, oxigeno_disuelto, temperatura, nitritos,
        amoniaco, nitratos, dureza, salinidad} = req.body;
        if (!tanque_id) {
            return res.status(400).json({error: "tanque_id es requerido."});
        }
        const nuevaMedicion = await MedicionesCalidad.create({
            tanque_id,
            ph,
            oxigeno_disuelto,
            temperatura,
            nitritos,
            amoniaco,
            nitratos,
            dureza,
            salinidad
        });
        return res.status(201).json(nuevaMedicion);
    } catch (error) {
        console.error(error)
        return res.status(500).json({error:"Error interno del servidor"});
    }
}