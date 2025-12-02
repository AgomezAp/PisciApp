import { Request, Response } from "express";
import { Venta,  Comprador} from '../models/venta'
import sequelize from "../database/connection";

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
                where: { correo },
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
            usuarioId: usuarioId,
            toneladas,
            precio,
            ciclo_id_usuario,
            comprador_id: compradorIdFinal
        }, { transaction: tra});

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
            where: { usuarioId },
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