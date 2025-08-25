import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export class Sesion extends Model {
  public id!: number;
  public user_id!: number;
  public refresh_token_hash!: string;
  public is_revoked!: boolean;
  public created_at!: Date;
  public expires_at!: Date;
  public last_used_at!: Date | null;
  public ip_address!: string | null;
  public user_agent!: string | null;
}

Sesion.init(
  {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    refresh_token_hash: { type: DataTypes.STRING, allowNull: false },
    is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expires_at: { type: DataTypes.DATE, allowNull: false },         // cuándo expira
    last_used_at: { type: DataTypes.DATE, allowNull: true },       // último uso
    ip_address: { type: DataTypes.STRING, allowNull: true },
    user_agent: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: "sesion", tableName: "sesiones", timestamps: false }
);