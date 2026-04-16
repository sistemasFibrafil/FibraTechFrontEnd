import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { UserDefinedFieldsFilterModel, UserDefinedFieldsFindModel } from 'src/app/modulos/modulo-gestion/models/sap-business-one/definiciones/general/user-defined-fields.model';
import { IUserDefinedFields } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';



@Injectable({providedIn: 'root'})
export class CamposDefinidoUsuarioService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList(value: UserDefinedFieldsFindModel) {
    let params = new HttpParams();
    params = params.append('tableID', value.tableID);
    params = params.append('aliasID', value.aliasID);
    return this.http.get<IUserDefinedFields[]>(`${environment.url_api_fib}UserDefinedFields/GetList/`,{params: params});
  }

  getListByFilter(value: UserDefinedFieldsFilterModel) {
    let params = new HttpParams();
    params = params.append('userDefinedFields', value.userDefinedFields);
    params = params.append('tableID', value.tableID);
    params = params.append('aliasID', value.aliasID);
    return this.http.get<IUserDefinedFields[]>(`${environment.url_api_fib}UserDefinedFields/GetListByFilter/`,{params: params});
  }
}
