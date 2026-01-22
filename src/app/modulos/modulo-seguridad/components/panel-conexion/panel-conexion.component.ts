import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { SeguridadService } from '../../services/seguridad.service';
import { ParametroConexionModel } from '../../models/parametro-conexion.model';
import { CifrarDataService } from '../../../../services/cifrar-data.service';
import { GlobalsConstantsForm } from '../../../../constants/globals-constants-form';
import { SwaCustomService } from '../../../../services/swa-custom.service';



@Component({
  selector: 'app-seg-panel-conexion',
  templateUrl: './panel-conexion.component.html',
  styleUrls: ['./panel-conexion.component.css']
})
export class PanelConexionComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Parametros de Conexión';
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloForm: FormGroup;

  subscription$: Subscription;

  modelo: ParametroConexionModel = new ParametroConexionModel();

  listSapVersion: [];
  listSapBaseDatos: [];
  listSunatProveedorCorrreo: [];
  listSunatTipoSeguridad: [];
  listSunatTecnologiaSap: [];


  constructor(private fb: FormBuilder,
              private seguridadService: SeguridadService,
              private readonly swaCustomService: SwaCustomService,
              private cifrarDataService: CifrarDataService) {}

  ngOnInit(): void {
    this.onInicializaFormulario();
    this.onObtieneRegistro();
  }

  onInicializaFormulario() {
    this.modeloForm = this.fb.group({
      aplicacionServidor : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(100), Validators.minLength(5)])),
      aplicacionBaseDatos : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(100), Validators.minLength(5)])),
      aplicacionUsuario : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(100), Validators.minLength(2)])),
      aplicacionPasswordOriginal : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(20), Validators.minLength(5)])),
      sapServidor : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(100), Validators.minLength(5)])),
      sapPuerto : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(5), Validators.minLength(1)])),
      sapVersion : new FormControl('', Validators.compose(
      [Validators.required])),
      sapBaseDatos : new FormControl('', Validators.compose(
      [Validators.required])),
      sapUsuario : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(100), Validators.minLength(5)])),
      sapPasswordOriginal : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(20), Validators.minLength(5)])),
      sunatTecnologia : new FormControl('', Validators.compose(
      [Validators.required])),
      sapUsuarioIndirecta : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(50), Validators.minLength(3)])),
      sapPasswordIndirecta : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(20), Validators.minLength(5)])),
      sunatApiResConsulta : new FormControl('', Validators.compose(
      [Validators.required])),
      sunatCorreo : new FormControl('', Validators.compose(
      [Validators.required])),
      sunatPassword : new FormControl('', Validators.compose(
      [Validators.required, Validators.maxLength(20), Validators.minLength(5)])),
      sunatProveedorCorreo : new FormControl('', Validators.compose(
      [Validators.required])),
      sunatTipoSeguridad : new FormControl('', Validators.compose(
      [Validators.required])),
      finanzasAplicarGastos : new FormControl('', Validators.compose(
      [Validators.required])),
      flgAplicaFondoTopeSede:new FormControl(false),
      finanzasDim01 : new FormControl(''),
      finanzasDim02 : new FormControl(''),
      finanzasDim03 : new FormControl(''),
      finanzasDim04 : new FormControl(''),
      finanzasDim05 : new FormControl(''),
      flgManejaActividadOperacion : new FormControl(false),
      finanzasActividadOperacion : new FormControl(''),
      flgMontosIncluyenImpuestos : new FormControl(false),
      finanzasComentarioGeneral : new FormControl(''),
      flgIntegraBpsSypsoft :  new FormControl(false),
      finanzasTopeViaticoMaximoDia:  new FormControl(''),
      flgManejaTablaGastosServicios: new FormControl(false)
      });
  }

  onObtieneRegistro() {
    this.subscription$ = new Subscription();
    this.subscription$ = this.seguridadService.getParametroConexionPorId()
    .subscribe(resp => {
      if (resp) {
        this.modelo = resp;
        this.setRegistroObtenido();
        }
      },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      }
    );
  }

  setRegistroObtenido() {
    this.modeloForm.controls['aplicacionServidor'].setValue(this.modelo.aplicacionServidor);
    this.modeloForm.controls['aplicacionBaseDatos'].setValue(this.modelo.aplicacionBaseDatos);
    this.modeloForm.controls['aplicacionUsuario'].setValue(this.modelo.aplicacionUsuario);
    this.modeloForm.controls['aplicacionPasswordOriginal'].setValue(this.cifrarDataService.decrypt(this.modelo.aplicacionPasswordOriginal));
    this.modeloForm.controls['sapServidor'].setValue(this.modelo.sapServidor);
    this.modeloForm.controls['sapBaseDatos'].setValue(this.modelo.sapBaseDatos);
    this.modeloForm.controls['sapUsuario'].setValue(this.modelo.sapUsuario);
    this.modeloForm.controls['sapPasswordOriginal'].setValue(this.cifrarDataService.decrypt(this.modelo.sapPasswordOriginal));
  }

  onClickSave() {
    this.modelo.aplicacionServidor = this.modeloForm.controls['aplicacionServidor'].value;
    this.modelo.aplicacionBaseDatos = this.modeloForm.controls['aplicacionBaseDatos'].value;
    this.modelo.aplicacionUsuario = this.modeloForm.controls['aplicacionUsuario'].value;
    this.modelo.aplicacionPasswordOriginal = this.cifrarDataService.encrypt(this.modeloForm.controls['aplicacionPasswordOriginal'].value);
    this.modelo.sapServidor = this.modeloForm.controls['sapServidor'].value;
    this.modelo.sapBaseDatos = this.modeloForm.controls['sapBaseDatos'].value;
    this.modelo.sapUsuario = this.modeloForm.controls['sapUsuario'].value;
    this.modelo.sapPasswordOriginal = this.cifrarDataService.encrypt(this.modeloForm.controls['sapPasswordOriginal'].value);
    this.subscription$ = new Subscription();
    var observ = new Observable();
    if (this.modelo.idParametroConexion !== 0) {
      observ = this.seguridadService.setUpdateParametroConexion(this.modelo);
    } else {
      observ = this.seguridadService.setInsertParametroConexion(this.modelo);
    }
    this.subscription$ = observ
    .subscribe(() =>  {
      this.swaCustomService.swaMsgExito(null);
    },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    });
  }

  ngOnDestroy() {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }

}
