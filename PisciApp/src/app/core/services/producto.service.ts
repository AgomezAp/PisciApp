import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ErrorService } from './error.service';

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}productos`;

  constructor(private http: HttpClient, private errorService: ErrorService) {}

  // 👇 Ajustamos el tipo de respuesta
  getProductos(): Observable<{ data: Producto[] }> {
    return this.http.get<{ data: Producto[] }>(`${this.apiUrl}/ver-productos`)
      .pipe(catchError(error => this.errorService.handleError(error)));
  }
 /* getProductos(): Observable<{ message: string; producto: Producto[] }> {
  return this.http.get<{ message: string; producto: Producto[] }>(
    `${this.apiUrl}/ver-productos` 
  ).pipe(catchError(error => this.errorService.handleError(error)));
} */

  
  addProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/crear`, producto)
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

  updateProducto(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/actualizar`, producto)
      .pipe(catchError(error => this.errorService.handleError(error)));
  }
  deleteProdqaucto(id: number): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(`${this.apiUrl}/eliminar/${id}`)
    .pipe(catchError(error => this.errorService.handleError(error)));
}

}