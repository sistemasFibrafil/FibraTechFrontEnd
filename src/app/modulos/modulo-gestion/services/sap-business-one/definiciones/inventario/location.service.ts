import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ILocation } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/location.interface';


@Injectable({providedIn: 'root'})
export class LocationService {
  constructor
  (
    private http: HttpClient
  )
  { }

  getList() {
    return this.http.get<ILocation[]>(`${environment.url_api_fib}Location/GetList`);
  }
}
