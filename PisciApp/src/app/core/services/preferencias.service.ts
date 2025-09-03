import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PreferenciaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  actualizarPreferencias(data: {
    noti_email?: boolean;
    noti_alertas?: boolean;
    tema?: string;
    idioma?: string;
  }) {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}usuarios/preferencias`,
      data,
      { withCredentials: true }
    );
  }
  
}
