import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Compra } from "./compra";
import { Producto } from "./producto";

interface ICompraProducto {
  compraId: number;
  productoId: number;
  cantidad: number;
  precio: number;
}

export class CompraProducto extends Model<ICompraProducto> implements ICompraProducto {
  declare compraId: number;
  declare productoId: number;
  declare cantidad: number;
  declare precio: number;
}

CompraProducto.init({
  compraId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "compras", key: "id" }
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "productos", key: "id" }
  },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  sequelize,
  modelName: "CompraProducto",
  tableName: "compras_productos",
  timestamps: false
});

