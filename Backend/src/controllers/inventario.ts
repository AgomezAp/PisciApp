import { Request, Response } from "express";
import { Inventario } from "../models/inventario";
import { Producto } from "../models/producto";

export const addInventario = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, cantidad, unidad } = req.body;
    const usuarioId = (req as any).usuario.id; // tomado del token

    const item = await Inventario.create({
      usuario_id: usuarioId,
      nombre,
      descripcion,
      cantidad,
      unidad,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error agregando al inventario" });
  }
};
export const getInventario = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario.id;
    const items = await Inventario.findAll({
      where: { usuario_id: usuarioId },
    });
    res.json(items);
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
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo item" });
  }
};
export const updateInventario = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario.id;
    const { cantidad, nombre, descripcion, unidad } = req.body;

    const item = await Inventario.findOne({
      where: { id: req.params.id, usuario_id: usuarioId },
    });

    if (!item) return res.status(404).json({ message: "Item no encontrado" });

    item.nombre = nombre || item.nombre;
    item.descripcion = descripcion || item.descripcion;
    item.cantidad = cantidad ?? item.cantidad;
    item.unidad = unidad || item.unidad;

    await item.save();

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error actualizando item" });
  }
};
export const deleteInventario = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario.id;
    const item = await Inventario.findOne({
      where: { id: req.params.id, usuario_id: usuarioId },
    });

    if (!item) return res.status(404).json({ message: "Item no encontrado" });

    await item.destroy();
    res.json({ message: "Item eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error eliminando item" });
  }
};
