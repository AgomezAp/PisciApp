import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor() {}

  /**
   * Maneja los errores del backend y devuelve un mensaje legible
   */
   getErrorMessage(error: any): string {
    // 🔥 Agregamos logging para debug (remover en producción)
    console.error('Error completo recibido:', error);

    if (error instanceof HttpErrorResponse) {
      // 🔥 Loggear el error específico del backend
      console.error('HttpErrorResponse - Status:', error.status);
      console.error('HttpErrorResponse - Error body:', error.error);

      // ✅ Caso 1: Backend devuelve {"error": "mensaje"}
      if (error.error?.error && typeof error.error.error === 'string') {
        return error.error.error;
      }

      // ✅ Caso 2: Backend devuelve {"message": "mensaje"}
      if (error.error?.message && typeof error.error.message === 'string') {
        return error.error.message;
      }

      // ✅ Caso 3: Backend devuelve string directo
      if (typeof error.error === 'string' && error.error.trim() !== '') {
        return error.error;
      }

      // ✅ Caso 4: Backend devuelve {"msg": "mensaje"} (otra variante común)
      if (error.error?.msg && typeof error.error.msg === 'string') {
        return error.error.msg;
      }

      // ✅ Caso 5: Backend devuelve {"detail": "mensaje"} (Django, FastAPI)
      if (error.error?.detail && typeof error.error.detail === 'string') {
        return error.error.detail;
      }

      // ✅ Caso 6: Error con múltiples campos (validaciones)
      if (error.error?.errors && typeof error.error.errors === 'object') {
        const firstError = Object.values(error.error.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          return firstError[0];
        }
      }

      // ✅ Caso 7: Si no hay info específica, usar status codes
      switch (error.status) {
        case 0:
          return 'No se pudo conectar con el servidor. Verifica tu conexión.';
        case 400:
          return 'Los datos enviados no son válidos.';
        case 401:
          return 'Credenciales inválidas. Verifica tu usuario y contraseña.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 404:
          return 'El recurso solicitado no existe.';
        case 422:
          return 'Los datos enviados contienen errores.';
        case 500:
          return 'Error interno del servidor. Intenta más tarde.';
        case 502:
          return 'El servidor no está disponible temporalmente.';
        case 503:
          return 'El servicio no está disponible. Intenta más tarde.';
        default:
          return `Error del servidor (${error.status}): ${error.statusText || 'Error desconocido'}`;
      }
    }

    // ✅ Si es un error de JavaScript/Angular ya procesado
    if (error?.message && typeof error.message === 'string') {
      return error.message;
    }

    // ✅ Si Angular ya nos pasó un string
    if (typeof error === 'string' && error.trim() !== '') {
      return error;
    }

    // ✅ Último recurso: mostrar lo que tengamos
    console.error('Error no manejado específicamente:', error);
    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  }

  handleError(error: any) {
    const message = this.getErrorMessage(error);
    console.error('Mensaje final para el usuario:', message);
    return throwError(() => ({ message }));
  }
}
