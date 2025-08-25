import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Sesion extends Model {
  declare id: number;
  declare user_id: number;
  declare refresh_token_hash: string;
  declare is_revoked: boolean;
  declare created_at: Date;
  declare expires_at: Date;
  declare last_used_at: Date | null;
  declare ip_address: string | null;
  declare user_agent: string | null;
}

Sesion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    refresh_token_hash: { type: DataTypes.STRING, allowNull: false },
    is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    last_used_at: { type: DataTypes.DATE, allowNull: true },
    ip_address: { type: DataTypes.STRING, allowNull: true },
    user_agent: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: "Sesion", tableName: "sesiones", timestamps: false }
);
