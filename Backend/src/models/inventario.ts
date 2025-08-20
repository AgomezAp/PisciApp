import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Usuario } from "./usuario";
import { Producto } from "./producto";

export class Inventario extends Model {
  public id!: number;
  public usuario_id!: number;
  public producto_id!: number;
  public stock!: number;
}

Inventario.init(
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
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: "inventario",
    timestamps: false,
  }
);
