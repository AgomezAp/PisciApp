import { Request, Response } from "express";
import { Compra } from "../models/compra";
import { Producto } from "../models/producto";
import { CompraProducto } from "../models/compraProducto";

export const createCompra = async (req: Request, res: Response) => {
  const { productos } = req.body; // [{ productoId, cantidad }]

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: "Debes enviar al menos un producto" });
  }

  try {
    let total = 0;

    // 1. Validar productos y calcular total
    const detalles: any[] = [];
    for (const item of productos) {
      const prod = await Producto.findByPk(item.productoId);
      if (!prod) {
        return res.status(404).json({ message: `Producto con id ${item.productoId} no encontrado` });
      }

      if (prod.stock < item.cantidad) {
        return res.status(400).json({ message: `Stock insuficiente para ${prod.nombre}` });
      }

      const subtotal = Number(prod.precio) * item.cantidad;
      total += subtotal;

      detalles.push({
        productoId: prod.id,
        cantidad: item.cantidad,
        precio: prod.precio
      });
    }

    // 2. Crear compra
    const compra = await Compra.create({total, estado: "pendiente", fecha: new Date()});

    // 3. Insertar en tabla intermedia y actualizar stock
    for (const detalle of detalles) {
      await CompraProducto.create({
        compraId: compra.id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precio: detalle.precio
      });   

      // restar stock
      const prod = await Producto.findByPk(detalle.productoId);
      if (prod) {
        prod.stock -= detalle.cantidad;
        await prod.save();
      }
    }

    // 4. Retornar compra con productos asociados
    const compraConProductos = await Compra.findByPk(compra.id, {
      include: { model: Producto }
    });

    return res.status(201).json({
      message: "Compra creada correctamente",
      data: compraConProductos
    });

  } catch (err) {
    console.error("Error en createCompra:", err);
    return res.status(500).json({ message: "Error interno al crear la compra" });
  }
};
