import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { ILogisticUserQuery } from '../interfaces/logistic-user.interface';
import { LogisticUserModel } from '../models/logistic-user.model';

@Injectable({providedIn: 'root'})
export class LogisticUserService {
  constructor
  (
    private http: HttpClient
  ){ }

  getById(idUsuario: number) {
    return this.http.get<ILogisticUserQuery>(`${environment.url_api_fib}LogisticUser/GetById/${idUsuario}`);
  }

  setCreate(value: LogisticUserModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any>(`${environment.url_api_fib}LogisticUser/SetCreate/`, param);
  }
}
