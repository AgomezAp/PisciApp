import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { Usuario } from "./usuario";
import { Tanque } from "./tanque";

export class Ciclo extends Model {
  public id!: number;
  public usuario_id!: number;
  public numero_peces!: number;
  public costos!: number;
  public bajas!: number;
  public fecha_inicio!: Date;
  public fecha_fin!: Date;
}

Ciclo.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: { model: "usuarios", key: "id" },
      allowNull: false,
    },
    numero_peces: { type: DataTypes.INTEGER, allowNull: false },
    costos: { type: DataTypes.FLOAT, allowNull: false },
    bajas: { type: DataTypes.INTEGER, allowNull: true },
    fecha_inicio: { type: DataTypes.DATE, allowNull: false },
    fecha_fin: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "ciclos",
    timestamps: false,
  }
);

export class CicloTanque extends Model {
  public ciclo_id!: number;
  public tanque_id!: number;
  public numero_peces!: number;
}

CicloTanque.init(
  {
    ciclo_id: {type: DataTypes.INTEGER, references: {model: "ciclos", key: "id"}, allowNull: false, primaryKey: true},
    tanque_id: {type: DataTypes.INTEGER, references: {model: "tanques", key: "id"}, allowNull: false, primaryKey: true},
    numero_peces: {type: DataTypes.INTEGER, allowNull: false},
  },
  {
    sequelize,
    tableName: "ciclo_tanques",
    timestamps: false,
  }
);


export class Alimento extends Model {
  public id!: number;
  public ciclo_id!: number;
  public cantidad!: number;
  public costo!: number;
  public nombre!: string;
  public descripcion!: string;
}

Alimento.init(
  {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    ciclo_id: {
      type: DataTypes.INTEGER,
      references: { model: "ciclos", key: "id" },
      allowNull: false,
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    costo: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.TEXT, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: "alimentos",
    timestamps: true,
  }
);

export class Quimico extends Model {
  public id!: number;
  public ciclo_id!: number;
  public cantidad!: number;
  public costo!: number;
  public nombre!: string;
  public descripcion!: string;
}

Quimico.init(
  {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    ciclo_id: {
      type: DataTypes.INTEGER,
      references: { model: "ciclos", key: "id" },
      allowNull: false,
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    costo: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.TEXT, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: "quimicos",
    timestamps: false,
  }
);

export class MovimientoTanque extends Model {
  public ciclo_id!: number; 
  public origen!: number;
  public destino!: number;
  public cantidad!: number;
}

MovimientoTanque.init(
  {
    ciclo_id: { type: DataTypes.INTEGER,  allowNull: false },
    origen: { type: DataTypes.INTEGER,  allowNull: false },
    destino: { type: DataTypes.INTEGER,  allowNull: false },
    cantidad: { type: DataTypes.INTEGER,  allowNull: false },
  },
  {
    sequelize,
    tableName: "movimiento",
    timestamps: false
  }
)

export class Bajas extends Model {
  public ciclo_id!: number; 
  public tanque_id!: number;
  public cantidad!: number
}

Bajas.init(
  {
    ciclo_id: { type: DataTypes.INTEGER,  allowNull: false },
    tanque_id: { type: DataTypes.DATE,  allowNull: false },
    cantidad: { type: DataTypes.INTEGER,  allowNull: false },
  },
  {
    sequelize,
    tableName: "bajas",
    timestamps: false
  }
)

Ciclo.belongsTo(Usuario, { foreignKey: 'usuario_id'});
Ciclo.belongsTo(Tanque, { foreignKey: 'tanque_id'});
Alimento.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
Quimico.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
MovimientoTanque.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
Bajas.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});

Ciclo.hasMany(Alimento, { foreignKey: 'ciclo_id'});
Ciclo.hasMany(Quimico, { foreignKey: 'ciclo_id'});
Ciclo.hasMany(MovimientoTanque, { foreignKey: 'ciclo_id'});
Ciclo.hasMany(Bajas, { foreignKey: 'ciclo_id'});

Ciclo.belongsToMany(Tanque, { through: CicloTanque, foreignKey: "ciclo_id"});
Tanque.belongsToMany(Ciclo, { through: CicloTanque, foreignKey: "ciclo_id"});

