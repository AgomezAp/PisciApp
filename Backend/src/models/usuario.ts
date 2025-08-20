import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Usuario extends Model {
  public id!: number;
  public nombre!: string;
  public correo!: string;
  public contraseña!: string | null;
  public google_id!: string | null;
  public foto_perfil!: string | null;
  public periodo_gracia!: boolean;
  public periodo_prueba!: boolean;
  public fecha_cobro!: Date | null;
  public telefono!: string;
  public rol!: "Admin" | "Cliente" | "Trabajador";
}

Usuario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    correo: { type: DataTypes.STRING, allowNull: false, unique: true },
    contraseña: { type: DataTypes.STRING, allowNull: true },
    google_id: { type: DataTypes.STRING, allowNull: true },
    foto_perfil: { type: DataTypes.STRING, allowNull: true },
    periodo_gracia: { type: DataTypes.BOOLEAN, defaultValue: false },
    periodo_prueba: { type: DataTypes.BOOLEAN, defaultValue: false },
    fecha_cobro: { type: DataTypes.DATE, allowNull: true },
    telefono: { type: DataTypes.STRING, allowNull: true },
    rol: {
      type: DataTypes.ENUM("Admin", "Cliente", "Trabajador"),
      allowNull: false,
      defaultValue: "Cliente",
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    timestamps: false,
  }
);
