import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from './error.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TanqueService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient, private errorService: ErrorService) { }

  crearTanque(data:any): Observable<any> {
    return this.http.post(`${this.apiUrl}tanque/crear`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }
  eliminarTanque(id:number): Observable<any> {
    return this.http.delete(`${this.apiUrl}tanque/eliminar/${id}`)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }
  editarTanque(id:number, data:any): Observable<any> {
    return this.http.put(`${this.apiUrl}tanque/editar/${id}`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }
  actualizarMediciones(tanque_id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}tanque/mediciones/${tanque_id}`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }
}
