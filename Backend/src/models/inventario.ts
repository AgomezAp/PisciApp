import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export const Inventario = sequelize.define(
  "inventario",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { 
      type: DataTypes.INTEGER, allowNull: false, references: { model: "usuarios", key: "id" },
    },
    tipo_material: { type: DataTypes.ENUM('Alimento', 'Quimico', 'Maquina', 'Herramienta')},
    nombre: { type: DataTypes.STRING, allowNull: false },
    provedor: { type: DataTypes.STRING, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    costo_insumo: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    costo_transporte: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    fecha_caducidad: { type: DataTypes.DATE, allowNull: true},
    peso_unidad: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    granularidad: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  },
  {
    timestamps: false,
  }
);