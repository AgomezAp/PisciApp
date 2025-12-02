import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

export const Inventario = sequelize.define(
  "inventario",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { 
      type: DataTypes.INTEGER, allowNull: false, references: { model: "usuarios", key: "id" },
    },
    tipo_material: { type: DataTypes.ENUM('Alimento', 'Quimico', 'Maquina', 'Herramienta')},
    nombre: { type: DataTypes.STRING, allowNull: false },
    lote: { type: DataTypes.STRING, allowNull: true},
    provedor: { type: DataTypes.STRING, allowNull: true },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    unidad_medida: { 
      type: DataTypes.ENUM('kg', 'gramos', 'toneladas', 'litros', 'ml', 'unidades', 'm', 'cm', 'lb', 'oz'), 
      allowNull: true,   ///SE DEBE CAMBIAR A FALSE
      defaultValue: 'unidades' 
    },
    peso_unidad: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    peso_total: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0},
    costo_insumo: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    costo_transporte: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    costo_total: {type: DataTypes.FLOAT, allowNull: false, defaultValue: 0},
    costo_unidad: {type: DataTypes.FLOAT, allowNull: false, defaultValue: 0},
    fecha_caducidad: { type: DataTypes.DATE, allowNull: true},
    granularidad: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
  },
  {
    timestamps: true,
    updatedAt: false,
    hooks: {
      beforeCreate: (item: any) => {
        const tipo = item.tipo_material

        if(['Alimento', 'Quimico'].includes(tipo)) {
          item.peso_total = item.peso_unidad * item.cantidad;
          item.costo_total = (item.costo_insumo ?? 0) + (item.costo_transporte ?? 0);
          item.costo_unidad = item.peso_total > 0 ? item.costo_total / item.peso_total : 0;
        } else {
          item.peso_total = 0;
          item.peso_unidad = 0;
          item.costo_total = (item.costo_insumo ?? 0) + (item.costo_transporte ?? 0);
          item.costo_unidad = item.peso_total > 0 ? item.costo_total / item.peso_total : 0;
        }
      },
      beforeUpdate: (item: any) => {
        const tipo = item.tipo_material

        if(['Alimento', 'Quimico'].includes(tipo)) {
          item.peso_total = item.peso_unidad * item.cantidad;
          item.costo_total = (item.costo_insumo ?? 0) + (item.costo_transporte ?? 0);
          item.costo_unidad = item.peso_total > 0 ? item.costo_total / item.peso_total : 0;
        } else {
          item.peso_total = 0;
          item.peso_unidad = 0;
          item.costo_total = (item.costo_insumo ?? 0) + (item.costo_transporte ?? 0);
          item.costo_unidad = item.peso_total > 0 ? item.costo_total / item.peso_total : 0;
        }
      }
    }
  }
);