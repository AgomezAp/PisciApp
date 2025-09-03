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
  email: string;
  role: string;
  telefono?: string | null;
  twofa_enabled?: boolean;
  foto_perfil?: string | null;
  departamento?: string | null;
  ciudad?: string | null;
}

interface JwtPayload {
  id: number;
  nombre: string;
  email: string;
  role: string;
  exp: number;
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
      .post<{ accessToken: string }>(`${this.apiUrl}auth/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (credentials.rememberMe) {
            localStorage.setItem('accessToken', response.accessToken);
          } else {
            sessionStorage.setItem('accessToken', response.accessToken);
          }
          this.loadUserFromToken();
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
        email: decoded.email,
        role: decoded.role,
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
}
