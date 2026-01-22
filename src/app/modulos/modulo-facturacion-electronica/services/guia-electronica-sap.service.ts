import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';


@Injectable({providedIn: 'root'})
export class GuiaElectronicaSapService {
  constructor
  (
    private http: HttpClient,
  ) { }

  setEnviar(value: any) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}GuiaElectronicaSap/SetEnviar/`, param);
  }
}
