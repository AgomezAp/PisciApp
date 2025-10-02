import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Compra } from "./compra";
import { CompraProducto } from "./compraProducto";
import { any } from "zod/mini";




  interface datosProducto {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;

  // Opcionales
  descripcion?: string;
  categoria?: string;
  marca?: string;
  unidad_medida?: string;
  imagen_url?: string;

}

export class Producto extends Model<datosProducto> {
  declare id: number;
  declare nombre: string;
  declare precio: number;
  declare stock: number;

  declare descripcion?: string;
  declare categoria?: string;
  declare marca?: string;
  declare unidad_medida?: string;
  declare imagen_url?: string;

}

Producto.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    precio: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
    descripcion: { type: DataTypes.STRING },
    categoria: { type: DataTypes.STRING },
    marca: { type: DataTypes.STRING },
    unidad_medida: { type: DataTypes.STRING},
    imagen_url: { type: DataTypes.STRING}
  },
  {
    sequelize,
    tableName: "productos",
    timestamps: false,
  }
); 

