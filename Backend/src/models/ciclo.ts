import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export const Ciclo = sequelize.define(
  "ciclos",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: { model: "usuarios", key: "id" },
      allowNull: false,
    },
    numero_peces: { type: DataTypes.INTEGER, allowNull: false },
    numero_actual: {type: DataTypes.INTEGER, allowNull: false},
    especie: {type: DataTypes.STRING, allowNull: false},
    costos_transporte: { type: DataTypes.FLOAT, allowNull: false },
    costos: { type: DataTypes.FLOAT, allowNull: false },
    total_bajas: { type: DataTypes.INTEGER, defaultValue: 0 },
    fecha_inicio: { type: DataTypes.DATE, allowNull: false },
    fecha_fin: { type: DataTypes.DATE, allowNull: true },
    ciclo_id_usuario: { type: DataTypes.INTEGER, allowNull: false},
  },
  {
    timestamps: false,
  }
);


export const CicloTanque = sequelize.define(
  "ciclo_tanques",
  {
    ciclo_id: {type: DataTypes.INTEGER, references: {model: "ciclos", key: "id"}, allowNull: false, primaryKey: true},
    tanque_id: {type: DataTypes.INTEGER, references: {model: "tanques", key: "id"}, allowNull: false, primaryKey: true},
    numero_peces: {type: DataTypes.INTEGER, allowNull: false},
  },
  {
    timestamps: false,
  }
);

export const Alimento = sequelize.define(
  "alimentos",
  {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    ciclo_id: {
      type: DataTypes.INTEGER,
      references: { model: "ciclos", key: "id" },
      allowNull: false,
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    costo: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.TEXT, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    timestamps: true,
    updatedAt: false
  }
);



export const Quimico = sequelize.define(
  "quimicos",
  {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    ciclo_id: {
      type: DataTypes.INTEGER,
      references: { model: "ciclos", key: "id" },
      allowNull: false,
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    costo: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.TEXT, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    timestamps: true,
    updatedAt: false
  }
);



export const MovimientoTanque = sequelize.define(
  "movimiento",
  {
    ciclo_id: { type: DataTypes.INTEGER, references: { model: "ciclos", key: "id"},  allowNull: false },
    origen: { type: DataTypes.INTEGER,   allowNull: false },
    destino: { type: DataTypes.INTEGER,  allowNull: false },
    cantidad: { type: DataTypes.INTEGER,  allowNull: false },
  },
  {
    timestamps: true,
    updatedAt: false
  }
)

export const Bajas = sequelize.define(
  "bajas",
  {
    ciclo_id: { type: DataTypes.INTEGER, references: {model: "ciclos", key: "id"},  allowNull: false },
    tanque_id: { type: DataTypes.INTEGER, references: {model: "tanques", key: "id"},  allowNull: false },
    cantidad: { type: DataTypes.INTEGER,  allowNull: false },
  },
  {
    timestamps: true,
    updatedAt: false
  }
)
