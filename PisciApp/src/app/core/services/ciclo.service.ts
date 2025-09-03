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
    return this.http.post(`${this.apiUrl}ciclo/crear`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

  cerrarCiclo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclo/cerrar`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

  actualizarBajas(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclo/bajas`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

  ingresarAlimento(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclo/alimento`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  } 
  ingresarQuimico(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclo/quimico`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

  cambiarTanque(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ciclo/cambiar-tanque`, data)
    .pipe(catchError(error => this.errorService.handleError(error)));
  }

}
