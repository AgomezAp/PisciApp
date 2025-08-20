// models/index.ts
import { Usuario } from "./usuario";
import { Tanque } from "./tanque";
import { Ciclo } from "./ciclo";
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
Usuario.hasMany(Inventario, { foreignKey: "usuario_id", as: "inventario" });
Inventario.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

// Tanque - Ciclo
Tanque.hasMany(Ciclo, { foreignKey: "tanque_id", as: "ciclos" });
Ciclo.belongsTo(Tanque, { foreignKey: "tanque_id", as: "tanque" });

// Ciclo - Tareas
Ciclo.hasMany(Tarea, { foreignKey: "ciclo_id", as: "tareas" });
Tarea.belongsTo(Ciclo, { foreignKey: "ciclo_id", as: "ciclo" });

// Producto - Inventario
Producto.hasMany(Inventario, { foreignKey: "producto_id", as: "inventarios" });
Inventario.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" });

// Producto - Compras
Producto.hasMany(Compra, { foreignKey: "producto_id", as: "compras" });
Compra.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" });

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
};