import { Request, Response } from "express";
import { Empresa } from "../models/empresa";
import { Sequelize } from "sequelize";

export const crearEmpresa = async (req: Request, res: Response): Promise<any> => {
    try {
        const { usuario_id, nombre, direccion, codigo_postal, pais, departamento, ciudad, especies, actividad } = req.body;

        if (!usuario_id || !nombre || !direccion || !codigo_postal || !pais || !departamento || !ciudad || !especies) {
            return res.status(400).json({ 
                error: "Faltan campos obligatorios" 
            });
        }
        const empresaExistente = await Empresa.findOne({ 
            where: { usuario_id } 
        });
        if (empresaExistente) {
            return res.status(400).json({ 
                error: "El usuario ya tiene una empresa registrada" 
            });
        }
        if (!Array.isArray(especies) || especies.length === 0) {
            return res.status(400).json({ 
                error: "Debe proporcionar al menos una especie" 
            });
        }
        const nuevaEmpresa = await Empresa.create({
            usuario_id,
            nombre,
            direccion,
            codigo_postal,
            pais,
            departamento,
            ciudad,
            especies,
            actividad: actividad || []
        });

        return res.status(201).json({
            message: "Empresa creada exitosamente",
            empresa: nuevaEmpresa
        });

    } catch (error: any) {
        console.error("Error al crear empresa:", error);
        return res.status(500).json({ 
            error: "Error al crear la empresa",
            details: error.message 
        });
    }
};

export const editarEmpresa = async(req: Request, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const { nombre, direccion, codigo_postal, pais, departamento, ciudad, especies, actividad } = req.body;

        // Buscar la empresa
        const empresa = await Empresa.findByPk(id);

        if (!empresa) {
            return res.status(404).json({ 
                error: "Empresa no encontrada" 
            });
        }

        // Validar especies si se proporciona
        if (especies !== undefined) {
            if (!Array.isArray(especies) || especies.length === 0) {
                return res.status(400).json({ 
                    error: "Debe proporcionar al menos una especie" 
                });
            }
        }

        // Actualizar solo los campos proporcionados
        const datosActualizacion: any = {};
        
        if (nombre !== undefined) datosActualizacion.nombre = nombre;
        if (direccion !== undefined) datosActualizacion.direccion = direccion;
        if (codigo_postal !== undefined) datosActualizacion.codigo_postal = codigo_postal;
        if (pais !== undefined) datosActualizacion.pais = pais;
        if (departamento !== undefined) datosActualizacion.departamento = departamento;
        if (ciudad !== undefined) datosActualizacion.ciudad = ciudad;
        if (especies !== undefined) datosActualizacion.especies = especies;
        if (actividad !== undefined) datosActualizacion.actividad = actividad;

        // Si no hay datos para actualizar
        if (Object.keys(datosActualizacion).length === 0) {
            return res.status(400).json({ 
                error: "No se proporcionaron datos para actualizar" 
            });
        }

        await empresa.update(datosActualizacion);

        return res.json({
            message: "Empresa actualizada exitosamente",
            empresa
        });

    } catch (error: any) {
        console.error("Error al editar empresa:", error);
        return res.status(500).json({ 
            error: "Error al editar la empresa",
            details: error.message 
        });
    }
};

export const verEmpresa = async(req: Request, res: Response): Promise<any> => {
    try {
        const usuario_id  = req.params.id;

        // Buscar empresa por usuario_id
        const empresa = await Empresa.findOne({
            where: { usuario_id }
        });

        if (!empresa) {
            return res.status(404).json({ 
                error: "No se encontró una empresa para este usuario" 
            });
        }

        return res.json(empresa);

    } catch (error: any) {
        console.error("Error al obtener empresa:", error);
        return res.status(500).json({ 
            error: "Error al obtener la empresa",
            details: error.message 
        });
    }
};