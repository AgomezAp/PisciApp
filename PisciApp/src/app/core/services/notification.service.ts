import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  toast(message: string, icon: 'success' | 'error' | 'info' = 'info') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  success(message: string, title: string = 'Éxito') {
    Swal.fire({ icon: 'success', title, text: message });
  }

  error(message: string, title: string = 'Error') {
    Swal.fire({ icon: 'error', title, text: message });
  }

  info(message: string, title: string = 'Info') {
    Swal.fire({ icon: 'info', title, text: message });
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
