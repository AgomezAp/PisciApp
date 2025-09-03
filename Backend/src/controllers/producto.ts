import { Request, Response } from "express";
import { Producto } from "../models/producto";
import { error } from "console";

export const createProducto = async (req: Request, res: Response) => {
    try {
        const { nombre, precio, stock } = req.body;
        const producto = await Producto.create({ nombre, precio, stock })
        res.status(201).json({ mesagge: "prodcuto creado correctamente", producto })
    } catch (err) {
        console.error(err)
        res.status(401).json({ mesagge: "error al obtener, intente nuevamente" });
    }
};
export const getproductos = async (req: Request, res: Response) => {
    try {
        const { nombre, precio, stock } = req.body;
        const producto = await Producto.findAll();
        res.status(201).json({ message: "lista de productos", producto });
    } catch (err) {
        console.error(err)
        res.status(501).json({ mesagge: "error al obtener, intente nuevamente" });
    }

};
export const updateproductos = async (req: Request, res: Response) => {
    try {
        const { nombre, precio, stock } = req.body;
        const producto = await Producto.findOne({ where: { id: req.params.id } });
        if (!producto) {
            return res.status(404).json({ message: "producto no encontrado" });
        }
        producto.nombre = nombre || producto.nombre;
        producto.precio = precio ?? producto.precio;
        producto.stock = stock ?? producto.stock;

        await producto.save();

        res.json(producto);
    } catch (err) {
        res.status(501).json({ message: "error al ejecutar" })
    }
};
export const deleteProductos = async (req: Request, res: Response) => {
    try {
        const { nombre, precio, stock } = req.body
        const producto = await Producto.findOne({ where: { id: req.params.id } })
        if (!producto) {
            return res.status(404).json({ message: "producto no encontrado" })
        }
        await producto.destroy();
        res.json({ message: "eliminado satisfactoriamente" })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "error al eliminar producto" })
    }
}

