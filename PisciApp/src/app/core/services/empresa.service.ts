import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from './error.service';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient, private errorService: ErrorService) { }

  crearEmpresa(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}empresa/crear`, data)
    .pipe(catchError(error => this.errorService.handleError(error)))
  }

  verEmpresa(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}empresa/obtener/${id}`)
    .pipe(catchError(error => this.errorService.handleError(error)))
  }

  editarEmpresa(data: any, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}empresa/editar/${id}`, data)
    .pipe(catchError(error => this.errorService.handleError(error)))
  }
}
