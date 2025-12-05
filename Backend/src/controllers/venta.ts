import { Request, Response } from "express";
import { Venta,  Comprador} from '../models/venta'
import sequelize from "../database/connection";
import { Ciclo } from "../models/ciclo";

export const crearVenta = async (req: Request, res: Response): Promise<any> => {
    const usuarioId = (req as any).usuario.id;
    const tra = await sequelize.transaction();
    try {
        const {
            toneladas,
            precio,
            ciclo_id_usuario,
            comprador_id,
            nombre,
            empresa,
            direccion,
            correo,
            telefono
        } = req.body;

        if (!toneladas || !precio || !ciclo_id_usuario){
            await tra.rollback()
            return res.status(400).json({
                error: "faltan campos necesarios"
            });
        }

        // ✅ Validar que el ciclo existe y pertenece al usuario
        const ciclo = await Ciclo.findOne({
            where: { 
                ciclo_id_usuario,
                usuario_id: usuarioId 
            },
            transaction: tra
        }) as any;

        if (!ciclo) {
            await tra.rollback();
            return res.status(404).json({ 
                error: "Ciclo no encontrado o no pertenece al usuario" 
            });
        }

        // ✅ Validar que el ciclo no esté cerrado
        if (ciclo.fecha_fin !== null) {
            await tra.rollback();
            return res.status(400).json({ 
                error: "No se puede vender de un ciclo ya cerrado" 
            });
        }

        // ✅ Validar que hay peces disponibles para vender
        const pecesDisponibles = ciclo.numero_actual || 0;

        if (pecesDisponibles === 0) {
            await tra.rollback();
            return res.status(400).json({ 
                error: "No hay peces disponibles para vender en este ciclo" 
            });
        }

        let compradorIdFinal: number;

        if (comprador_id) {
            const exite = await Comprador.findByPk(comprador_id);

            if (!exite) {
                await tra.rollback();
                return res.status(404).json({
                    error: "El comprador no existe"
                });
            }
            compradorIdFinal = comprador_id;
        } else {
            if (!nombre || !empresa || !direccion || !correo ) {
                await tra.rollback();
                return res.status(400).json({
                    error: "Faltan datos de comprador"
                });
            }

            let comprador = await Comprador.findOne({
                where: { 
                    correo,
                    usuario_id: usuarioId  // ✅ Solo buscar compradores del mismo usuario
                },
                transaction: tra
            });

            if (!comprador) {
                comprador = await Comprador.create({
                    usuario_id: usuarioId,
                    nombre,
                    empresa,
                    direccion,
                    correo,
                    telefono: telefono || null
                }, {transaction:  tra});
            }

            compradorIdFinal = (comprador as any).id
        }

        const nuevaVenta = await Venta.create({
            usuario_id: usuarioId,
            toneladas,
            precio,
            ciclo_id_usuario,
            comprador_id: compradorIdFinal
        }, { transaction: tra});

        // ✅ La venta es del total del ciclo, poner numero_actual en 0
        await ciclo.update({ numero_actual: 0 }, { transaction: tra });

        await tra.commit();

        const ventaCompleta = await Venta.findByPk((nuevaVenta as any).id, {
            include: [{
                model: Comprador,
                as: 'comprador'
            }]
        });

        return res.status(201).json({
            message: "Venta creada exitosamente",
            venta: ventaCompleta
        });
    } catch (error) {
        await tra.rollback();
        console.error("Error al crear venta:", error);
        return res.status(500).json({ 
            error: "Error al crear la venta",
            details: error 
        });
    }

}

export const obtenerVentasPorUsuario = async (req: Request, res: Response): Promise<any> => {
    const usuarioId = (req as any).usuario.id;
    try {
        const ventas = await Venta.findAll({
            where: { usuario_id: usuarioId },
            include: [{
                model: Comprador,
                as: 'comprador'
            }]
        });

        return res.status(200).json({
            ventas
        });
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        return res.status(500).json({
            error: "Error al obtener las ventas",
            details: error
        });
    }
};

export const obtenerCompradores = async (req: Request, res: Response): Promise<any> => {
    const usuarioId = (req as any).usuario.id;
    try {
        const compradores = await Comprador.findAll({
            where: { usuario_id: usuarioId }
        });

        return res.status(200).json({
            compradores
        });
    } catch (error) {
        console.error("Error al obtener compradores:", error);
        return res.status(500).json({
            error: "Error al obtener los compradores",
            details: error
        });
    }
};