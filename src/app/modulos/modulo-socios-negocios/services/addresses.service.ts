import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IAddresses } from '../interfaces/addresses.interface';


@Injectable({providedIn: 'root'})
export class AddressesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByCode(value: any) {
    let params = new HttpParams();
    params = params.append('cardCode', value.cardCode);
    params = params.append('adresType', value.adresType);
    return this.http.get<IAddresses[]>(`${environment.url_api_fib}Addresses/GetListByCode/`,{params: params});
  }

  getByCode(value: any) {
    let params = new HttpParams();
    params = params.append('cardCode', value.cardCode);
    params = params.append('address', value.address);
    params = params.append('adresType', value.adresType);
    return this.http.get<IAddresses>(`${environment.url_api_fib}Addresses/GetByCode/`,{params: params});
  }
}
