import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Usuario } from "./usuario";
import { Producto } from "./producto";

export class Compra extends Model {
  public id!: number;
  public usuario_id!: number;
  public producto_id!: number;
  public cantidad!: number;
  public total!: number;
  public fecha!: Date;
}

Compra.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: { model: "usuarios", key: "id" },
      allowNull: false,
    },
    producto_id: {
      type: DataTypes.INTEGER,
      references: { model: "productos", key: "id" },
      allowNull: false,
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "compras",
    timestamps: false,
  }
);
