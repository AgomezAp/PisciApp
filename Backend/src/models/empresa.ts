import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export const Empresa = sequelize.define(
    "empresa",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        usuario_id: { 
            type: DataTypes.INTEGER, allowNull: false, references: { model: "usuarios", key: "id" },
        },
        nombre: { type: DataTypes.STRING, allowNull: false },
        direccion: {type: DataTypes.STRING, allowNull: false},
        codigo_postal: { type: DataTypes.INTEGER, allowNull: false},
        pais: { type: DataTypes.STRING, allowNull: false},
        departamento: { type: DataTypes.STRING, allowNull: false},
        ciudad: { type: DataTypes.STRING, allowNull: false },
        especies: { 
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false 
        },
        actividad: { 
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
    },
    {
        timestamps: true,
        updatedAt: false
    }
);