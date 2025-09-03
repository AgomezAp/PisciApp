// models/index.ts
import { Usuario } from "./usuario";
import { Tanque, MedicionesCalidad} from "./tanque";
import { Ciclo, CicloTanque, Alimento, Quimico, MovimientoTanque, Bajas  } from "./ciclo";
import { Tarea } from "./tarea";
import { Producto } from "./producto";
import { Inventario } from "./inventario";
import { Compra } from "./compra";

// =========================
// DEFINICIÓN DE RELACIONES
// =========================

// Usuario - Ciclo
Usuario.hasMany(Ciclo, { foreignKey: "usuario_id", as: "ciclos" });
Ciclo.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

// Usuario - Tareas
Usuario.hasMany(Tarea, { foreignKey: "usuario_id", as: "tareas" });
Tarea.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

// Usuario - Compras
Usuario.hasMany(Compra, { foreignKey: "usuario_id", as: "compras" });
Compra.belongsTo(Usuario, { foreignKey: "usuario_id", as: "comprador" });

// Usuario - Inventario
Usuario.hasOne(Inventario, { foreignKey: "usuario_id", as: "inventario" });
Inventario.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

// Tanque - Ciclo
Tanque.hasMany(Ciclo, { foreignKey: "tanque_id", as: "ciclos" });
Ciclo.belongsTo(Tanque, { foreignKey: "tanque_id", as: "tanques" });

// Ciclo - Tareas
Ciclo.hasMany(Tarea, { foreignKey: "ciclo_id", as: "tareas" });
Tarea.belongsTo(Ciclo, { foreignKey: "ciclo_id", as: "ciclo" });

// Producto - Inventario
Producto.hasMany(Inventario, { foreignKey: "producto_id", as: "inventarios" });
Inventario.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" });

// Producto - Compras
Producto.hasMany(Compra, { foreignKey: "producto_id", as: "compras" });
Compra.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" });

// Relaciones de Ciclo
Ciclo.belongsTo(Usuario, { foreignKey: 'usuario_id'});
Ciclo.hasMany(Alimento, { foreignKey: 'ciclo_id'});
Ciclo.hasMany(Quimico, { foreignKey: 'ciclo_id'});
Ciclo.hasMany(MovimientoTanque, { foreignKey: 'ciclo_id'});
Ciclo.hasMany(Bajas, { foreignKey: 'ciclo_id'});
Ciclo.belongsToMany(Tanque, { through: CicloTanque, foreignKey: "ciclo_id" });

// Relaciones de Tanque
Tanque.hasMany(MedicionesCalidad, {foreignKey: "tanque_id"});
MedicionesCalidad.belongsTo(Tanque, {foreignKey: "tanque_id"});
Tanque.belongsToMany(Ciclo, { through: CicloTanque, foreignKey: "tanque_id" });
Tanque.belongsTo(Usuario, { foreignKey: "usuario_id"});
Usuario.hasMany(Tanque, {foreignKey: "usuario_id"});

// Relaciones inversas
Alimento.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
Quimico.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
MovimientoTanque.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
Bajas.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});

// ==========================
// EXPORTAR TODOS LOS MODELOS
// ==========================
export {
  Usuario,
  Tanque,
  Ciclo,
  Tarea,
  Producto,
  Inventario,
  Compra,
  MedicionesCalidad,
  CicloTanque,
  Alimento,
  Quimico,
  MovimientoTanque,
  Bajas
};