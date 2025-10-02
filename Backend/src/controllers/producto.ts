import { Request, Response } from "express";
import { Producto } from "../models/producto";
//import { error } from "console";

export const createProducto = async (req: Request, res: Response) => {
  try {
    const { nombre, precio, stock, descripcion, categoria, marca, unidad_medida, imagen_url } = req.body;

    // Validaciones básicas
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      return res.status(400).json({ message: "El nombre del producto es obligatorio y debe ser un texto válido" });
    }

    if (precio === undefined || isNaN(Number(precio)) || Number(precio) < 0) {
      return res.status(400).json({ message: "El precio es obligatorio y debe ser un número mayor o igual a 0" });
    }

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: "El stock es obligatorio y debe ser un número mayor o igual a 0" });
    }

    const data = await Producto.create({
      nombre: nombre.trim(),
      precio: Number(precio),
      stock: Number(stock),
      descripcion: descripcion || null,
      categoria: categoria || null,
      marca: marca || null,
      unidad_medida: unidad_medida || null,
      imagen_url: imagen_url || null,
    });

    return res.status(201).json({
      message: "Producto creado correctamente",
      data,
    });

  } catch (err: any) {
    console.error("Error en createProducto:", err);

     if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({ message: "Error de conexión a la base de datos" });
    }

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Error de validación en la base de datos",
        errors: err.errors,
      });
    } 

    return res.status(500).json({ message: "Error interno al crear el producto" });
  }
};
export const getProducto = async (req: Request, res: Response) => {
  try {
    const data = await Producto.findAll();

    if (!data || data.length === 0) {
      return res.status(204).json({ message: "No hay productos registrados" });
    }

    return res.status(200).json({
      message: "Lista de productos obtenida correctamente",
      total: data.length,
      data,
    });

  } catch (err: any) {
    console.error("Error en getProductos:", err);

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({ message: "Error de conexión a la base de datos" });
    }

    return res.status(500).json({ message: "Error interno al obtener los productos" });
  }
};
export const updateProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const producto = await Producto.findOne({ where: { id } });
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (nombre !== undefined && (typeof nombre !== "string" || nombre.trim() === "")) {
      return res.status(422).json({ message: "El nombre debe ser un texto válido" });
    }

    if (precio !== undefined && (isNaN(Number(precio)) || Number(precio) < 0)) {
      return res.status(422).json({ message: "El precio debe ser un número mayor o igual a 0" });
    }

    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(422).json({ message: "El stock debe ser un número mayor o igual a 0" });
    }

    if (nombre) {
      const existente = await Producto.findOne({ where: { nombre } });
      if (existente && existente.id !== producto.id) {
        return res.status(409).json({ message: "Ya existe otro producto con este nombre" });
      }
    }

    if (nombre) producto.nombre = nombre.trim();
    if (precio !== undefined) producto.precio = Number(precio);
    if (stock !== undefined) producto.stock = Number(stock);

    await producto.save();

    return res.status(200).json({
      message: "Producto actualizado correctamente",
      producto,
    });

  } catch (err: any) {
    console.error("Error en updateProductos:", err);

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({ message: "Error de conexión a la base de datos" });
    }

    if (err.name === "SequelizeValidationError") {
      return res.status(422).json({
        message: "Error de validación en la base de datos",
        errors: err.errors,
      });
    }

    return res.status(500).json({ message: "Error interno al actualizar el producto" });
  }
};
export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const deleted = await Producto.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ message: "El producto no existe o ya fue eliminado" });
    }

   return res.status(200).json({ message: "Producto eliminado satisfactoriamente" });

  } catch (err: any) {
    console.error("Error en deleteProductos:", err);

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({ message: "Error de conexión a la base de datos" });
    }

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "Error de validación en la base de datos", errors: err.errors });
    }

    return res.status(500).json({ message: "Error interno al eliminar el producto" });
  }
};


