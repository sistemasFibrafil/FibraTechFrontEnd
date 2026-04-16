import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { IArticuloAlmacenSap } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/articulo-almacen-sap.interface';


@Injectable({providedIn: 'root'})
export class WarehousesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByInactive(value: any) {
    let params = new HttpParams();
    params = params.append('inactive', value.inactive);
    return this.http.get<IWarehouses[]>(`${environment.url_api_fib}Warehouses/GetListByInactive/`, {params: params});
  }

  getListProduccion() {
    return this.http.get<IWarehouses[]>(`${environment.url_api_fib}Warehouses/GetListProduccion/`);
  }

  getListByItem(value: any) {
    let params = new HttpParams();
    params = params.append('itemCode', value.itemCode);
    params = params.append('inactive', value.inactive);
    params = params.append('Warehouse', value.Warehouse);

    return this.http.get<IWarehouses[]>(`${environment.url_api_fib}Warehouses/GetListByItem/`, {params: params});
  }

  getListByWhsCodeAndItemCode(value: any) {
    let params = new HttpParams();
    params = params.append('itemCode', value.itemCode);
    params = params.append('inactive', value.inactive);
    params = params.append('whsCode', value.whsCode);

    return this.http.get<IArticuloAlmacenSap[]>(`${environment.url_api_fib}Warehouses/GetListByWhsCodeAndItemCode/`, {params: params});
  }
}
