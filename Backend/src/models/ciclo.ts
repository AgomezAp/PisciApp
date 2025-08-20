import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Usuario } from "./usuario";
import { Tanque } from "./tanque";

export class Ciclo extends Model {
  public id!: number;
  public usuario_id!: number;
  public tanque_id!: number;
  public numero_peces!: number;
  public costos!: number;
  public bajas!: number;
  public historial_alimento!: object;
  public historial_quimico!: object;
  public fecha_inicio!: Date;
  public fecha_fin!: Date;
  public fecha_cambio_tanque!: Date;
}

Ciclo.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: { model: "usuarios", key: "id" },
      allowNull: false,
    },
    tanque_id: {
      type: DataTypes.INTEGER,
      references: { model: "tanques", key: "id" },
      allowNull: false,
    },
    numero_peces: { type: DataTypes.INTEGER, allowNull: false },
    costos: { type: DataTypes.FLOAT, allowNull: false },
    bajas: { type: DataTypes.INTEGER, allowNull: true },
    historial_alimento: { type: DataTypes.JSONB, allowNull: true },
    historial_quimico: { type: DataTypes.JSONB, allowNull: true },
    fecha_inicio: { type: DataTypes.DATE, allowNull: false },
    fecha_fin: { type: DataTypes.DATE, allowNull: true },
    fecha_cambio_tanque: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "ciclos",
    timestamps: false,
  }
);

