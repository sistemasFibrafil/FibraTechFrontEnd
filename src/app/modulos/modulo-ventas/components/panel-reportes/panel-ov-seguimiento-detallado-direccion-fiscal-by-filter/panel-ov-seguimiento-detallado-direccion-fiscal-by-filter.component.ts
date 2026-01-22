import swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IMes } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/mes.interface';
import { IAnio } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/anio.interface';
import { ISemana } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/semana.interface';
import { IGrupoSocioNegocioSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/socio-negocios/grupo-socio-negocio.interface';
import { IOrdenVentaSeguimientoDetallado } from '../../../interfaces/sap/orden-venta.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { TiempoService } from 'src/app/modulos/modulo-gestion/services/web/definiciones/general/tiempo.service';
import { OrdenVentaService } from '../../../services/sap/orden-venta.service';
import { GrupoSocionegocioSapService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/socio-negocios/grupo-socio-negocio.service';
import { SopCreateModel } from '../../../models/web/sop.model';
import { UserContextService } from 'src/app/services/user-context.service';
import { SopService } from '../../../services/web/sop.service';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/sales-persons.interface';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { OrdenVentaSeguimientoFindModel } from '../../../models/sap/orden-venta.model';


interface ITipoDocumento {
  codTipDocumento: string;
  nomTipDocumento: string;
}

interface IStatus {
  codStatus: string;
  nomStatus: string;
}

@Component({
  selector: 'app-ven-panel-ov-seguimiento-detallado-direccion-fiscal-by-filter',
  templateUrl: './panel-ov-seguimiento-detallado-direccion-fiscal-by-filter.component.html',
  styleUrls: ['./panel-ov-seguimiento-detallado-direccion-fiscal-by-filter.component.css']
})
export class PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent implements OnInit {
  modeloForm: FormGroup;
  modeloFormSop: FormGroup;

  // Titulo del componente
  titulo = 'OV - Seguimiento Detallado - Dirección Fiscal';
  subtitulo = 'OV - Seguimiento Detallado - Dirección Fiscal';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: boolean = false;
  isSaving: boolean = false;

  opciones: any = [];
  statusList: SelectItem[];
  statusSelected: IStatus[];
  documentTypeList: SelectItem[];
  salesEmployeeList: SelectItem[];
  businessPartnerGroupSapList: SelectItem[];

  statusItem: IStatus[];
  documentTypeItem: ITipoDocumento[];
  documentTypeSelected: ITipoDocumento[];
  salesEmployeeSelected: ISalesPersons[];
  businessPartnerGroupSelected: IGrupoSocioNegocioSap[];
  reporteList: IOrdenVentaSeguimientoDetallado[];

  modeloSave: SopCreateModel = new SopCreateModel();
  paramsSop: FilterRequestModel = new FilterRequestModel();
  params: OrdenVentaSeguimientoFindModel = new OrdenVentaSeguimientoFindModel();

  // Modal
  isVisualizar: boolean = false;
  listAnio: SelectItem[];
  listMes: SelectItem[];
  listSemana: SelectItem[];

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Órdenes de Venta - Seguimiento Detallado - ' + this.fecha;

  constructor
  (
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private userContextService: UserContextService,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private sopService: SopService,
    private tiempoService: TiempoService,
    private OrdenVentaService: OrdenVentaService,
    private salesPersonsService: SalesPersonsService,
    private grupoSocionegocioSapService: GrupoSocionegocioSapService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.opcionesTabla();
    this.getListGrupoAll();
    this.getListEmpleadoVenta();
    this.getTipoDocumento();
    this.getListStatus();
    this.getListAnio();
    this.getListMes();
    this.getListSemana();
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
        'item'                    : new FormControl(''),
    });

    this.modeloFormSop = this.fb.group(
    {
        'year'              : new FormControl('', Validators.compose([Validators.required])),
        'month'             : new FormControl('', Validators.compose([Validators.required])),
        'week'              : new FormControl('', Validators.compose([Validators.required])),
        'name'              : new FormControl('', Validators.compose([Validators.required])),
        'comments'          : new FormControl(''),
    });

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-ov-seguimiento-detallado-direccion-fiscal-by-filter');
  }

  onBuildFormModal() {
    this.modeloFormSop = this.fb.group(
    {
        'year'              : new FormControl('', Validators.compose([Validators.required])),
        'month'             : new FormControl('', Validators.compose([Validators.required])),
        'week'              : new FormControl('', Validators.compose([Validators.required])),
        'name'              : new FormControl('', Validators.compose([Validators.required])),
        'comments'          : new FormControl(''),
    });
  }

  opcionesTabla() {
    this.opciones = [
      { label: 'S&OP',    icon: 'pi pi-chart-line',           command: () => { this.onClickCopyModal() } },
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

  getTipoDocumento()
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

  onClickBuscar() {
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
    this.OrdenVentaService.getListSeguimientoDetalladoDireccionFiscalByFilter(this.params)
    .subscribe({ next: (resp: IOrdenVentaSeguimientoDetallado[])=>{
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
    this.OrdenVentaService.getSeguimientoDetalladoDireccionFiscalByFilterExcel(this.params)
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

  onClickCopyModal()
  {
    this.isVisualizar = !this.isVisualizar;
  }

  //#region <<< S&OP >>>
  getListAnio() {
    this.listAnio = [];
    this.tiempoService.getListAnio()
    .subscribe({next:(data: IAnio[]) =>{
        this.listAnio = [];
        for (let item of data) {
          this.listAnio.push({ label: item.nomAnio, value: item.codAnio });
        }

        const anioActual = new Date().getFullYear();
        const item: any = this.listAnio.find(x => x.value === anioActual);
        this.modeloFormSop.controls['year'].setValue({ label: item.label, value: item.value });

        this.getListSemana();
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListMes() {
    this.listMes = [];
    this.tiempoService.getListMes()
    .subscribe({next:(data: IMes[]) =>{
        this.listMes = [];
        for (let item of data) {
          this.listMes.push({ label: item.nomMes, value: item.codMes });
        }

        const mesActual=new Date().getMonth() + 1;
        const item: any = this.listMes.find(x => x.value === mesActual);
        this.modeloFormSop.controls['month'].setValue({ label: item.label, value: item.value });

        this.getListSemana();
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onSetParametroSop()
  {
    let codAnio: number = 0;
    let codMes: number = 0;

    this.paramsSop = this.modeloFormSop.getRawValue();

    if (this.modeloFormSop.controls['year'].value) {
      let itemAnio = this.modeloFormSop.controls['year'].value;
      codAnio = itemAnio.value;
    }

    if (this.modeloFormSop.controls['month'].value) {
      let itemMes = this.modeloFormSop.controls['month'].value;
      codMes = itemMes.value;
    }

    this.paramsSop.id1 = codAnio;
    this.paramsSop.id2 = codMes;
  }

  getListSemana() {
    this.listSemana = [];
    this.onSetParametroSop();

    if(this.paramsSop.id1 === 0 || this.paramsSop.id2 === 0)
    {
      return;
    }

    this.tiempoService.getListSemana(this.paramsSop)
    .subscribe({next:(data: ISemana[]) =>{
        this.listSemana = [];
        for (let item of data) {
          this.listSemana.push({ label: item.nomSemana, value: item.codSemana });
        }
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  copySop()
  {
    this.isSaving = true;
    let codYear   : number = 0;
    let coMonth   : number = 0;
    let codMeek   : number = 0;

    if (this.modeloFormSop.controls['year'].value) {
      let itemYear = this.modeloFormSop.controls['year'].value;
      codYear = itemYear.value;
    }
    if (this.modeloFormSop.controls['month'].value) {
      let itemMonth = this.modeloFormSop.controls['month'].value;
      coMonth = itemMonth.value;
    }
    if (this.modeloFormSop.controls['week'].value) {
      let itemWeek = this.modeloFormSop.controls['week'].value;
      codMeek = itemWeek.value;
    }

    this.modeloSave.codYear         = codYear;
    this.modeloSave.codMonth        = coMonth;
    this.modeloSave.codWeek         = codMeek;
    this.modeloSave.name            = this.modeloFormSop.controls['name'].value;
    this.modeloSave.comments        = this.modeloFormSop.controls['comments'].value;
    this.modeloSave.idUsuarioCreate = this.userContextService.getIdUsuario();

    this.modeloSave.linea = [];

    for (let index = 0; index < this.reporteList.length; index++) {
      this.modeloSave.linea.push
      ({
        docEntry            : this.reporteList[index].docEntry,
        lineNum             : this.reporteList[index].lineNum,
        docNum              : this.reporteList[index].numeroDocumento,
        docDate             : this.reporteList[index].docDate,
        codTipDocumento     : this.reporteList[index].codTipDocumento,
        nomTipDocumento     : this.reporteList[index].nomTipDocumento,
        cardCode            : this.reporteList[index].cardCode,
        cardName            : this.reporteList[index].cardName,
        codOriCliente       : this.reporteList[index].codOriCliente,
        nomOriCliente       : this.reporteList[index].nomOriCliente,
        slpCode             : this.reporteList[index].slpCode,
        slpName             : this.reporteList[index].slpName,
        itemCode            : this.reporteList[index].itemCode,
        itemName            : this.reporteList[index].itemName,
        codLinNegocio       : this.reporteList[index].codLinNegocio,
        nomLinNegocio       : this.reporteList[index].nomLinNegocio,
        codGpoArticulo      : this.reporteList[index].codGpoArticulo,
        nomGpoArticulo      : this.reporteList[index].nomGpoArticulo,
        salUnitMsr          : this.reporteList[index].salUnitMsr,
        stock               : this.reporteList[index].stockProduccion,
        qtyEarring          : this.reporteList[index].openQty,
        pesoPromedioKg      : this.reporteList[index].pesoPromedioKg,
        kgEarring           : this.reporteList[index].kgPendiente,
        price               : this.reporteList[index].price,
        lineTotEarring      : this.reporteList[index].lineTotEarring,
        codConPago          : this.reporteList[index].codConPago,
        nomConPago          : this.reporteList[index].nomConPago,
        idUsuarioCreate     : this.userContextService.getIdUsuario()
      });
    }

    this.sopService.setCreate(this.modeloSave)
    .subscribe({ next: (data:any)=>{
        this.isSaving = false;
        this.swaMsgExito(null);
        this.onClear();
        this.onBuildFormModal();
        this.getListAnio();
        this.getListMes();
        this.getListSemana();
      },
      error:(e)=>{
        this.isSaving = false;
        let msg = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
        msg.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  onClickCopySop()
  {
    this.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.copySop();
      }
    });
  }

  swaMsgExito(msgExitoDetail: string){
    let msg = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
    return msg.fire(
      this.globalConstants.msgExitoSummary,
      msgExitoDetail === null || msgExitoDetail === undefined || msgExitoDetail === '' ? this.globalConstants.msgExitoDetail :  msgExitoDetail,
      this.globalConstants.icoSwalSuccess
    );
  }

  swaConfirmation(title: string, text: string, icon: any) {
    let msg = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });

    return msg.fire({
      title: title,
      html: text,
      icon: icon,
      showConfirmButton: true,
      confirmButtonText: this.globalConstants.confirmButtonText,
      confirmButtonColor: '#3085d6',
      showCancelButton: true,
      cancelButtonText: this.globalConstants.cancelButtonText,
      cancelButtonColor: '#d33000',
    });
  }

  onClear()
  {
    this.modeloFormSop.patchValue({
      'year'      : '',
      'month'     : '',
      'week'      : '',
      'name'      : '',
      'comments'  : '',
    });

    this.getListAnio();
    this.getListMes();
    this.getListSemana();
  }

  onHide()
  {
    this.onClear();
  }

  onClickCloseSop()
  {
    this.onClear();
    this.isVisualizar = !this.isVisualizar;
  }
  //#endregion
}
