import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ParametroSistemaModel } from '../../models/parametro-sistema.model';
import { SeguridadService } from '../../services/seguridad.service';
import { CifrarDataService } from '../../../../services/cifrar-data.service';
import { GlobalsConstantsForm } from '../../../../constants/globals-constants-form';
import { SwaCustomService } from '../../../../services/swa-custom.service';
import { SelectItem } from 'primeng/api';
import { UtilService } from '../../../../services/util.service';

@Component({
  selector: 'app-seg-panel-sistema',
  templateUrl: './panel-sistema.component.html',
  styleUrls: ['./panel-sistema.component.css']
})
export class PanelSistemaComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Parametros de Sistema';
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloForm: FormGroup;

  listTipoAutenticacion: SelectItem[] = [];
  listDimension: SelectItem[] = [];

  subscription$: Subscription;

  modelo: ParametroSistemaModel = new ParametroSistemaModel();


  constructor(private fb: FormBuilder,
              private seguridadService: SeguridadService,
              private readonly swaCustomService: SwaCustomService,
              private readonly utilService: UtilService,
              private cifrarDataService: CifrarDataService) {
  }

  ngOnInit(): void {
    this.onInicializaFormulario();
    this.onObtieneRegistro();
    this.onBuildList();
  }

  onInicializaFormulario() {
    this.modeloForm = this.fb.group({
      tipoAutenticacion : new FormControl(null, Validators.compose([Validators.required])),
      flgDimensionSAP : new FormControl(false, Validators.compose([Validators.required])),
      dimensionSAP : new FormControl({value: null, disabled: true}),
      flgGoogleDrive : new FormControl(true, Validators.compose([Validators.required])),
      flgDobleAutenticacion : new FormControl(true, Validators.compose([Validators.required])),

      sendEmail : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100), Validators.minLength(5)])),
      sendEmailPasswordOrigen : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(5)])),
      sendEmailPort : new FormControl(0, Validators.compose([Validators.required,])),
      sendEmailEnabledSSL : new FormControl(false, Validators.compose([Validators.required])),
      sendEmailHost : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100), Validators.minLength(5)])),

      sendEmailFinanza : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100), Validators.minLength(5)])),
      sendEmailFinanzaPasswordOrigen : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(5)])),
      sendEmailFinanzaPort : new FormControl(0, Validators.compose([Validators.required,])),
      sendEmailFinanzaEnabledSSL : new FormControl(false, Validators.compose([Validators.required])),
      sendEmailFinanzaHost : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100), Validators.minLength(5)])),

      asuntoFinanza : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100), Validators.minLength(5)])),
      cuerpoFinanza : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(500), Validators.minLength(5)])),
      diasPorVencerFinanza : new FormControl(0, Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])),
      horaEnvioFinanza : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(5), Validators.minLength(5)])),

      emailGoogleDrive : new FormControl('', Validators.compose([Validators.maxLength(100), Validators.minLength(5)])),
      emailPassword : new FormControl('', Validators.compose([Validators.maxLength(30), Validators.minLength(3)])),
      });
  }

  onBuildList() {
    this.listTipoAutenticacion.push({label: 'NORMAL', value: 'AUTO-NORMAL'});
    this.listTipoAutenticacion.push({label: 'DIRECTORIO ACTIVO', value: 'AUTO-ACTIVE-DIRECTORY'});

    this.listDimension.push({label: 'Dimersión 1', value: 1});
    this.listDimension.push({label: 'Dimersión 2', value: 2});
    this.listDimension.push({label: 'Dimersión 3', value: 3});
    this.listDimension.push({label: 'Dimersión 4', value: 4});
    this.listDimension.push({label: 'Dimersión 5', value: 5});
  }

  onObtieneRegistro() {
    this.subscription$ = new Subscription();
    this.subscription$ = this.seguridadService.getParametroSistemaPorId()
    .subscribe(resp => {
      if (resp) {
        this.modelo = resp;
        console.log(this.modelo);
        this.setRegistroObtenido();
        }
      },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      }
    );
  }

  setRegistroObtenido() {

    this.modeloForm.controls['tipoAutenticacion'].setValue(this.utilService.goFindRegistroPorCode( this.listTipoAutenticacion, this.modelo.tipoAutenticacion ));
    this.modeloForm.controls['flgDimensionSAP'].setValue(this.modelo.flgDimensionSAP);
    this.modeloForm.controls['dimensionSAP'].setValue(this.utilService.goFindRegistroPorCode( this.listDimension, this.modelo.idDimensionSAP ));
    this.modeloForm.controls['flgGoogleDrive'].setValue(this.modelo.flgGoogleDrive);
    this.modeloForm.controls['flgDobleAutenticacion'].setValue(this.modelo.flgDobleAutenticacion);

    this.modeloForm.controls['sendEmail'].setValue(this.modelo.sendEmail);
    this.modeloForm.controls['sendEmailPasswordOrigen'].setValue(this.cifrarDataService.decrypt(this.modelo.sendEmailPasswordOrigen));
    this.modeloForm.controls['sendEmailPort'].setValue(this.modelo.sendEmailPort);
    this.modeloForm.controls['sendEmailEnabledSSL'].setValue(this.modelo.sendEmailEnabledSSL);
    this.modeloForm.controls['sendEmailHost'].setValue(this.modelo.sendEmailHost);

    this.modeloForm.controls['sendEmailFinanza'].setValue(this.modelo.sendEmailFinanza);
    this.modeloForm.controls['sendEmailFinanzaPasswordOrigen'].setValue(this.cifrarDataService.decrypt(this.modelo.sendEmailFinanzaPasswordOrigen));
    this.modeloForm.controls['sendEmailFinanzaPort'].setValue(this.modelo.sendEmailFinanzaPort);
    this.modeloForm.controls['sendEmailFinanzaEnabledSSL'].setValue(this.modelo.sendEmailFinanzaEnabledSSL);
    this.modeloForm.controls['sendEmailFinanzaHost'].setValue(this.modelo.sendEmailFinanzaHost);

    this.modeloForm.controls['asuntoFinanza'].setValue(this.modelo.asuntoFinanza);
    this.modeloForm.controls['cuerpoFinanza'].setValue(this.modelo.cuerpoFinanza);
    this.modeloForm.controls['diasPorVencerFinanza'].setValue(this.modelo.diasPorVencerFinanza);
    debugger
    this.modeloForm.controls['horaEnvioFinanza'].setValue( this.utilService.obtenerFechaHora(new Date(),this.modelo.horaEnvioFinanza));

    this.modeloForm.controls['emailGoogleDrive'].setValue(this.modelo.emailGoogleDrive);
    this.modeloForm.controls['emailPassword'].setValue(this.cifrarDataService.decrypt(this.modelo.emailPassword));

    this.goChangeCheckDimension(this.modelo.flgDimensionSAP);
    this.goChangeCheckGoogleDrive(this.modelo.flgGoogleDrive);
  }

  goChangeCheckDimension(event: boolean) {

    if(event) {
      this.modeloForm.controls['dimensionSAP'].enable();
    } else {
      this.modeloForm.controls['dimensionSAP'].disable();
      this.modeloForm.controls['dimensionSAP'].setValue(null);
    }

  }

  goChangeCheckGoogleDrive(event: boolean) {
    if(event) {
      this.modeloForm.controls['emailGoogleDrive'].enable();
      this.modeloForm.controls['emailPassword'].enable();
    } else {
      this.modeloForm.controls['emailGoogleDrive'].disable();
      this.modeloForm.controls['emailPassword'].disable();
      this.modeloForm.controls['emailGoogleDrive'].setValue(null);
      this.modeloForm.controls['emailPassword'].setValue(null);
    }
  }

  onClickSave() {

    debugger

    if (this.modeloForm.controls['flgDimensionSAP'].value) {
      if (this.modeloForm.controls['dimensionSAP'].value === null) {
        this.swaCustomService.swaMsgInfo('SELECCIONAR DIMENSIÓN SAP');
        return;
      }
    }

    this.modelo.tipoAutenticacion = this.modeloForm.controls['tipoAutenticacion'].value.value;
    this.modelo.flgDimensionSAP = this.modeloForm.controls['flgDimensionSAP'].value;
    if (this.modeloForm.controls['flgDimensionSAP'].value) {
      this.modelo.idDimensionSAP = this.modeloForm.controls['dimensionSAP'].value.value;
    } else {
      this.modelo.idDimensionSAP = 0;
    }
    this.modelo.flgGoogleDrive = this.modeloForm.controls['flgGoogleDrive'].value;
    this.modelo.flgDobleAutenticacion = this.modeloForm.controls['flgDobleAutenticacion'].value;

    this.modelo.sendEmail = this.modeloForm.controls['sendEmail'].value;
    this.modelo.sendEmailPasswordOrigen = this.cifrarDataService.encrypt(this.modeloForm.controls['sendEmailPasswordOrigen'].value);
    this.modelo.sendEmailPort = this.modeloForm.controls['sendEmailPort'].value;
    this.modelo.sendEmailEnabledSSL = this.modeloForm.controls['sendEmailEnabledSSL'].value;
    this.modelo.sendEmailHost = this.modeloForm.controls['sendEmailHost'].value;

    this.modelo.sendEmailFinanza = this.modeloForm.controls['sendEmailFinanza'].value;
    this.modelo.sendEmailFinanzaPasswordOrigen = this.cifrarDataService.encrypt(this.modeloForm.controls['sendEmailFinanzaPasswordOrigen'].value);
    this.modelo.sendEmailFinanzaPort = this.modeloForm.controls['sendEmailFinanzaPort'].value;
    this.modelo.sendEmailFinanzaEnabledSSL = this.modeloForm.controls['sendEmailFinanzaEnabledSSL'].value;
    this.modelo.sendEmailFinanzaHost = this.modeloForm.controls['sendEmailFinanzaHost'].value;

    this.modelo.asuntoFinanza = this.modeloForm.controls['asuntoFinanza'].value;
    this.modelo.cuerpoFinanza = this.modeloForm.controls['cuerpoFinanza'].value;
    this.modelo.diasPorVencerFinanza = this.modeloForm.controls['diasPorVencerFinanza'].value;

    if (this.modeloForm.controls['horaEnvioFinanza'].value !== null) {
      this.modelo.horaEnvioFinanza = this.utilService.obtenerHora(this.modeloForm.controls['horaEnvioFinanza'].value);
    }

    this.modelo.emailGoogleDrive = this.modeloForm.controls['emailGoogleDrive'].value;
    this.modelo.emailPassword = this.cifrarDataService.encrypt(this.modeloForm.controls['emailPassword'].value);

    this.subscription$ = new Subscription();
    let observ = new Observable();
    if (this.modelo.idParametrosSistema === 0) {
      observ = this.seguridadService.setInsertParametroSistema(this.modelo);
    } else {
      observ = this.seguridadService.setUpdateParametroSistema(this.modelo);
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
