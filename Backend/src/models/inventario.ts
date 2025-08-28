import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Usuario } from "./usuario";
import { Producto } from "./producto";
export class Inventario extends Model {
  public id!: number;
  public nombre!: string;
  public descripcion?: string;
  public cantidad!: number;
  public unidad!: string; // ej: "kg", "litros", "unidades"
  public createdAt!: Date;
  public updatedAt!: Date;
}

Inventario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "usuarios", key: "id" },
    },
    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    unidad: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "unidad",
    },
  },
  {
    sequelize,
    tableName: "inventario",
    timestamps: true,
  }
);
