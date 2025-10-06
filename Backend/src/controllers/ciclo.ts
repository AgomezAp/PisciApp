import { Request, Response } from "express";
import { Ciclo, Alimento, Quimico, Bajas, CicloTanque, MovimientoTanque } from "../models/ciclo";
import { Tanque } from "../models/tanque";
import sequelize from "../database/connection";
export const crearCiclo = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction();
    try {
        const { usuario_id, tanques, numero_peces,especie, costos, fecha_inicio , costos_transporte} = req.body;
        if (!usuario_id  || !tanques  || !numero_peces  || !costos  || !fecha_inicio || !especie) {
            await tra.rollback()
            return res.status(400).json({ error: "Todos los campos son requeridos." });
        }
        const tanqueSeleccionado = await Tanque.findByPk(tanques, {transaction:tra,});
        if(!tanqueSeleccionado) {
            await tra.rollback();
            return res.status(404).json({error: "El tanque seleccionado no existe"});
        }

        if(tanqueSeleccionado.get('disponible') === false) {
            await tra.rollback();
            return res.status(409).json({error: "El tanque seleccionado no esta disponible"});
        }

        const ultimo_id_usuario = await Ciclo.max('ciclo_id_usuario', {
            where: { usuario_id },
            transaction: tra,
        });
        const siguienteId = (Number(ultimo_id_usuario) || 0) + 1;
        const nuevoCiclo = await Ciclo.create({ usuario_id, numero_peces, numero_actual: numero_peces,especie, costos, fecha_inicio, costos_transporte, ciclo_id_usuario: siguienteId }, {transaction: tra}) as any;
        const nuevoCT = await CicloTanque.create({ciclo_id: nuevoCiclo.id, tanque_id: tanques, numero_peces}, {transaction: tra});
        const update = await tanqueSeleccionado.update({disponible: false}, {transaction: tra});
        await tra.commit();
        res.status(201).json(nuevoCiclo)
    } catch (error) {
        await tra.rollback();
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
}

export const verCiclo = async (req: Request, res: Response): Promise<any> => {
    try {
        const { usuario_id } = req.params;
        if (!usuario_id) {
            return res.status(400).json({ error: "El usuario_id es requerido." });
        }
        const ciclo = await Ciclo.findAll({
            where: { usuario_id },
            include: [
                { model: CicloTanque, as: "ciclotanques_ciclo"},
                { model: Alimento, as: "alimentos" },
                { model: Quimico, as: "quimicos" },
                { model: Bajas, as: "bajas_ciclo" },
                { model: MovimientoTanque, as: "movimientos_tanque" }
            ]
        });
        res.status(200).json(ciclo);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor." });
        console.error(error)
    }
}

export const cerrarCiclo = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction();
    try {
        const { usuario_id, ciclo_id, fecha_fin} = req.body;
        if(!ciclo_id || !fecha_fin || !usuario_id) {
            await tra.rollback();
            return res.status(400).json({error: "ciclo y fecha son requeridos"});
        }
        const ciclo = await Ciclo.findOne({where: {id: ciclo_id, usuario_id}, transaction: tra}) as any;
        if (!ciclo) {
            await tra.rollback();
            return res.status(404).json({error: "Ciclo no encotrado"})
        }
        if (ciclo.fecha_fin){
            await tra.rollback();
            return res.status(400).json({error: "el ciclo fue cerrado en " + ciclo.fecha_fin})
        }
        if (ciclo.numero_actual > 0 ){
            await tra.rollback();
            return res.status(400).json({error: "Aun tienes existencia de peces en el ciclo"});
        }
        ciclo.fecha_fin = fecha_fin;
        await Ciclo.update({fecha_fin: fecha_fin}, {where: {id: ciclo_id, usuario_id}, transaction: tra});
        await tra.commit();
        res.status(200).json({message:"Ciclo cerrado correctamente", ciclo})
    } catch (error) {
        await tra.rollback();
        res.status(500).json({error: "Error interno del servidor"})
        console.error(error)
    }
}

export const actualizarBajas = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction();
    try {
        const ciclo_id = req.params.ciclo_id;
        const { cantidad, tanque_id} = req.body;
        if (!ciclo_id || !cantidad || !tanque_id) {
            await tra.rollback();
            return res.status(400).json({error: "Todos los campos son obligatorios"})
        }
        
        if (cantidad <= 0) {
            await tra.rollback();
            return res.status(400).json({error: 'La cantidad debe ser mayor a cero'})
        }
        const ciclo = await Ciclo.findByPk(ciclo_id, {transaction: tra}) as any;
        if (!ciclo) {
            await tra.rollback();
            return res.status(404).json({ error: "Ciclo no encontrado." });
        }
        if (ciclo.fecha_fin !== null) {            
            await tra.rollback();
            return res.status(404).json({ error: "El Ciclo ya se encuentra finalizado." });
        } 
        const cicloTanque = await CicloTanque.findOne({ where: { ciclo_id, tanque_id }, transaction: tra }) as any;
        if (!cicloTanque) {
            await tra.rollback();
            return res.status(404).json({ error: "El tanque no pertenece al ciclo seleccionado" });
        }
        const pecesActuales = ciclo.numero_actual ?? 0;
        if(cantidad > pecesActuales) {
            await tra.rollback();
            return res.status(400).json({error: `No puedes dar de baja ${cantidad} peces. Solo hay ${pecesActuales} disponibles.`})
        }
        await Bajas.create({ ciclo_id, cantidad, tanque_id}, {transaction: tra});

        await ciclo.increment('total_bajas', {by: cantidad, transaction: tra});
        await ciclo.decrement('numero_actual', {by: cantidad, transaction: tra});
        await cicloTanque.decrement('numero_peces', {by: cantidad, transaction: tra});

        await tra.commit();

        const cicloActualizado = await Ciclo.findByPk(ciclo_id);
        res.status(200).json(cicloActualizado);
    } catch (error) {
        await tra.rollback();
        res.status(500).json({error: "Error interno del servidor"});
        console.error(error)
    }
}

export const ingresarAlimento = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction();
    try {
        const ciclo_id = req.params.ciclo_id
        const {cantidad, costo, nombre, descripcion} = req.body
        if (!ciclo_id || !cantidad || !costo) {
            await tra.rollback();
            return res.status(400).json({error: "Todos los campos son requeridos."})
        }
        const ciclo = await Ciclo.findByPk(ciclo_id, {transaction: tra}) as any;
        if (!ciclo) {
            await tra.rollback();
            return res.status(404).json({error: "Ciclo no encontrado."})
        }
        if (ciclo.fecha_fin !== null) {            
            await tra.rollback();
            return res.status(404).json({ error: "El Ciclo ya se encuentra finalizado." });
        }
        const nuevoAlimento = await Alimento.create({ciclo_id, cantidad, costo, nombre, descripcion}, {transaction: tra});
        await ciclo.increment('costos', {by: costo, transaction: tra});
        await tra.commit();
        res.status(201).json(nuevoAlimento)
    } catch (error) {
        await tra.rollback();
        res.status(500).json({error: "Error interno del servidor"});
        console.error(error)
    }
}

export const ingresarQuimico = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction();
    try {
        const ciclo_id = req.params.ciclo_id
        const { cantidad, costo, nombre, descripcion} = req.body
        if (!ciclo_id || !cantidad || !costo) {
            await tra.rollback();
            return res.status(400).json({error: "Todos los campos son requeridos."})
        }
        const ciclo = await Ciclo.findByPk(ciclo_id, {transaction: tra}) as any;
        if (!ciclo) {
            await tra.rollback();
            return res.status(404).json({error: "Ciclo no encontrado."})
        }
        if (ciclo.fecha_fin !== null) {            
            await tra.rollback();
            return res.status(404).json({ error: "El Ciclo ya se encuentra finalizado." });
        } 
        const nuevoQuimico = await Quimico.create({ciclo_id, cantidad, costo, nombre, descripcion}, {transaction: tra})
        await ciclo.increment('costos', {by: costo, transaction: tra});
        await tra.commit();
        res.status(201).json(nuevoQuimico)
    } catch (error) {
        await tra.rollback();
        res.status(500).json({error: "Error interno del servidor"});
        console.error(error)
    }
}

export const cambiarTanque = async (req: Request, res: Response): Promise<any> => {
    const tra = await sequelize.transaction();
    try {
        const ciclo_id = req.params.ciclo_id
        const { origen, destino, cantidad} = req.body;
        if (!ciclo_id || !origen || !destino || !cantidad) {
            await tra.rollback();
            return res.status(400).json({error: "Todos los campos son requeridos."})
        }
        if (origen === destino) {
            await tra.rollback();
            return res.status(400).json({ error: "El tanque de origen y destino no pueden ser el mismo." });
        }
        // Verificar que el tanque de origen pertenece al ciclo
        const cicloTanqueOrigenCheck = await CicloTanque.findOne({ where: { ciclo_id, tanque_id: origen }, transaction: tra}) as any;
        if (!cicloTanqueOrigenCheck) {
            await tra.rollback();
            return res.status(400).json({ error: "El tanque de origen no pertenece al ciclo." });
        }
        const [ciclo, tanqueOrigen, tanqueDestino] = await Promise.all([
            Ciclo.findByPk(ciclo_id, {transaction: tra}),
            Tanque.findByPk(origen, {transaction: tra}) as any,
            Tanque.findByPk(destino, {transaction: tra}) as any
        ]);
        if (!ciclo || !tanqueOrigen || !tanqueDestino) {
            await tra.rollback();
            return res.status(404).json({ error: "Ciclo o Tanque no encontrado." });
        }
        if (ciclo.get('fecha_fin') !== null) {            
            await tra.rollback();
            return res.status(404).json({ error: "El Ciclo ya se encuentra finalizado." });
        } 
        if (!tanqueDestino.disponible){
            await tra.rollback();
            return res.status(400).json({error: "Tanque destino no esta disponible"});
        }
        if (cicloTanqueOrigenCheck.numero_actual < cantidad) {
            await tra.rollback();
            return res.status(400).json({error: "No hay suficientes peces en el tanque de origen."});
        }
        let cicloTanqueDestino = await CicloTanque.findOne({where: { ciclo_id, tanque_id: destino}, transaction: tra}) as any;

        if (!cicloTanqueDestino) {
            cicloTanqueDestino = await CicloTanque.create({ ciclo_id, tanque_id: destino, numero_peces: 0 }, { transaction: tra });
        }
        await cicloTanqueOrigenCheck.decrement('numero_peces', {by: cantidad, transaction: tra});
        await cicloTanqueDestino.increment('numero_peces', {by: cantidad, transaction: tra});
        
        const nuevoConteoOrigen = cicloTanqueOrigenCheck.numero_peces - cantidad;
        if(nuevoConteoOrigen === 0) {
            await CicloTanque.destroy({where: {ciclo_id, tanque_id: origen}, transaction:tra});
            await Tanque.update({disponible: true}, {where: {id: origen}, transaction: tra})
        }
        await Tanque.update({disponible: false}, {where: {id: destino}, transaction: tra})

        const movTanque = await MovimientoTanque.create({ciclo_id, origen, destino, cantidad}, {transaction: tra});
        await tra.commit();
        res.status(200).json(movTanque);
    } catch (error) {
        await tra.rollback();
        console.error(error)
        return res.status(500).json({error: "Error interno del servidor"});
    }
}