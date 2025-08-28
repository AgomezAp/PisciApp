import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
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

  // ✅ Aquí guardamos el usuario actual de forma reactiva
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken(); // al inicializar, intenta cargar usuario desde localStorage
  }

  // ---------------- LOGIN ----------------
  login(credentials: { correo: string; contrasena: string }): Observable<any> {
    return this.http
      .post<{ accessToken: string }>(`${this.apiUrl}auth/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('accessToken', response.accessToken);
          this.loadUserFromToken(); // 👈 cargar Usuario desde JWT
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
        })
      );
  }

  // ---------------- Google OAuth ----------------
  registerWithGoogle(): void {
    window.location.href = `${this.apiUrl}auth/google`;
  }

  // ---------------- EMAIL VERIFY ----------------
  verifyEmail(correo: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/verify`, { correo, codigo });
  }

  // ---------------- REFRESH TOKEN ----------------
  refreshAccessToken(): Observable<string> {
    return this.http
      .post<{ accessToken: string }>(
        `${this.apiUrl}auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((res) => {
          localStorage.setItem('accessToken', res.accessToken);
          this.loadUserFromToken();
          return res.accessToken;
        })
      );
  }

  // ---------------- LOGOUT ----------------
  logout(): Observable<any> {
    localStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      {
        withCredentials: true, // 👈 imprescindible
      }
    );
  }

  // ---------------- AUTH HELPERS ----------------
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // ✅ Obtener usuario desde el JWT guardado
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode<JwtPayload>(token); // 👈 aquí
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
  // ✅ Acceso directo al usuario actual (no reactivo)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
