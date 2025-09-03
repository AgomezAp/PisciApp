import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
interface ActivarResponse {
  qrCodeUrl: string;
}
interface ConfirmarResponse {
  success: boolean;
  message: string;
  twofa_enabled: boolean;
}
interface DesactivarResponse {
  success: boolean;
  message: string;
  twofa_enabled: boolean;
}
interface VerificarLoginResponse {
  accessToken: string;
  refreshToken: string;
}
@Injectable({
  providedIn: 'root',
})
export class TwofaService {
  private apiUrl = `${environment.apiUrl}usuarios/auth/2fa/`;

  constructor(private http: HttpClient) {}

  activar(): Observable<ActivarResponse> {
    return this.http.post<ActivarResponse>(
      this.apiUrl + 'activar',
      {},
      { withCredentials: true }
    );
  }

  confirmar(token: string): Observable<ConfirmarResponse> {
    return this.http.post<ConfirmarResponse>(
      this.apiUrl + 'confirmar',
      { token },
      { withCredentials: true }
    );
  }

  desactivar(token: string): Observable<DesactivarResponse> {
    return this.http.post<DesactivarResponse>(
      this.apiUrl + 'desactivar',
      { token },
      { withCredentials: true }
    );
  }

  verificarLogin(
    userId: number,
    token: string
  ): Observable<VerificarLoginResponse> {
    return this.http.post<VerificarLoginResponse>(this.apiUrl + 'verificar', {
      userId,
      token,
    });
  }
}
