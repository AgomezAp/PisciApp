import { Injectable } from '@angular/core';
import { User } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
interface FotoPerfilResponse {
  success: boolean;
  message: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  updateProfile(data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}usuarios/perfil-actualizar`, data, {
      withCredentials: true,
    });
  }
  subirFotoPerfil(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', file);

    return this.http.post(`${this.apiUrl}usuarios/foto-perfil`, formData, {
      withCredentials: true,
    });
  }
}
