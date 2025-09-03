import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/connection";

// Definimos atributos del modelo
interface UsuarioAttributes {
  id: number;
  nombre: string;
  correo: string;
  contrasena?: string | null;
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

  // ⚡ 2FA
  twofa_secret?: string | null;
  pending_twofa_secret?: string | null;
  twofa_enabled?: boolean;
  backup_codes?: string | null; // JSON con array de códigos opcional
  noti_email?: boolean | null;
  noti_alertas?: boolean | null;
  tema?: string | null;
  idioma?: string | null;

  departamento?: string | null;
  ciudad?: string | null;
  eliminado?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Para creación → algunos campos opcionales
interface UsuarioCreationAttributes
  extends Optional<
    UsuarioAttributes,
    | "id"
    | "contrasena"
    | "google_id"
    | "foto_perfil"
    | "fecha_cobro"
    | "telefono"
    | "verification_code"
    | "verification_expires_at"
    | "twofa_secret"
    | "departamento"
    | "ciudad"
    | "createdAt"
    | "updatedAt"
  > {}

export class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  declare id: number;
  declare nombre: string;
  declare correo: string;
  declare contrasena: string | null;
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
  declare eliminado: boolean;
  // 👇 Declaración nueva
  declare departamento: string | null;
  declare ciudad: string | null;
  declare pending_twofa_secret?: string | null;
  declare twofa_enabled?: boolean;
  declare backup_codes?: string | null;
  declare noti_email?: boolean | null;
  declare noti_alertas?: boolean | null;
  declare tema?: string | null;
  declare idioma?: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Inicialización con Sequelize
Usuario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    correo: { type: DataTypes.STRING, allowNull: false, unique: true },
    contrasena: { type: DataTypes.STRING, allowNull: true },
    google_id: { type: DataTypes.STRING, allowNull: true },
    foto_perfil: { type: DataTypes.STRING, allowNull: true },

    periodo_gracia: { type: DataTypes.BOOLEAN, defaultValue: false },
    periodo_gracia_expira: { type: DataTypes.DATE, allowNull: true },
    periodo_prueba: { type: DataTypes.BOOLEAN, defaultValue: false },
    fecha_cobro: { type: DataTypes.DATE, allowNull: true },
    telefono: { type: DataTypes.STRING, allowNull: true },
    departamento: { type: DataTypes.STRING, allowNull: true },
    ciudad: { type: DataTypes.STRING, allowNull: true },
    eliminado: { type: DataTypes.BOOLEAN, defaultValue: false },

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

    // ⚡ NUEVOS CAMPOS PARA 2FA
    twofa_secret: { type: DataTypes.STRING, allowNull: true },
    pending_twofa_secret: { type: DataTypes.STRING, allowNull: true },
    twofa_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    backup_codes: { type: DataTypes.TEXT, allowNull: true }, // opcional: almacenar JSON
    noti_email: { type: DataTypes.BOOLEAN, defaultValue: false },
    noti_alertas: { type: DataTypes.BOOLEAN, defaultValue: false },
    tema: { type: DataTypes.STRING, allowNull: true },
    idioma: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    tableName: "usuarios",
    timestamps: true,
  }
);
