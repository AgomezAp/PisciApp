import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from './error.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient, private errorService: ErrorService) { }

  crearInventario(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario/agregar`, data)
    .pipe(catchError(error => this.errorService.handleError(error)))
  }

  obtenerInventario(usuario_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}inventario/obtener`)
    .pipe(catchError(error => this.errorService.handleError(error)))
  }


}
