import { Request, Response } from "express";
import { Ciclo, Alimento, Quimico, Bajas, CicloTanque, MovimientoTanque } from "../models/ciclo";
import { Tanque } from "../models/tanque";
import { error } from "console";

export const crearCiclo = async (req: Request, res: Response) => {
    try {
        const { usuario_id, tanques, numero_peces, costos, fecha_inicio } = req.body;

        if (!usuario_id  || !tanques  || !numero_peces  || !costos  || !fecha_inicio ) {
            return res.status(400).json({ error: "Todos los campos son requeridos." });
        }
        const tanquesArray = Array.isArray(tanques) ? tanques : [tanques];
        const nuevoCiclo = await Ciclo.create({ usuario_id, tanques, numero_peces, costos, fecha_inicio });
        
        for(const tanque_id of tanquesArray) {
            await CicloTanque.create({ciclo_id: nuevoCiclo.id, tanque_id, numero_peces});
        }

        res.status(201).json(nuevoCiclo)
    } catch (error) {
        return res.status(500).json({ error: "Error interno del servidor." });
    }
}

export const cerrarCiclo = async (req: Request, res: Response) => {
    try {
        const { usuario_id, ciclo_id, fecha_fin} = req.body;
        if(!ciclo_id || !fecha_fin || !usuario_id) {
            return res.status(400).json({error: "ciclo y fecha son requeridos"});
        }
        const ciclo = await Ciclo.findOne({where: {id: ciclo_id, usuario_id}});
        if (!ciclo) {
            return res.status(404).json({error: "Ciclo no encotrado"})
        }
        if (ciclo.fecha_fin){
            return res.status(400).json({error: "el ciclo fue cerrado en " + ciclo.fecha_fin})
        }
        ciclo.fecha_fin = fecha_fin;
        res.status(200).json({message:"Ciclo cerrado correctamente", ciclo})
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
}

export const actualizarBajas = async (req: Request, res: Response) => {
    try {
        const { ciclo_id, cantidad, id_tanque} = req.body;
        if (!ciclo_id || !cantidad || !id_tanque) {
            return res.status(400).json({error: "Todos los campos son obligatorios"})
        }
        const ciclo = await Ciclo.findByPk(ciclo_id);
        if (!ciclo) {
            return res.status(404).json({ error: "Ciclo no encontrado." });
        }
        await Bajas.create({ ciclo_id, cantidad, id_tanque});
        ciclo.bajas = (ciclo.bajas ?? 0) + cantidad;
        ciclo.numero_peces = (ciclo.numero_peces ?? 0) - cantidad;
        await ciclo.save();
        res.status(200).json(ciclo);
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"})
    }
}

export const ingresarAlimento = async (req: Request, res: Response) => {
    try {
        const {ciclo_id, cantidad, costo, nombre, descripcion} = req.body

        if (!ciclo_id || !cantidad || !nombre || !descripcion) {
            return res.status(400).json({error: "Todos los campos son requeridos."})
        }
        const ciclo = await Ciclo.findByPk(ciclo_id);
        if (!ciclo) {
            return res.status(404).json({error: "Ciclo no encontrado."})
        }
        await Alimento.create({ciclo_id, cantidad, costo, nombre, descripcion});
        if (costo) {
            ciclo.costos = (ciclo.costos ?? 0) + costo;
        }
        await ciclo.save()
        res.status(201).json(ciclo)
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"})
    }
}

export const ingresarQuimico = async (req: Request, res: Response) => {
    try {
        const {ciclo_id, cantidad, costo, nombre, descripcion} = req.body

        if (!ciclo_id || !cantidad || !nombre || !descripcion) {
            return res.status(400).json({error: "Todos los campos son requeridos."})
        }
        const ciclo = await Ciclo.findByPk(ciclo_id);
        if (!ciclo) {
            return res.status(404).json({error: "Ciclo no encontrado."})
        }
        await Quimico.create({ciclo_id, cantidad, costo, nombre, descripcion})
        if (costo) {
            ciclo.costos = (ciclo.costos ?? 0) + costo;
        }
        await ciclo.save();
        res.status(201).json(ciclo)
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"})
    }
}

export const cambiarTanque = async (req: Request, res: Response) => {
    try {
        const { ciclo_id, origen, destino, cantidad} = req.body;
        if (!ciclo_id || !origen || !destino || !cantidad) {
            return res.status(400).json({error: "Todos los campos son requeridos."})
        }
        // Verificar que el tanque de origen pertenece al ciclo
        const cicloTanqueOrigenCheck = await CicloTanque.findOne({ where: { ciclo_id, tanque_id: origen } });
        if (!cicloTanqueOrigenCheck) {
            return res.status(400).json({ error: "El tanque de origen no pertenece al ciclo." });
        }
        const ciclo = await Ciclo.findByPk(ciclo_id);
        if (!ciclo) {
            return res.status(404).json({ error: "Ciclo no encontrado." });
        }
        const tanqueOrigen = await Tanque.findByPk(origen);
        const tanqueDestino = await Tanque.findByPk(destino);
        if (origen === destino) {
            return res.status(400).json({ error: "El tanque de origen y destino no pueden ser el mismo." });
        }
        if (!tanqueOrigen || !tanqueDestino) {
            return res.status(404).json({ error: "Tanque origen o destino no encontrado." });
        }
        if (!tanqueDestino.disponible){
            return res.status(400).json({error: "Tanque destino no esta disponible"});
        }

        await MovimientoTanque.create({ciclo_id, origen, destino, cantidad});
        
        const cicloTanqueOrigen = await CicloTanque.findOne({where: { ciclo_id, tanque_id: origen}});
        const cicloTanqueDestino = await CicloTanque.findOne({where: { ciclo_id, tanque_id: destino}});

        if (!cicloTanqueOrigen || cicloTanqueOrigen.numero_peces < cantidad) {
            return res.status(400).json({ error: "No hay suficientes peces en el tanque de origen." });
        }

        cicloTanqueOrigen.numero_peces -= cantidad;
        await cicloTanqueOrigen.save();

        if (cicloTanqueDestino) {
            cicloTanqueDestino.numero_peces += cantidad;
            await cicloTanqueDestino.save()
        } else {
            await CicloTanque.create({ciclo_id, tanque_id: destino, numero_peces: cantidad});
        }

        if (cicloTanqueOrigen.numero_peces === 0) {
            tanqueOrigen.disponible = true;
            await tanqueOrigen.save();
            await CicloTanque.destroy({where: { ciclo_id, tanque_id: origen}});
        }

        tanqueDestino.disponible = false;
        await tanqueDestino.save();
        res.status(200).json(ciclo);
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"})
    }
}