import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IStatus } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/status.interface';

@Injectable({providedIn: 'root'})
export class StatusService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IStatus[]>(`${environment.url_api_fib}Status/GetList/`);
  }
}
