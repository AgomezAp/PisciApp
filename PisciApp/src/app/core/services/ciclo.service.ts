import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorService } from './error.service';
import { environment } from '../../../environments/environment';
import { Observable, catchError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CicloService {
    private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient, private errorService: ErrorService) {}

  crearCiclo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclos/crear`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

  cerrarCiclo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclos/cerrar`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

  actualizarBajas(data: any, ciclo_id: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclos/bajas/${ciclo_id}`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

  ingresarAlimento(data: any, ciclo_id: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclos/alimento/${ciclo_id}`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  } 
  ingresarQuimico(data: any, ciclo_id: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclos/quimico/${ciclo_id}`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

  cambiarTanque(data: any, ciclo_id: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclos/cambiar-tanque/${ciclo_id}`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }
  obtenerCicloPorUsuario(usuario_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}ciclos/obtener/${usuario_id}`)
      .pipe(catchError(error => this.errorService.handleError(error)));
  }

}
