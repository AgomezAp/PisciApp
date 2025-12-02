import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";


export const Tanque = sequelize.define(
  "tanques",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false},
    forma: { type: DataTypes.ENUM('Rectangular', 'Redondo'), allowNull: false},
    profundidad: { type: DataTypes.FLOAT, allowNull: true},
    largo: { type: DataTypes.FLOAT, allowNull: true},
    ancho: { type: DataTypes.FLOAT, allowNull: true},
    diametro: { type: DataTypes.FLOAT, allowNull: true},
    volumen: { type: DataTypes.FLOAT, allowNull: true },
    tipoTanque: {type: DataTypes.STRING, allowNull: true},
    disponible: { type: DataTypes.BOOLEAN, allowNull: false },
    usuario_id: {
      type: DataTypes.INTEGER, references: {model: "usuarios", key: "id"}, allowNull: false,
    },
    tanque_id_usuario: { type: DataTypes.INTEGER, allowNull: false},
  },
  {
    timestamps: false,
  }
);


export const MedicionesCalidad = sequelize.define(
  "mediciones",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tanque_id: {type: DataTypes.INTEGER, references: {model: "tanques", key: "id"}, allowNull: false},
    ph: { type: DataTypes.FLOAT, allowNull: false },
    oxigeno_disuelto: { type: DataTypes.FLOAT, allowNull: false },
    temperatura: { type: DataTypes.FLOAT, allowNull: false },
    nitritos: { type: DataTypes.FLOAT, allowNull: false },
    amoniaco: { type: DataTypes.FLOAT, allowNull: true },
    nitratos: { type: DataTypes.FLOAT, allowNull: true },
    salinidad: { type: DataTypes.FLOAT, allowNull: true },
  },
  {
    timestamps: true,
    updatedAt: false,
  }
)