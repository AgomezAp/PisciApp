import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Ciclo, CicloTanque } from "./ciclo";

export class Tanque extends Model {
  public id!: number;
  public nombre!: string;
  public volumen!: number;
  public tipoTanque!: string;
  public disponible!: boolean;
  public usuario_id!: number;
}

Tanque.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false},
    volumen: { type: DataTypes.FLOAT, allowNull: true },
    tipoTanque: {type: DataTypes.STRING, allowNull: true},
    disponible: { type: DataTypes.BOOLEAN, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "usuarios", key: "id" } }
  },
  {
    sequelize,
    tableName: "tanques",
    timestamps: false,
  }
);

export class MedicionesCalidad extends Model {
  public tanque_id!: number;
  public ph!: number;
  public oxigeno_disuelto!: number;
  public temperatura!: number;
  public nitritos!: number;
  public amoniaco!: number;
  public nitratos!: number;
  public dureza!: number;
  public salinidad!: number;
}

MedicionesCalidad.init(
  {
    tanque_id: {type: DataTypes.INTEGER, references: {model: "tanques", key: "id"}, allowNull: false},
    ph: { type: DataTypes.FLOAT, allowNull: false },
    oxigeno_disuelto: { type: DataTypes.FLOAT, allowNull: false },
    temperatura: { type: DataTypes.FLOAT, allowNull: false },
    nitritos: { type: DataTypes.FLOAT, allowNull: false },
    amoniaco: { type: DataTypes.FLOAT, allowNull: true },
    nitratos: { type: DataTypes.FLOAT, allowNull: true },
    dureza: { type: DataTypes.FLOAT, allowNull: true },
    salinidad: { type: DataTypes.FLOAT, allowNull: true },
  },
  {
    sequelize,
    tableName: "mediciones",
    timestamps: true
  }
)