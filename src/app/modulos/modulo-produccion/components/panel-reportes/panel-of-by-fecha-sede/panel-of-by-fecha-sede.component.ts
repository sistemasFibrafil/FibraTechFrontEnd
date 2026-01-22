import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IOrdenFabricacionBySede } from '../../../interfaces/ordenFabricacion.interface';
import { OrdenFabricacionService } from '../../../services/orden-fabricacion-sap.service';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ILocation } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/location.interface';
import { LocationService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/location.service';


@Component({
  selector: 'app-pro-panel-of-by-fecha-sede',
  templateUrl: './panel-of-by-fecha-sede.component.html',
  styleUrls: ['./panel-of-by-fecha-sede.component.css']
})
export class PanelOrdenFabricacionByFechaSedeComponent implements OnInit, OnDestroy {
  modeloForm: FormGroup;
  subscription: Subscription;

  // Titulo del componente
  titulo = 'Órdenes de Fabricación';
  subtitulo = 'Órdenes de Fabricación';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;

  sedeSapList: SelectItem[];
  sedeSapSelected: ILocation[];
  reporteList: IOrdenFabricacionBySede[];

  params: FilterRequestModel = new FilterRequestModel();

  columnas: any[];

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Órdenes de Fabricacion -' + this.fecha;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private locationService: LocationService,
    private ordenFabricacionService: OrdenFabricacionService) {}

  ngOnInit() {

    this.modeloForm = this.fb.group(
      {
        'dat1': new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'dat2': new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'msSedeSap' : new FormControl('', Validators.compose([Validators.required])),
      }
    );

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-pro-panel-of-by-fecha-sede');

    this.columnas = [
      { header: 'N° Producción' },
      { header: 'Código Artículo' },
      { header: 'Artículo' },
      { header: 'Código de Barra' },
      { header: 'Cantidad Planificada' },
      { header: 'Unidad Medida' },
      { header: 'Bultos Procesados' },
      { header: 'Pesos Procesados' },
      { header: 'Fecha' },
      { header: 'Máquina' },
    ];

    this.getListSede();
    //if(!this.buttonAcces.btnBuscar){this.onListar();}
  }

  getListSede() {
    this.subscription = new Subscription();
    this.subscription = this.locationService.getList()
    .subscribe((data: ILocation[]) => {
      this.sedeSapList = [];
      this.sedeSapSelected = [];
      for (let item of data) {
        this.sedeSapSelected.push({ code: item.code, location: item.location });
        this.sedeSapList.push({ label: item.location, value: { code: item.code, location: item.location } });
      }

    });
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    this.params.cod1 = this.sedeSapSelected.map(x=> x.code).join(",");
  }

  onListar() {
    this.isDisplay = true;
    this.onSetParametro();
    this.subscription = new Subscription();
    this.subscription = this.ordenFabricacionService.getListBySede(this.params)
    .subscribe((resp: IOrdenFabricacionBySede[]) => {
      if (resp) {
        this.isDisplay = false;
        this.reporteList = resp;
        }
        this.isDisplay = false;
      },
      (error) => {
        this.reporteList = [];
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      }
    );
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.subscription = new Subscription();
    this.subscription = this.ordenFabricacionService.getListExcelBySede(this.params)
    .subscribe((response: any) => {
      saveAs(
        new Blob([response],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        this.nombreArchivo
      );
      this.isDisplay = false;
      this.swaCustomService.swaMsgExito(null);
    },
    (error) => {
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    });
  }


  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
