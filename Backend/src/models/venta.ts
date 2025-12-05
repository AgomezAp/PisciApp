import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

//TABLA DE COMPRADORES

export const Comprador = sequelize.define(
    "comprador",
    {
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
        usuario_id: {
            type: DataTypes.INTEGER, 
            references: { model: "usuarios", key: "id"}, 
            allowNull: false  // ✅ Siempre debe tener un dueño
        },
        nombre: { type: DataTypes.STRING, allowNull: false },
        empresa: { type: DataTypes.STRING, allowNull: false },
        direccion: {type: DataTypes.STRING, allowNull: false},
        correo: { 
            type: DataTypes.STRING, 
            allowNull: false
            // ✅ Se removió unique: true para permitir el mismo correo entre diferentes usuarios
        },
        telefono: { type: DataTypes.STRING, allowNull: true },

    },
    {
        timestamps: false,
        indexes: [
            {
                // ✅ Constraint único compuesto: mismo correo solo una vez por usuario
                unique: true,
                fields: ['correo', 'usuario_id'],
                name: 'unique_correo_por_usuario'
            }
        ]
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

