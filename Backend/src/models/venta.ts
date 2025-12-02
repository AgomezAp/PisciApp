import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

//TABLA DE COMPRADORES

export const Comprador = sequelize.define(
    "comprador",
    {
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
        usuario_id: {type: DataTypes.INTEGER, references: { model: "usuarios", key: "id"}, allowNull:true},
        nombre: { type: DataTypes.STRING, allowNull: false },
        empresa: { type: DataTypes.STRING, allowNull: false },
        direccion: {type: DataTypes.STRING, allowNull: false},
        correo: { type: DataTypes.STRING, allowNull: false, unique: true },
        telefono: { type: DataTypes.STRING, allowNull: true },

    },
    {
        timestamps: false,
    }
);
//TABLA DE VENTAS
export const Venta = sequelize.define(
  "ventas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: { model: "usuarios", key: "id" },
      allowNull: false,
    },
    toneladas: { type: DataTypes.FLOAT, allowNull: false },
    precio: {type: DataTypes.FLOAT, allowNull: false},
    ciclo_id_usuario: { type: DataTypes.INTEGER, allowNull: false},
    comprador_id: {type: DataTypes.INTEGER, references: {model: "comprador", key: "id"}, allowNull: false}
  },
  {
    timestamps: false,
  }
);

