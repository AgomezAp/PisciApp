import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Producto } from "./producto";
import { CompraProducto } from "./compraProducto";

interface dataCompra {
  id?: number;
  fecha: Date;
  total: number;
  estado: string;
  
}

export class Compra extends Model<dataCompra>{
  declare id: number;
  declare fecha: Date;
  declare total: number;
  declare estado: string;
  
}
    

Compra.init(
  {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    fecha: {type: DataTypes.DATE, allowNull:false, defaultValue: DataTypes.NOW},
    total: {type: DataTypes.DECIMAL(10, 2), allowNull:false },
    estado: {type: DataTypes.STRING, allowNull: false, defaultValue: "pendiente"},
    
  },
  {
    sequelize,
    tableName: "compras",
    timestamps: true,
  }
);
