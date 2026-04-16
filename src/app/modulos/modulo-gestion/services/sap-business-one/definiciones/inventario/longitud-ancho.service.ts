import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ILongitudAncho } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/longitud-ancho.interface';



@Injectable({providedIn: 'root'})
export class LongitudAnchoService {
  constructor(
    private http: HttpClient) { }

  getList() {
    return this.http.get<ILongitudAncho[]>(`${environment.url_api_fib}LongitudAncho/GetList/`);
  }
}
