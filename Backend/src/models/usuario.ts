
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";

// Definimos atributos del modelo
interface UsuarioAttributes {
  id: number;
  nombre: string;
  correo: string;
  contraseña?: string | null;
  google_id?: string | null;
  foto_perfil?: string | null;
  periodo_gracia: boolean;
  periodo_prueba: boolean;
  fecha_cobro?: Date | null;
  telefono?: string | null;
  rol: "Admin" | "Cliente" | "Trabajador";
  is_verified: boolean;
  verification_code?: string | null;
  verification_expires_at?: Date | null;
  periodo_gracia_expira?: Date | null;
  twofa_secret?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Para crear usuario → algunos campos opcionales
interface UsuarioCreationAttributes
  extends Optional<
    UsuarioAttributes,
    | "id"
    | "contraseña"
    | "google_id"
    | "foto_perfil"
    | "fecha_cobro"
    | "telefono"
    | "verification_code"
    | "verification_expires_at"
    | "twofa_secret"
    | "createdAt"
    | "updatedAt"
  > {}

export class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  // 👇 ahora con declare (no public!)
  declare id: number;
  declare nombre: string;
  declare correo: string;
  declare contraseña: string | null;
  declare google_id: string | null;
  declare foto_perfil: string | null;
  declare periodo_gracia: boolean;
  declare periodo_prueba: boolean;
  declare fecha_cobro: Date | null;
  declare telefono: string | null;
  declare rol: "Admin" | "Cliente" | "Trabajador";
  declare is_verified: boolean;
  declare verification_code: string | null;
  declare verification_expires_at: Date | null;
  declare periodo_gracia_expira: Date | null;
  declare twofa_secret: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Inicialización con Sequelize
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

    contraseña: { type: DataTypes.STRING, allowNull: true }, // null si es login Google
    google_id: { type: DataTypes.STRING, allowNull: true },
    foto_perfil: { type: DataTypes.STRING, allowNull: true },
    periodo_gracia: { type: DataTypes.BOOLEAN, defaultValue: false },
    periodo_gracia_expira: { type: DataTypes.DATE, allowNull: true },

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

    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verification_code: { type: DataTypes.STRING, allowNull: true },
    verification_expires_at: { type: DataTypes.DATE, allowNull: true },
    twofa_secret: { type: DataTypes.STRING, allowNull: true },
=======

  },
  {
    sequelize,
    tableName: "usuarios",

    timestamps: true, // ahora true para manejar createdAt y updatedAt

    timestamps: false,

  }
);
