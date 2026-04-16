import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { SopCreateModel } from '../../../models/web/sop.model';
import { FilterRequestModel } from 'src/app/models/filter-request.model';

import { IOrdersSeguimientoDetallado } from '../../../interfaces/sap-business-one/orders.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IGrupoSocioNegocioSap } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/grupo-socio-negocio.interface';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { OrdersService } from '../../../services/sap-business-one/orders.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { GrupoSocionegocioSapService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/grupo-socio-negocio.service';


@Component({
  selector: 'app-ven-panel-ov-preliminar-by-fecha',
  templateUrl: './panel-ov-preliminar-by-fecha.component.html',
  styleUrls: ['./panel-ov-preliminar-by-fecha.component.css']
})
export class PanelOrdenVentaPreliminarByFechaComponent implements OnInit {
  modeloForm: FormGroup;
  modeloFormSop: FormGroup;

  // Titulo del componente
  titulo = 'Órdenes de Venta - Preliminar';
  subtitulo = 'Órdenes de Venta - Preliminar';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: boolean = false;
  isSaving: boolean = false;

  opciones: any = [];
  statusList: SelectItem[];
  u_BPP_MDTDList: SelectItem[];
  empleadoVentaList: SelectItem[];
  grupoClienteSapList: SelectItem[];

  empleadoVentaSelected: ISalesPersons[];
  grupoClienteSelected: IGrupoSocioNegocioSap[];
  reporteList: IOrdersSeguimientoDetallado[];

  modeloSave: SopCreateModel = new SopCreateModel();
  params: FilterRequestModel = new FilterRequestModel();
  paramsSop: FilterRequestModel = new FilterRequestModel();

  // Modal
  isVisualizar: boolean = false;
  listAnio: SelectItem[];
  listMes: SelectItem[];
  listSemana: SelectItem[];

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Órdenes de Venta - Preliminar - ' + this.fecha;

  constructor
  (
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly ordersService: OrdersService,
    private salesPersonsService: SalesPersonsService,
    private grupoSocionegocioSapService: GrupoSocionegocioSapService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.getListGrupoAll();
    this.getListEmpleadoVenta();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
        'dat1'                : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'dat2'                : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'msGrupoCliente'      : new FormControl('', Validators.compose([Validators.required])),
        'msEmpleadoVentaSap'  : new FormControl('', Validators.compose([Validators.required])),
        'text1'               : new FormControl(''),
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-ov-preliminar-by-fecha');
  }

  getListGrupoAll() {
    const param: any = { groupType: 'C' };
    this.grupoSocionegocioSapService.getListByGroupType(param)
    .subscribe({next:(data: IGrupoSocioNegocioSap[]) =>{
        this.grupoClienteSapList = [];
        this.grupoClienteSelected = [];

        for (let item of data) {
          this.grupoClienteSelected.push({ groupCode: item.groupCode, groupName: item.groupName });
          this.grupoClienteSapList.push({ label: item.groupName, value: { groupCode: item.groupCode, groupName: item.groupName } });
        }
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListEmpleadoVenta() {
    this.salesPersonsService.getList()
    .subscribe({next:(data: ISalesPersons[]) =>{
        this.empleadoVentaList = [];
        this.empleadoVentaSelected = [];

        for (let item of data) {
          this.empleadoVentaSelected.push({ slpCode: item.slpCode, slpName: item.slpName });
          this.empleadoVentaList.push({ label: item.slpName, value: { slpCode: item.slpCode, slpName: item.slpName } });
        }
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    this.params.cod1 = this.grupoClienteSelected.map(x=> x.groupCode).join(",");
    this.params.cod2 = this.empleadoVentaSelected.map(x=> x.slpCode).join(",");
  }

  onListar() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ordersService.getListOrdenVentaPreliminarPendienteByFecha(this.params)
    .subscribe({ next: (resp: IOrdersSeguimientoDetallado[])=>{
        this.isDisplay = false;
        this.reporteList = resp;
      },
      error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ordersService.getListOrdenVentaPreliminarPendienteExcelByFecha(this.params)
    .subscribe({next:(response: any) => {
        saveAs(
          new Blob([response],
          {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          this.nombreArchivo
        );
        this.isDisplay = false;
        this.swaCustomService.swaMsgExito(null);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }
}
