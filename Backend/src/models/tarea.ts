import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Usuario } from "./usuario";
import { Ciclo } from "./ciclo";

export class Tarea extends Model {
  public id!: number;
  public usuario_id!: number;
  public ciclo_id!: number;
  public nombre!: string;
  public tipo!: string;
  public estado!: string;
}

Tarea.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: { model: "usuarios", key: "id" },
      allowNull: false,
    },
    ciclo_id: {
      type: DataTypes.INTEGER,
      references: { model: "ciclos", key: "id" },
      allowNull: true, // puede estar ligada o no a un ciclo
    },
    nombre: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.STRING, allowNull: true },
    estado: {
      type: DataTypes.ENUM("Pendiente", "En Proceso", "Completada"),
      defaultValue: "Pendiente",
    },
  },
  {
    sequelize,
    tableName: "tareas",
    timestamps: false,
  }
);

