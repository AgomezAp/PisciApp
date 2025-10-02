import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCarrito } from './carrito.service';

export interface CompraResponse {
  message: string;
  compraId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = 'http://localhost:3000/compras'; // Ajusta al puerto de tu backend

  constructor(private http: HttpClient) {}

  checkout(items: ItemCarrito[]): Observable<CompraResponse> {
    return this.http.post<CompraResponse>(`${this.apiUrl}/checkout`, { items });
  }
}
