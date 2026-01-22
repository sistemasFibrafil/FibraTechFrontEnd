import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IDireccion } from '../interfaces/direccion.interface';


@Injectable({providedIn: 'root'})
export class DireccionService {
  constructor
  (
    private http: HttpClient
  ) { }


  getListByCode(value: any) {
    let params = new HttpParams();
    params = params.append('cardCode', value.cardCode);
    params = params.append('adresType', value.adresType);
    return this.http.get<IDireccion[]>(`${environment.url_api_fib}Direccion/GetListByCode/`,{params: params});
  }

  getByCode(value: any) {
    let params = new HttpParams();
    params = params.append('cardCode', value.cardCode);
    params = params.append('address', value.address);
    params = params.append('adresType', value.adresType);
    return this.http.get<IDireccion>(`${environment.url_api_fib}Direccion/GetByCode/`,{params: params});
  }
}
