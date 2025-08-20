import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Producto extends Model {
  public id!: number;
  public nombre!: string;
  public precio!: number;
  public stock!: number;
}

Producto.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    precio: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "productos",
    timestamps: false,
  }
);