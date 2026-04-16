import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { OrdenMantenimientoWebService } from '../../../services/ordenMantenimientoWeb.service';
import { OrdenMantenimientoWebFindByFechaAndIdEstadoModel } from '../../../models/ordenMantenimientoWeb.model';
import { IOrdenMantenimientoWeb } from '../../../interfaces/ordenMantenimientoWeb.interface';
import { IEstadoOrdenMantenimientoWeb } from '../../../interfaces/estadoOrdenMantenimientoWeb.interface';


@Component({
  selector: 'app-om-web-list',
  templateUrl: './om-web-list.component.html',
  styleUrls: ['./om-web-list.component.css']
})
export class OrdenMantenimientoWebListComponent implements OnInit, OnDestroy {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'Órdenes de Mantenimiento';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;
  isDisplayVisor: boolean = false;
  isDisplayGenerandoVisor: boolean = false;

  isDataBlob: Blob;

  estadoList: SelectItem[];
  estadoDataList: IEstadoOrdenMantenimientoWeb[];
  estadoSelected: IEstadoOrdenMantenimientoWeb[];


  lista: IOrdenMantenimientoWeb[];
  findModel: OrdenMantenimientoWebFindByFechaAndIdEstadoModel = new OrdenMantenimientoWebFindByFechaAndIdEstadoModel();

  columnas: any[];

  subscription: Subscription;

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Orden de mantenimiento -';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private ordenMantenimientoWebService: OrdenMantenimientoWebService) {}

  ngOnInit() {

    this.modeloForm = this.fb.group(
      {
        'fecInicial': new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'fecFinal': new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'msEstadoSap' : new FormControl('', Validators.compose([Validators.required])),
        'numero': new FormControl(''),
      }
    );

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-om-web-list');

    this.columnas = [
      { header: 'Número' },
      { header: 'Fecha Inicio' },
      { header: 'Fecha Fin' },
      { header: 'Hora Inicio' },
      { header: 'Hora Fin' },
      { header: 'Servicio' },
      { header: 'Área' },
      { header: 'Máquina' },
      { header: 'Técnico' },
      { header: 'Estado' },
    ];

    this.getListEstado();
  }

  getListEstado() {
    this.estadoDataList =
    [
      { codEstado: '01', nomEstado: 'Pendiente' },
      { codEstado: '02', nomEstado: 'Aprobado' },
      { codEstado: '03', nomEstado: 'Rechazado' },
    ];

    this.estadoList = [];
    this.estadoSelected = [];
    for (let item of this.estadoDataList) {
      this.estadoSelected.push({ codEstado: item.codEstado, nomEstado: item.nomEstado });
      this.estadoList.push({ label: item.nomEstado, value: { idEstado: item.codEstado, nomEstado: item.nomEstado } });
    }
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.findModel = this.modeloForm.getRawValue();

    var estado = this.estadoSelected.map(x=> x.codEstado).join(",");
    this.findModel.idEstado = estado;
  }

  onListar() {
    this.isDisplay = true;
    this.onSetParametro();
    this.subscription = new Subscription();
    this.subscription = this.ordenMantenimientoWebService.getListByFechaAndIdEstadoAndNumero(this.findModel)
    .subscribe((resp: IOrdenMantenimientoWeb[]) => {
      if (resp) {
        this.isDisplay = false;
        this.lista = resp;
        }
      },
      (error) => {
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      }
    );
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.subscription = new Subscription();
    this.subscription = this.ordenMantenimientoWebService.getExcelByFechaAndIdEstadoAndNumero(this.findModel)
    .subscribe((response: any) => {
      saveAs(
        new Blob([response],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        this.nombreArchivo + this.fecha
      );
      this.isDisplay = false;
      this.swaCustomService.swaMsgExito(null);
    },
    (error) => {
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    });
  }

  onToCreate(){
    this.router.navigate(['/main/modulo-pr/orden- mantenimiento-create']);
  }

  onToRowSelectAprobar(modelo: IOrdenMantenimientoWeb) {
  }

  onToRowSelectPrint(modelo: IOrdenMantenimientoWeb) {
    this.isDisplayGenerandoVisor = true;
    this.subscription = new Subscription();
    this.subscription  = this.ordenMantenimientoWebService.getPdfByIdOrdenMantenimiento(modelo.idOrdenMantenimiento)
    .subscribe((resp: any) =>  {
      switch (resp.type) {
        case HttpEventType.DownloadProgress:
          break;
        case HttpEventType.Response:
          this.isDataBlob = new Blob([resp.body], {type: resp.body.type});
          this.isDisplayGenerandoVisor = false;
          this.isDisplayVisor = true;
          break;
      }
    },
      (error) => {
        this.isDisplayGenerandoVisor = false;
        this.isDisplayVisor = false;
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
