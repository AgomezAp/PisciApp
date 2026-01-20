// models/index.ts
import { Usuario } from "./usuario";
import { Tanque, MedicionesCalidad} from "./tanque";
import { Ciclo, CicloTanque, Alimento, Quimico, MovimientoTanque, Bajas  } from "./ciclo";
import { Tarea } from "./tarea";
import { Producto } from "./producto";
import { Inventario } from "./inventario";
import { Compra } from "./compra";
import { Sesion } from "./session";
import { Empresa } from "./empresa";
import { Comprador, Venta } from "./venta";

// =========================
// DEFINICIÓN DE RELACIONES
// =========================

// Usuario - Venta
Usuario.hasMany(Venta, { foreignKey: "usuario_id", as: "ventas"});
Venta.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario"});

// Venta - Comprador
Comprador.hasMany(Venta, { foreignKey: "usuario_id", as: "ventas"});
Venta.belongsTo(Comprador, { foreignKey: "comprador_id", as: "comprador"});
// Comprador - Usuario
Usuario.hasMany(Comprador, { foreignKey: "usuario_id", as: "compradores" });
Comprador.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });
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

//Usuario - Empresa
Usuario.hasOne(Empresa, {foreignKey: "usuario_id", as: "empresa"});
Empresa.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario"});

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
Ciclo.hasMany(Alimento, { foreignKey: 'ciclo_id', as: "alimentos" });
Ciclo.hasMany(Quimico, { foreignKey: 'ciclo_id', as: "quimicos" });
Ciclo.hasMany(MovimientoTanque, { foreignKey: 'ciclo_id', as: "movimientos_tanque" });
Ciclo.hasMany(Bajas, { foreignKey: 'ciclo_id', as: "bajas_ciclo" });
Ciclo.hasMany(CicloTanque, { foreignKey: "ciclo_id", as: "ciclotanques_ciclo" });

// Relaciones de Tanque
Tanque.hasMany(MedicionesCalidad, {foreignKey: "tanque_id", as: "mediciones" });
Tanque.hasMany(Bajas, {foreignKey: "tanque_id", as: "bajas_tanque" });
Tanque.hasMany(CicloTanque, { foreignKey: "tanque_id", as: "ciclotanques_tanque" });
MedicionesCalidad.belongsTo(Tanque, {foreignKey: "tanque_id", as: "tanque_medicion"});
Tanque.belongsTo(Usuario, { foreignKey: "usuario_id"});
Usuario.hasMany(Tanque, {foreignKey: "usuario_id"});

// Relaciones inversas
Alimento.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
Quimico.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
MovimientoTanque.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
Bajas.belongsTo(Ciclo, {foreignKey: 'ciclo_id'});
Bajas.belongsTo(Tanque, {foreignKey: 'tanque_id'});

CicloTanque.belongsTo(Ciclo, { foreignKey: "ciclo_id" });
CicloTanque.belongsTo(Tanque, { foreignKey: "tanque_id" });
Ciclo.belongsToMany(Tanque, { through: CicloTanque, foreignKey: "ciclo_id", as: "tanques_ciclo" });
Tanque.belongsToMany(Ciclo, { through: CicloTanque, foreignKey: "tanque_id", as: "ciclos_tanque" });
Usuario.hasMany(Sesion, { foreignKey: "user_id", as: "sesiones" });
Sesion.belongsTo(Usuario, { foreignKey: "user_id", as: "usuario" });
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