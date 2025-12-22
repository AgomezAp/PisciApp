import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../services/notification.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    const isAuthRoute =
      req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/verify') ||
      req.url.includes('/auth/refresh') ||
      req.url.includes('/auth/2fa/verificar');

    let authReq = req;
    if (token && !isAuthRoute) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // ⚡ Caso token vencido o inválido
        if (error.status === 401 && !this.isRefreshing && !isAuthRoute) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);

          return this.authService.refreshAccessToken().pipe(
            switchMap((newToken) => {
              this.isRefreshing = false;
              this.refreshTokenSubject.next(newToken);

              return next.handle(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                })
              );
            }),
            catchError((err) => {
              this.isRefreshing = false;

              // 🔥 Aquí reseteamos sesión, mandamos notificación y redirigimos
              this.authService.logout().subscribe();

              this.notification.toast(
                'Sesión cerrada. Vuelve a iniciar por favor.',
                'info'
              );

              this.router.navigate(['/login']);

              return throwError(() => err);
            })
          );
        } else if (error.status === 401 && this.isRefreshing) {
          // ⚡ Esperar a que termine el refresh
          return this.refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) =>
              next.handle(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${token}` },
                })
              )
            )
          );
        }

        return throwError(() => error);
      })
    );
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return true; // sin exp = inválido
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.authService.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }
}
