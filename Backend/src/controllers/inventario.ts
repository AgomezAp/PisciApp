import { Request, Response } from "express";
import { Inventario } from "../models/inventario";
import { Producto } from "../models/producto";

export const addInventario = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, cantidad, unidad } = req.body;

    const item = await Inventario.create({ nombre, descripcion, cantidad, unidad });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error agregando al inventario" });
  }
};
export const getInventario = async (req: Request, res: Response) => {
  try {
    const items = await Inventario.findAll();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo inventario" });
  }
};
export const getInventarioById = async (req: Request, res: Response) => {
  try {
    const item = await Inventario.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item no encontrado" });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obteniendo item" });
  }
};
export const updateInventario = async (req: Request, res: Response) => {
  try {
    const { cantidad, nombre, descripcion, unidad } = req.body;
    const item = await Inventario.findByPk(req.params.id);

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
    const item = await Inventario.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item no encontrado" });

    await item.destroy();
    res.json({ message: "Item eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error eliminando item" });
  }
};