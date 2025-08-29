import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  success(message: string, title: string = 'Éxito') {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonColor: '#0097a7',
    });
  }

  error(message: string, title: string = 'Error') {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonColor: '#e53935',
    });
  }

  info(message: string, title: string = 'Info') {
    Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonColor: '#1976d2',
    });
  }

  confirm(
    message: string,
    callback: () => void,
    title: string = '¿Estás seguro?'
  ) {
    Swal.fire({
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#0097a7',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) callback();
    });
  }
}
