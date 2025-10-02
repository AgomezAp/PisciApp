import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { ErrorService } from './error.service';

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  telefono?: string | null;
  twofa_enabled?: boolean;
  foto_perfil?: string | null;
  departamento?: string | null;
  ciudad?: string | null;
  noti_alertas?: boolean | null;
  noti_email?: boolean | null;
  tema?: string | null;
  idioma?: string | null;
}

interface JwtPayload {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  rol: string;
  exp: number;
  twofa_enabled: boolean;
  noti_email: boolean;
  noti_alertas: boolean;
  tema: string | null;
  idioma: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private errorService: ErrorService) {
    this.loadUserFromToken();
  }

  // ---------------- LOGIN ----------------
  login(credentials: {
    correo: string;
    contrasena: string;
    rememberMe?: boolean;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}auth/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          // ⚡ Solo guardamos token si no requiere 2FA
          if (!response.requires2FA && response.accessToken) {
            const storage = credentials.rememberMe
              ? localStorage
              : sessionStorage;
            storage.setItem('accessToken', response.accessToken);
            this.loadUserFromToken();
          }
        }),
        catchError((error) => {
          // 🔥 Usar el servicio de errores mejorado
          return this.errorService.handleError(error);
        })
      );
  }

  // ---------------- REGISTER ----------------
  register(data: {
    nombre: string;
    correo: string;
    contrasena: string;
    telefono: string;
    departamento: string;
    ciudad: string;
  }): Observable<any> {
    return this.http
      .post<{ accessToken?: string }>(`${this.apiUrl}auth/register`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            this.loadUserFromToken();
          }
        }),
        catchError((error) => {
          return this.errorService.handleError(error);
        })
      );
  }

  // ---------------- RESTO DE MÉTODOS (mantener igual) ----------------
  registerWithGoogle(): void {
    window.location.href = `${this.apiUrl}auth/google`;
  }

  verifyEmail(correo: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/verify`, { correo, codigo }).pipe(
      catchError((error) => {
        return this.errorService.handleError(error);
      })
    );
  }

  refreshAccessToken(): Observable<string> {
    return this.http
      .post<{ accessToken: string }>(
        `${this.apiUrl}auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        map((res) => {
          const storage = sessionStorage.getItem('accessToken')
            ? sessionStorage
            : localStorage;
          storage.setItem('accessToken', res.accessToken);
          this.loadUserFromToken();
          return res.accessToken;
        }),
        catchError((error) => {
          return this.errorService.handleError(error);
        })
      );
  }

  logout(): Observable<any> {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);

    console.log('🚪 Cierre de sesión desde frontend, notificando backend...');

    return this.http
      .post(`${this.apiUrl}auth/logout`, {}, { withCredentials: true })
      .pipe(
        catchError((error) => {
          return this.errorService.handleError(error);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!(
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }

  getToken(): string | null {
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
      const user: User = {
        id: decoded.id,
        nombre: decoded.nombre,
        correo: decoded.correo,
        telefono: decoded.telefono ?? null,
        rol: decoded.rol,
        twofa_enabled: decoded.twofa_enabled ?? false,
        noti_email: decoded.noti_email ?? false,
        noti_alertas: decoded.noti_alertas ?? false,
        tema: decoded.tema ?? null,
        idioma: decoded.idioma ?? null,
      };
      this.currentUserSubject.next(user);
    } catch (err) {
      console.error('Error decodificando token:', err);
      this.currentUserSubject.next(null);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  getProfile(): Observable<User> {
    return this.http
      .get<{ success: boolean; usuario: User }>(
        `${this.apiUrl}usuarios/perfil`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((res) => res.usuario),
        tap((usuario) => this.currentUserSubject.next(usuario))
      );
  }
  loginWithGoogle(idToken: string): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}auth/google`,
        { idToken },
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            this.loadUserFromToken();
          }
        }),
        catchError((error) => this.errorService.handleError(error))
      );
  }
}
