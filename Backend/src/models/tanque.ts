import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Tanque extends Model {
  public id!: number;
  public volumen!: number;
  public ph!: number;
  public oxigeno_disuelto!: number;
  public temperatura!: number;
  public nitritos!: number;
  public amoniaco!: number;
  public nitratos!: number;
  public dureza!: number;
  public salinidad!: number;
  public disponible!: boolean;
}

Tanque.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    volumen: { type: DataTypes.FLOAT, allowNull: false },
    ph: { type: DataTypes.FLOAT, allowNull: false },
    oxigeno_disuelto: { type: DataTypes.FLOAT, allowNull: false },
    temperatura: { type: DataTypes.FLOAT, allowNull: false },
    nitritos: { type: DataTypes.FLOAT, allowNull: false },
    amoniaco: { type: DataTypes.FLOAT, allowNull: true },
    nitratos: { type: DataTypes.FLOAT, allowNull: true },
    dureza: { type: DataTypes.FLOAT, allowNull: true },
    salinidad: { type: DataTypes.FLOAT, allowNull: true },
    disponible: { type: DataTypes.BOOLEAN, allowNull: true },
  },
  {
    sequelize,
    tableName: "tanques",
    timestamps: false,
  }
);