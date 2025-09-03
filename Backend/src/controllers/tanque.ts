import { Request, Response } from "express";

import { MedicionesCalidad, Tanque } from "../models/tanque";
import sequelize from "../database/connection";

export const crearTanque = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction();
    try {
        const { volumen, nombre, tipoTanque, usuario_id } = req.body;
        if (!volumen || !tipoTanque || !usuario_id){
            await tra.rollback();
            res.status(400).json({ error: "Todos los campos son requeridos." });
        }
        let nombreFinal = nombre;
        if (!nombreFinal) {
            const cantidadTanques = await Tanque.count({ where: { usuario_id }});
            const siguienteId = cantidadTanques + 1;
            nombreFinal = `tanque ${siguienteId}`;
        }
        const nuevoTanque = await Tanque.create(
            {nombre: nombreFinal, volumen, tipoTanque, disponible: true, usuario_id},
            { transaction: tra}
        );

        await MedicionesCalidad.create({
            tanque_id: nuevoTanque.dataValues.id,
            ph: 0,
            oxigeno_disuelto: 0,
            temperatura: 0,
            nitritos: 0,
            amoniaco: 0,
            nitratos: 0,
            dureza: 0,
            salinidad: 0 }, { transaction: tra});
        await tra.commit();
        res.status(201).json(nuevoTanque);
    } catch (error) {
        await tra.rollback();
        console.error(error);
        res.status(500).json({error: "Error interno del servidor"});
    }
}

export const eliminarTanque = async (req: Request, res: Response) => {
    const tra = await sequelize.transaction(); 
    try {
        const {tanque_id, usuario_id} = req.body;
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
    const { usuario_id, nombre, volumen, tipoTanque, disponible } = req.body;
    try {
        console.log("Editar tanque:", tanque_id, usuario_id);
        if (!tanque_id || !usuario_id) {
            return res.status(400).json({ error: "tanque_id y usuario_id son requeridos." });
        }
        const tanque = await Tanque.findOne({ where: { id: tanque_id, usuario_id } });
        if (!tanque) {
            return res.status(404).json({ error: "Tanque no encontrado." });
        }
        console.log(tanque.dataValues)
        tanque.nombre =  nombre || tanque.nombre;
        tanque.volumen =  volumen || tanque.volumen;
        tanque.tipoTanque =  tipoTanque || tanque.tipoTanque;
        tanque.disponible =  disponible || tanque.disponible;
        console.log(tanque.dataValues)

        await tanque.save();
        res.status(200).json(tanque);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Error interno del servidor"});
    }
}

export const actualizarMediciones = async (req: Request, res: Response) => {
    try {
        const {tanque_id, ph, oxigeno_disuelto, temperatura, nitritos,
            amoniaco, nitratos, dureza, salinidad} = req.body;

        if (!tanque_id) {
            return res.status(400).json({error: "tanque_id es requerido."});
        }
        const medicion = await MedicionesCalidad.findOne({where: {tanque_id}, order: [['createdAt', 'DESC']]});
        if (!medicion) {
            return res.status(404).json({error: "Medicion no encontrada"})
        }
        if (ph !== undefined) medicion.ph = ph;
        if (oxigeno_disuelto !== undefined) medicion.oxigeno_disuelto = oxigeno_disuelto;
        if (temperatura !== undefined) medicion.temperatura = temperatura;
        if (nitritos !== undefined) medicion.nitritos = nitritos;
        if (amoniaco !== undefined) medicion.amoniaco = amoniaco;
        if (nitratos !== undefined) medicion.nitratos = nitratos;
        if (dureza !== undefined) medicion.dureza = dureza;
        if (salinidad !== undefined) medicion.salinidad = salinidad;
        await medicion.save();
        return res.status(200).json(medicion);
    } catch (error) {
        return res.status(500).json({error:"Error interno del servidor"});
    }
}