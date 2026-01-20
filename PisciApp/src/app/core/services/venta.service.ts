import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from './error.service';
import { Observable, catchError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient, private errorService: ErrorService) { }

  crearVenta(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}venta/nueva`, data)
    .pipe(catchError(error => this.errorService.handleError(error)))
  }

  obtenerVentas(): Observable<any> {
    return this.http.get(`${this.apiUrl}venta/obtener`)
    .pipe(catchError(error => this.errorService.handleError(error)))
  }

  obtenerCompradores(): Observable<any> {
    return this.http.get(`${this.apiUrl}venta/compradores`)
    .pipe(catchError(error => this.errorService.handleError(error)))
  }
}
