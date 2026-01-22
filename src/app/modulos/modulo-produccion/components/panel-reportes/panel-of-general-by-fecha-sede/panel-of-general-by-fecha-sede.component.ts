import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IOrdenFabricacionGeneralBySede } from '../../../interfaces/ordenFabricacion.interface';
import { OrdenFabricacionService } from '../../../services/orden-fabricacion-sap.service';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ILocation } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/location.interface';
import { LocationService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/location.service';



@Component({
  selector: 'app-pro-panel-of-general-by-fecha-sede',
  templateUrl: './panel-of-general-by-fecha-sede.component.html',
  styleUrls: ['./panel-of-general-by-fecha-sede.component.css']
})
export class PanelOrdenFabricacionGeneralByFechaSedeComponent implements OnInit, OnDestroy {
  modeloForm: FormGroup;
  subscription: Subscription;

  // Titulo del componente
  titulo = 'Órdenes de Fabricación General';
  subtitulo = 'Órdenes de Fabricación General';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;

  sedeList: SelectItem[];
  sedeSelected: ILocation[];
  reporteList: IOrdenFabricacionGeneralBySede[];

  params: FilterRequestModel = new FilterRequestModel();

  columnas: any[];

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Órdenes de Fabricación General -' + this.fecha;

  constructor(
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
        'msSede' : new FormControl('', Validators.compose([Validators.required])),
      }
    );

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-pro-panel-of-general-by-fecha-sede');

    this.columnas = [
      { header: 'Número SAP' },
      { header: 'Fecha Orden Fabricación' },
      { header: 'Fecha Fin' },
      { header: 'Fecha Sistema' },
      { header: 'Tipo' },
      { header: 'Estado' },
      { header: 'Item Prod' },
      { header: 'Des Item Prod' },
      { header: 'Almacén' },
      { header: 'UM' },
      { header: 'Cantidad Prod' },
      { header: 'Pesos Prod' },
      { header: 'Sede' },
    ];

    this.getListSede();
    //if(!this.buttonAcces.btnBuscar){this.onListar();}
  }

  onToBuscar() {
    this.onListar();
  }

  getListSede() {
    this.subscription = new Subscription();
    this.subscription = this.locationService.getList()
    .subscribe((data: ILocation[]) => {
      this.sedeList = [];
      this.sedeSelected = [];
      for (let item of data) {
        this.sedeSelected.push({ code: item.code, location: item.location });
        this.sedeList.push({ label: item.location, value: { code: item.code, location: item.location } });
      }

    });
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    this.params.cod1 = this.sedeSelected.map(x=> x.code).join(",");
  }

  onListar() {
    this.isDisplay = true;
    this.onSetParametro();
    this.subscription = new Subscription();
    this.subscription = this.ordenFabricacionService.getListGeneralBySede(this.params)
    .subscribe((resp: IOrdenFabricacionGeneralBySede[]) => {
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
    this.subscription = this.ordenFabricacionService.getGeneralExcelBySede(this.params)
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
