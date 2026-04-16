import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { IPaymentTermsTypes } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/condicion-pago-sap.interface';


@Injectable({providedIn: 'root'})
export class PaymentTermsTypesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IPaymentTermsTypes[]>(`${environment.url_api_fib}PaymentTermsTypes/GetList/`);
  }

  getByCode(groupNum: number) {
    return this.http.get<IPaymentTermsTypes>(`${environment.url_api_fib}PaymentTermsTypes/GetByCode/${groupNum}`);
  }
}
