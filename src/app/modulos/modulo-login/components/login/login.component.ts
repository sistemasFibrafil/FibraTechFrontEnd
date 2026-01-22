import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService, SelectItem } from 'primeng/api';

import { GlobalsConstantsForm } from '../../../../constants/globals-constants-form';

import { LoginService } from '../../services/login.service';
import { SessionService } from '../../../../services/session.service';
import { LayoutService } from '../../../../services/app.layout.service';
import { CifrarDataService } from '../../../../services/cifrar-data.service';
import { UserContextService } from '../../../../services/user-context.service';
import { MenuDinamicoService } from '../../../../services/menu-dinamico.service';

import { LoginModel } from '../../models/login.model';
import { DataBaseModel } from '../../models/data-base.model';

import { IRecuperarPasswordRequest } from '../../interfaces/autenticar.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  modeloLogin: LoginModel;

  listItemDataBase: SelectItem[] = [];

  globalsConstants: GlobalsConstantsForm = new GlobalsConstantsForm();
  formularioLogin: FormGroup;
  formularioToken: FormGroup;
  subscripcion: Subscription;

  displayValida: boolean;

  private currentImage: any;
  loadingBtn = false;
  loadingToken = false;
  loginEnProceso = false;
  private valoresCheck: any[] = [];
  isHabilitarToken: boolean;
  isUserEmail: string = '';

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private layoutService: LayoutService,
    private messageService: MessageService,
    private readonly loginService: LoginService,
    private readonly sessionService: SessionService,
    private readonly cifrarDataService: CifrarDataService,
    private readonly userContextService: UserContextService,
    private readonly menuDinamicoService: MenuDinamicoService) {}


  get dark(): boolean {
    return this.layoutService.config.colorScheme !== 'light';
  }

  ngOnInit(): void {

    this.sessionService.setItemEncrypt('I_FLG_SOCIEDAD_SELECT', false);

    this.modeloLogin = new LoginModel();
    this.instanciarFormulario();
  }

  instanciarFormulario() {
    this.formularioLogin = this.fb.group({
      dataBase: new FormControl(null, [
        Validators.required
      ]),
      login: new FormControl('', [
        Validators.minLength(4),
        Validators.required
      ]),
      password: new FormControl('', [
        Validators.minLength(6),
        Validators.required
      ]),
      chkRecuerdame: new FormControl(this.valoresCheck)
    });

    this.formularioToken = this.fb.group({
      token: new FormControl('', [
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.required
      ])
    });
  }

  goListarDataBase() {
    this.subscripcion = new Subscription();
    this.subscripcion = this.loginService.getDataSociedadAll()
    .subscribe((res: DataBaseModel[]) => {
        this.listItemDataBase = [];
        for (let item of res) {
          this.listItemDataBase.push({ label: item.descripcionDataBase, value: item.idDataBase });
        }
      },
      (err) => {
        this.loadingBtn = false;
        this.loginEnProceso = false;
        this.messageService.add({severity:'error', summary: this.globalsConstants.msgErrorSummary , detail: err.error.resultadoDescripcion});
      }
    );
  }

  goChangeDataBase() {
    this.sessionService.setItemEncrypt('I_FLG_SOCIEDAD_SELECT', true);
    this.sessionService.setItemEncrypt('I_SOCIEDAD_SELECT', 'SEDE');
  }

  onClickLogin()
  {
    this.goChangeDataBase();
    let dataBase = 'SEDE';
    let login = this.formularioLogin.value.login === undefined || this.formularioLogin.value.login === null ? '' : this.formularioLogin.value.login.trim();
    let password = this.formularioLogin.value.password === undefined || this.formularioLogin.value.password === null ? '' : this.formularioLogin.value.password.trim();

    if (dataBase === '') {
      this.messageService.add({severity:'info', summary: this.globalsConstants.msgInfoSummary , detail: 'Seleccionar Sociedad'});
      return;
    }

    if (login === '') {
      this.messageService.add({severity:'info', summary: this.globalsConstants.msgInfoSummary , detail: 'Ingresar Usuario'});
      return;
    }

    if (password === '') {
      this.messageService.add({severity:'info', summary: this.globalsConstants.msgInfoSummary , detail: 'Ingresar Contraseña'});
      return;
    }
    this.modeloLogin.usuario = this.cifrarDataService.encrypt(this.formularioLogin.value.login);
    this.modeloLogin.clave = this.cifrarDataService.encrypt(this.formularioLogin.value.password);

    this.onLoginOnline();
  }

  onLoginOnline () {
    this.loadingBtn = true;
    this.loginEnProceso = true;
    this.onDeshabilitarControlesLogin(true);

    this.subscripcion = new Subscription();
    this.subscripcion = this.loginService.autentica(this.modeloLogin)
    .subscribe((res: any) => {
        sessionStorage.setItem('token', res.token);
        this.onObtienePermisosPorUsuario();
      },
      (err) => {
        this.loadingBtn = false;
        this.loginEnProceso = false;
        this.onDeshabilitarControlesLogin(false);
        this.messageService.add({severity:'error', summary: this.globalsConstants.msgErrorSummary , detail: err.error.resultadoDescripcion});
      }
    );
  }

  onDeshabilitarControlesLogin(value: boolean) {
    if (value) {
      this.formularioLogin.controls['dataBase'].disable();
      this.formularioLogin.controls['login'].disable();
      this.formularioLogin.controls['password'].disable();
      this.formularioLogin.controls['chkRecuerdame'].disable();
    } else {
      this.formularioLogin.controls['dataBase'].enable();
      this.formularioLogin.controls['login'].enable();
      this.formularioLogin.controls['password'].enable();
      this.formularioLogin.controls['chkRecuerdame'].enable();
    }
  }

  onObtienePermisosPorUsuario() {
    this.subscripcion = new Subscription();
    this.subscripcion = this.loginService.obtienePermisosPorUsuario(this.modeloLogin)
    .subscribe((res: any) => {
        this.loadingToken = false;
        this.onEncriptaData(res);
        this.onGeneraMenu();
      },
      (err) => {
        this.loadingBtn = false;
        this.loginEnProceso = false;
        this.messageService.add({severity:'error', summary: this.globalsConstants.msgErrorSummary , detail: err.error.resultadoDescripcion});
      }
    );
  }

  onEncriptaData(res: any) {
    this.sessionService.setItem('menu-opciones', res.listaAccesoMenu);
    this.sessionService.setItem('menu', res.listaAccesoMenu);
    this.sessionService.setItemEncrypt('usuario-id', res.idUsuario);
    this.sessionService.setItemEncrypt('empleado-id', res.idPersona);
    this.sessionService.setItemEncrypt('userSap-id', res.idUserSap);
    this.sessionService.setItemEncrypt('userSap', res.userSap);
    this.sessionService.setItemEncrypt('superUser', res.superUser);
    this.sessionService.setItemEncrypt('location-id', res.idLocation);
    this.sessionService.setItemEncrypt('perfil-id', res.idPerfil);
    this.sessionService.setItemEncrypt('imagen', res.imagen);
    this.sessionService.setItemEncrypt('nombre', res.nombre);
    this.sessionService.setItemEncrypt('usuario', res.usuario);
    this.sessionService.setItemEncrypt('email', res.email);
    this.sessionService.setItemEncrypt('compnyName', res.compnyName);
    this.sessionService.setItemEncrypt('compnyAddr', res.compnyAddr);
    this.sessionService.setItemEncrypt('printHeadr', res.printHeadr);
    this.sessionService.setItemEncrypt('taxIdNum', res.taxIdNum);
    this.sessionService.setItemEncrypt('phone1', res.phone1);
    this.sessionService.setItemEncrypt('phone2', res.phone2);
    this.sessionService.setItemEncrypt('mainCurncy', res.mainCurncy);
    this.sessionService.setItemEncrypt('sysCurrncy', res.sysCurrncy);
    this.sessionService.setItemEncrypt('dfltWhs', res.dfltWhs);
    this.sessionService.setItemEncrypt('whsCodeSpareParts', res.whsCodeSpareParts);
    this.userContextService.setUser(res.usuario);
    this.onFinalizaProceso();
  }

  onGeneraMenu() {
    this.menuDinamicoService.setArmaMenuDimamico();
  }

  onFinalizaProceso() {
    this.loadingBtn = false;
    this.loginEnProceso = false;
    this.onDeshabilitarControlesLogin(false);
    this.router.navigate(['/main/bienvenido/bienvenido']);
  }

  onRecuperarContrasena() {
    this.displayValida = true;

    let dataBase = this.formularioLogin.value.dataBase === undefined || this.formularioLogin.value.dataBase === null ? '' : this.formularioLogin.value.dataBase.value;

    if (dataBase === '') {
      this.messageService.add({severity:'info', summary: this.globalsConstants.msgInfoSummary , detail: 'Seleccionar Sociedad'});
      return;
    }

    if (this.formularioLogin.value.login === '') {
      this.messageService.add({severity:'info', summary: this.globalsConstants.msgInfoSummary , detail: 'Ingresar Usuario'});
      this.displayValida = false;
      return;
    }

    let body: IRecuperarPasswordRequest = {
      usuario: this.formularioLogin.value.login,
      sociedad: dataBase
    }

    this.subscripcion = new Subscription();
    this.subscripcion = this.loginService.RecuperarPassword(body)
    .subscribe((res: any) => {
      this.displayValida = false;
      this.messageService.add({severity:'success', summary: this.globalsConstants.msgExitoSummary , detail: 'Se envio email con su nueva contraseña...!!!'});
      },
      (err) => {
        this.displayValida = false;
        this.messageService.add({severity:'error', summary: this.globalsConstants.msgErrorSummary , detail: err.error.resultadoDescripcion});
      }
    );
  }

  goViewPassword(input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  ngOnDestroy() {
    if (this.subscripcion) {
      this.subscripcion.unsubscribe();
    }
  }
}
