import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserContextService } from '../services/user-context.service';
import { Observable, throwError } from 'rxjs';
import { InterfaceError } from '../interface/error.interface';
import { catchError } from 'rxjs/operators';
import { SessionService } from '../services/session.service';
import { ConstantesGenerales } from '../constants/Constantes-generales';

interface errorHttp extends HttpErrorResponse{
  servidorNoEncontrado: boolean
}

@Injectable({
  providedIn: 'root'
})
export class HeaderInterceptorService {

  _I_FLG_SOCIEDAD_SELECT: boolean;
  _I_SOCIEDAD_SELECT: string;

  constructor(
    private readonly userContextService: UserContextService,
    private readonly sessionService: SessionService
    ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._I_FLG_SOCIEDAD_SELECT = false;

    if (this.sessionService.getItem('I_FLG_SOCIEDAD_SELECT')) {
      this._I_FLG_SOCIEDAD_SELECT = this.sessionService.getItemDecrypt('I_FLG_SOCIEDAD_SELECT') === 'false' ? false : true;
    }

    if (this.sessionService.getItem('I_SOCIEDAD_SELECT')) {
      this._I_SOCIEDAD_SELECT = this.sessionService.getItemDecrypt('I_SOCIEDAD_SELECT');
    }

    let updateReq: HttpRequest<any>;

    const user = this.userContextService.user$.getValue();
    if (user) {
      const TOKEN = sessionStorage.getItem('token');
      if (req.reportProgress) {
        updateReq = req.clone(
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${TOKEN}`,
              's_soci': this._I_SOCIEDAD_SELECT
            })
          }
        );
      } else {

        let body: any;

        if (typeof req.body === 'object') {
          body = null;
        } else {
          body = JSON.parse(req.body);
        }

        if (body === null) {
          updateReq = req.clone(
            {
              headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`,
                's_soci': this._I_SOCIEDAD_SELECT
              })
            }
          );
        } else {
          if (body.izipay) {
            if (body.izipaylogin) {
              updateReq = req.clone(
                {
                  headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    's_soci': this._I_SOCIEDAD_SELECT
                  })
                }
              );
            } else {
              updateReq = req.clone(
                {
                  headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${body.ecr_token}`,
                    's_soci': this._I_SOCIEDAD_SELECT
                  })
                }
              );
            }
            
          } else {
            updateReq = req.clone(
              {
                headers: new HttpHeaders({
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${TOKEN}`,
                  's_soci': this._I_SOCIEDAD_SELECT
                })
              }
            );
          }
        }
      }
    } else {
      if ( this._I_FLG_SOCIEDAD_SELECT ) {
        updateReq = req.clone(
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              's_soci': this._I_SOCIEDAD_SELECT
            })
          }
        );
      } else {
        updateReq = req.clone(
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              's_soci': ConstantesGenerales._DATABASEDEFAULT
            })
          }
        );
      }
    }

    return next.handle(updateReq).pipe(
      catchError(error => {
        let customErrorHttp: errorHttp = error;
        customErrorHttp.servidorNoEncontrado = false;

        let errorMessage = '';
        // let detalleError: any;
        let objetoError: InterfaceError;

        if (error instanceof ErrorEvent) {
          // error en el cliente
          if (error.error.message) {
            errorMessage = `Error del lado del Cliente: ${error.error.message}`;
          }
        } else {
          // error en el backend
          // VALIDAR EL ERROR HTTP
          if (error.status === 0) {
            errorMessage = 'Parece que no hay Conexión con el Servidor Central. Intente Nuevamente';
            customErrorHttp.servidorNoEncontrado = true;

          } else if (error.status >= 502 && error.status <= 504) {
            errorMessage = 'No hay Conexión con el Servidor Central. Intente Nuevamente';
            customErrorHttp.servidorNoEncontrado = true;

          } else if (error.status === 401) {
            // CUANDO EL TOKEN HAYA CADUCADO => 401 = UNAUTHORIZED
              // IR A LOGIN
              // this.servicioMensaje._MENSAJE_INFORMACION('La Sesión ha expirado. Indíque sus credenciales');
              errorMessage = 'La Sesión ha expirado. Ingrese sus credenciales Nuevamente';
              // this.servicioMensaje._MENSAJE_INFORMACION_IMPORTANTE(errorMessage);
              this.userContextService.logout();
              return throwError(error);
          } else {
            if (error.status && error.message) {
              errorMessage = `Error del lado del Servidor: ${error.status} ${error.message}`;
            }
          }
        }
        if (error) {
          objetoError = this.armarError(error);
          errorMessage = errorMessage;
        }
        // this.servicioMensaje._MENSAJE_FATAL_HTTP(errorMessage, objetoError);
        return throwError(error);
      })
    ) as any;
  }


  armarError(datoError: any): InterfaceError {
    return {
      message: datoError.message,
      name: datoError.name,
      ok: datoError.ok,
      status: datoError.status,
      statusText: datoError.statusText,
      url: datoError.url
    };
  }
}
