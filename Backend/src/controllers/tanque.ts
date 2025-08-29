import { Request, Response } from "express";

import { MedicionesCalidad, Tanque } from "../models/tanque";

export const crearTanque = async (req: Request, res: Response) => {
    try {
        const { volumen, nombre, tipoTanque, usuario_id } = req.body;
        if (!volumen || !tipoTanque || !usuario_id){
            return res.status(400).json({ error: "Todos los campos son requeridos." });
        }
        let nombreFinal = nombre;
        if (!nombreFinal) {
            const ultimoTanque = await Tanque.findOne({ where: { usuario_id }, order: [['id', 'DESC']] });
            const siguienteId = ultimoTanque ? ultimoTanque.id + 1 : 1;
            nombreFinal = `tanque ${siguienteId}`;
        }
        const nuevoTanque = await Tanque.create({nombre: nombreFinal, volumen, tipoTanque, disponible: true, usuario_id});

        await MedicionesCalidad.create({
            tanque_id: nuevoTanque.id,
            ph: 0,
            oxigeno_disuelto: 0,
            temperatura: 0,
            nitritos: 0,
            amoniaco: 0,
            nitratos: 0,
            dureza: 0,
            salinidad: 0 })
        return res.status(201).json(nuevoTanque);
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"});
    }
}

export const eliminarTanque = async (req: Request, res: Response) => {
    try {
        const {tanque_id, usuario_id} = req.body;
        if (!tanque_id || !usuario_id) {
            return res.status(400).json({ error: "tanque_id y usuario_id son requeridos." });
        }
        const tanque = await Tanque.findOne({ where: { id: tanque_id, usuario_id } });
        if (!tanque) {
            return res.status(404).json({ error: "Tanque no encontrado." });
        }
        await tanque.destroy();
        return res.status(200).json({ message: "Tanque eliminado correctamente." });
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"});
    }
}

export const editarTanque = async (req: Request, res: Response) => {
    try {
        const { tanque_id, usuario_id, nombre, volumen, tipoTanque, disponible } = req.body;
        if (!tanque_id || !usuario_id) {
            return res.status(400).json({ error: "tanque_id y usuario_id son requeridos." });
        }
        const tanque = await Tanque.findOne({ where: { id: tanque_id, usuario_id } });
        if (!tanque) {
            return res.status(404).json({ error: "Tanque no encontrado." });
        }
        if (nombre !== undefined) tanque.nombre = nombre;
        if (volumen !== undefined) tanque.volumen = volumen;
        if (tipoTanque !== undefined) tanque.tipoTanque = tipoTanque;
        if (disponible !== undefined) tanque.disponible = disponible;
        await tanque.save();
        return res.status(200).json(tanque);
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"});
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