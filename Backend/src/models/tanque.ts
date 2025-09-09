import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";


export const Tanque = sequelize.define(
  "tanques",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false},
    volumen: { type: DataTypes.FLOAT, allowNull: true },
    tipoTanque: {type: DataTypes.STRING, allowNull: true},
    disponible: { type: DataTypes.BOOLEAN, allowNull: false },
    usuario_id: {
      type: DataTypes.INTEGER, references: {model: "usuarios", key: "id"}, allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);


export const MedicionesCalidad = sequelize.define(
  "mediciones",
  {
    tanque_id: {type: DataTypes.INTEGER, references: {model: "tanques", key: "id"}, allowNull: false, primaryKey: true},
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
    timestamps: true,
  }
)