import { Request, Response } from "express";
import { Inventario } from "../models/inventario";
import sequelize from "../database/connection";

const MATERIAL_PERMITIDO = ['Alimento', 'Quimico', 'Maquina', 'Herramienta' ]
export const addInventario = async (req: Request, res: Response) => {
  const tra = await sequelize.transaction();
  try {
    const {
      tipo_material,
      nombre,
      provedor,
      cantidad,
      costo_insumo,
      costo_transporte,
      fecha_caducidad,
      peso_unidad,
      granularidad
    } = req.body;
    const usuarioId = (req as any).usuario.id; // tomado del token

    if (!tipo_material || !nombre || !provedor || cantidad == null || costo_insumo == null || costo_transporte == null) {
      await tra.rollback();
      return res.status(400).json({ error: "Todos los campos generales son requeridos." });
    }

    if (!MATERIAL_PERMITIDO.includes(tipo_material)) {
      await tra.rollback();
      return res.status(400).json({error: 'Top de material inválido'})
    }


    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      await tra.rollback();
      return res.status(400).json({error: 'La cantidad debe ser mayor a 0'})
    }

    if ((tipo_material === 'Alimento' || tipo_material === 'Quimico') && (!fecha_caducidad || peso_unidad == null || granularidad == null)) {
      await tra.rollback();
      return res.status(400).json({ error: "Campos extra requeridos para Alimento/Quimico." });
    }

    if (fecha_caducidad) {
      const fechaCad = new Date(fecha_caducidad);
      if (isNaN(fechaCad.getTime())) {
        await tra.rollback();
        return res.status(400).json({error: 'La fecha de caducidad debe ser futuro' });
      }
    }

    // const productoExistente = await Inventario.findOne({
    //   where: {
    //     usuario_id: usuarioId,
    //     tipo_material,
    //     nombre,
    //     provedor
    //   },
    //   transaction: tra
    // });

    // if (productoExistente) {
    //   await tra.rollback();
    //   return res.status(409).json({
    //     error: 'El producto ya existe',
    //     productoExistente
    //   })
    // }

   const item = await Inventario.create({
      usuario_id: usuarioId,
      tipo_material,
      nombre,
      provedor,
      cantidad,
      costo_insumo,
      costo_transporte,
      fecha_caducidad: (tipo_material === 'Alimento' || tipo_material === 'Quimico') ? fecha_caducidad : null,
      peso_unidad: (tipo_material === 'Alimento' || tipo_material === 'Quimico') ? peso_unidad : null,
      granularidad: (tipo_material === 'Alimento' || tipo_material === 'Quimico') ? granularidad : null
    }, { transaction: tra });

    await tra.commit();
    res.status(201).json(item);
  } catch (err) {
    await tra.rollback();
    console.error(err);
    res.status(500).json({ message: "Error agregando al inventario" });
  }
};
export const getInventario = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario.id;
    const items = await Inventario.findAll({
      where: { usuario_id: usuarioId },
      order: [['id', 'DESC']]
    });
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo inventario" });
  }
};
export const getInventarioById = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario.id;
    const item = await Inventario.findOne({
      where: { id: req.params.id, usuario_id: usuarioId },
    });

    if (!item) return res.status(404).json({ message: "Item no encontrado" });
    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo item" });
  }
};
export const updateInventario = async (req: Request, res: Response) => {
  const tra = await sequelize.transaction();
  try {
    const usuarioId = (req as any).usuario.id;
    const {
      nombre,
      provedor,
      cantidad,
      costo_insumo,
      costo_transporte,
      tipo_material,
      fecha_caducidad,
      peso_unidad,
      granularidad
    } = req.body;

    const item = await Inventario.findOne({
      where: { id: req.params.id, usuario_id: usuarioId },
      transaction: tra
    }) as any;

    if (!item) {
      await tra.rollback();
      return res.status(404).json({ error: "Item no encontrado" });
    }

    item.nombre = nombre ?? item.nombre;
    item.provedor = provedor ?? item.provedor;
    item.cantidad = cantidad ?? item.cantidad;
    item.costo_insumo = costo_insumo ?? item.costo_insumo;
    item.costo_transporte = costo_transporte ?? item.costo_transporte;
    item.tipo_material = tipo_material ?? item.tipo_material;

    if (item.tipo_material === 'Alimento' || item.tipo_material === 'Quimico') {
      item.fecha_caducidad = fecha_caducidad ?? item.fecha_caducidad;
      item.peso_unidad = peso_unidad ?? item.peso_unidad;
      item.granularidad = granularidad ?? item.granularidad;
    }

    await item.save({transaction: tra});
    await tra.commit();

    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error actualizando item" });
  }
};
export const deleteInventario = async (req: Request, res: Response) => {
  const tra = await sequelize.transaction();
  try {
    const usuarioId = (req as any).usuario.id;
    const item = await Inventario.findOne({
      where: { id: req.params.id, usuario_id: usuarioId },
      transaction: tra
    });

    if (!item) {
      await tra.rollback();
      return res.status(404).json({ message: "Item no encontrado" });
    }

    await item.destroy({transaction: tra});
    await tra.commit();
    res.status(200).json({ message: "Item eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error eliminando item" });
  }
};
