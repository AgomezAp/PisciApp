import { Request, Response } from "express";

import { Tanque } from "../models/tanque";

export const crearTanque = async (req: Request, res: Response) => {
    try {
        const { volumen, nombre, tipoTanque } = req.body;
        if (!volumen || !tipoTanque){
            return res.status(400).json({ error: "Todos los campos son requeridos." });
        }
        let nombreFinal = nombre;
        if (!nombreFinal) {
            const ultimoTanque = await Tanque.findOne({ order: [['id', 'DESC']] });
            const siguienteId = ultimoTanque ? ultimoTanque.id + 1 : 1;
            nombreFinal = `tanque ${siguienteId}`;
        }
        const nuevoTanque = await Tanque.create({nombre, volumen, tipoTanque, disponible: true});
        return res.status(201).json(nuevoTanque);
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"})
    }
}