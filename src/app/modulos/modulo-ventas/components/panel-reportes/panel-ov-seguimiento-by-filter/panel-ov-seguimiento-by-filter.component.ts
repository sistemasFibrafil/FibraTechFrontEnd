import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


import { IOrdersSeguimiento } from '../../../interfaces/sap-business-one/orders.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IGrupoSocioNegocioSap } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/grupo-socio-negocio.interface';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { OrdersService } from '../../../services/sap-business-one/orders.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { GrupoSocionegocioSapService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/grupo-socio-negocio.service';
import { OrdersSeguimientoFindModel } from '../../../models/sap-business-one/orders.model';



interface ITipoDocumento {
  codTipDocumento: string;
  nomTipDocumento: string;
}

interface IStatus {
  codStatus: string;
  nomStatus: string;
}

@Component({
  selector: 'app-ven-panel-ov-seguimiento-by-filter',
  templateUrl: './panel-ov-seguimiento-by-filter.component.html',
  styleUrls: ['./panel-ov-seguimiento-by-filter.component.css'],
})
export class PanelOrdenVentaSeguimientoByFilterComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'OV - Seguimiento';
  subtitulo = 'OV - Seguimiento';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Variaqbles
  columnas: any[];
  isDisplay: boolean = false;
  statusList: SelectItem[];
  statusSelected: IStatus[];
  documentTypeList: SelectItem[];
  salesEmployeeList: SelectItem[];
  businessPartnerGroupSapList: SelectItem[];

  statusItem: IStatus[];
  documentTypeItem: ITipoDocumento[];
  documentTypeSelected: ITipoDocumento[];
  salesEmployeeSelected: ISalesPersons[];
  reporteList: IOrdersSeguimiento[];
  businessPartnerGroupSelected: IGrupoSocioNegocioSap[];

  params: OrdersSeguimientoFindModel = new OrdersSeguimientoFindModel();

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Órdenes de Venta - Seguimiento - ' + this.fecha;

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
    this.onBuildColumn();
    this.getListGrupoAll();
    this.getListEmpleadoVenta();
    this.getListTipoDocumento();
    this.getListStatus();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
        'startDate'               : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'endDate'                 : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'msBusinessPartnerGroup'  : new FormControl('', Validators.compose([Validators.required])),
        'msSalesEmployee'         : new FormControl('', Validators.compose([Validators.required])),
        'msDocumentType'          : new FormControl('', Validators.compose([Validators.required])),
        'msStatus'                : new FormControl('', Validators.compose([Validators.required])),
        'customer'                : new FormControl(''),
    });

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-ov-seguimiento-by-filter');
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'cardCode',        header: 'Código de Cliente' },
      { field: 'cardName',        header: 'Nombre de Cliente' },
      { field: 'nomTipDocumento', header: 'Tipo de Documento' },
      { field: 'numeroDocumento', header: 'Número de Documento' },
      { field: 'docDate',         header: 'Fecha de Contabilización' },
      { field: 'taxDate',         header: 'Fecha de Emisión' },
      { field: 'docDueDate',      header: 'Fecha de Entrega' },
      { field: 'nomStatus',       header: 'Estado' },
      { field: 'slpName',         header: 'Vendedor' },
      { field: 'docTotalSy',      header: 'Total USD' },
    ];
  }

  getListGrupoAll() {
    const param: any = { groupType: 'C' };
    this.grupoSocionegocioSapService.getListByGroupType(param)
    .subscribe({next:(data: IGrupoSocioNegocioSap[]) =>{
        this.businessPartnerGroupSapList = [];
        this.businessPartnerGroupSelected = [];

        for (let item of data) {
          this.businessPartnerGroupSelected.push({ groupCode: item.groupCode, groupName: item.groupName });
          this.businessPartnerGroupSapList.push({ label: item.groupName, value: { groupCode: item.groupCode, groupName: item.groupName } });
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
        this.salesEmployeeList = [];
        this.salesEmployeeSelected = [];

        for (let item of data) {
          this.salesEmployeeSelected.push({ slpCode: item.slpCode, slpName: item.slpName });
          this.salesEmployeeList.push({ label: item.slpName, value: { slpCode: item.slpCode, slpName: item.slpName } });
        }
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListTipoDocumento()
  {
    this.documentTypeItem =
    [
      { codTipDocumento: '01', nomTipDocumento: 'Órden de Venta' },
      { codTipDocumento: '02', nomTipDocumento: 'Factura de Reserva' },
    ];

    this.documentTypeList = [];
    this.documentTypeSelected = [];

    for (let item of this.documentTypeItem) {
      this.documentTypeSelected.push({ codTipDocumento: item.codTipDocumento, nomTipDocumento: item.nomTipDocumento });
      this.documentTypeList.push({ label: item.nomTipDocumento, value: { codTipDocumento: item.codTipDocumento, nomTipDocumento: item.nomTipDocumento } });
    }
  }

  getListStatus()
  {
    this.statusItem =
    [
      { codStatus: '01', nomStatus: 'Pendiente' },
      { codStatus: '02', nomStatus: 'Cerrado' },
    ];

    this.statusList = [];
    this.statusSelected = [];

    for (let item of this.statusItem) {
      this.statusSelected.push({ codStatus: item.codStatus, nomStatus: item.nomStatus });
      this.statusList.push({ label: item.nomStatus, value: { codStatus: item.codStatus, nomStatus: item.nomStatus } });
    }
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    this.params.businessPartnerGroup = this.businessPartnerGroupSelected.map(x=> x.groupCode).join(",");
    this.params.salesEmployee = this.salesEmployeeSelected.map(x=> x.slpCode).join(",");
    this.params.documentType = this.documentTypeSelected.map(x=> x.codTipDocumento).join(",");
    this.params.status = this.statusSelected.map(x=> x.codStatus).join(",");
  }

  onListar() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ordersService.getListSeguimientoByFilter(this.params)
    .subscribe({ next: (resp: IOrdersSeguimiento[])=>{
        this.isDisplay = false;
        this.reporteList = resp;
      },
      error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ordersService.getSeguimientoByFilterExcel(this.params)
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
