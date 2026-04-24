import swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, forkJoin, of, Subject, takeUntil } from 'rxjs';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SopCreateModel } from '../../../models/web/sop.model';
import { FilterRequestModel } from 'src/app/models/filter-request.model';

import { TableColumn } from 'src/app/interface/common-ui.interface';
import { IOrdersSeguimientoDetallado } from '../../../interfaces/sap-business-one/orders.interface';
import { IMes } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/mes.interface';
import { IAnio } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/anio.interface';
import { ISemana } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/semana.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IGrupoSocioNegocioSap } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/grupo-socio-negocio.interface';

import { UtilService } from 'src/app/services/util.service';
import { SopService } from '../../../services/web/sop.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { OrdersService } from '../../../services/sap-business-one/orders.service';
import { TiempoService } from 'src/app/modulos/modulo-gestion/services/web/definiciones/general/tiempo.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { GrupoSocionegocioSapService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/grupo-socio-negocio.service';

interface ITipoDocumento {
  codTipDocumento: string;
  nomTipDocumento: string;
}

interface IStatus {
  codStatus: string;
  nomStatus: string;
}

@Component({
  selector: 'app-ven-panel-ov-detallado-direccion-fiscal',
  templateUrl: './panel-ov-detallado-direccion-fiscal.component.html',
  styleUrls: ['./panel-ov-detallado-direccion-fiscal.component.css']
})
export class PanelOrdenVentaDetalladoDirecionFiscalComponent implements OnInit {
  private readonly destroy$                     = new Subject<void>();

  modeloForm                    : FormGroup;
  modeloFormSop                 : FormGroup;
  // Titulo del componente
  titulo                        = 'OV - Seguimiento Detallado - Dirección Fiscal';
  subtitulo                     = 'OV - Seguimiento Detallado - Dirección Fiscal';

  // Acceso de botones
  buttonAcces                   : ButtonAcces = new ButtonAcces();
  globalConstants               : GlobalsConstantsForm = new GlobalsConstantsForm();

  isSaving                      : boolean = false;
  isDisplay                     : boolean = false;
  isVisualizar                  : boolean = false;

  opciones                      : any = [];

  listMes                       : SelectItem[];
  listAnio                      : SelectItem[];
  statusList                    : SelectItem[];
  listSemana                    : SelectItem[];
  documentTypeList              : SelectItem[];
  salesEmployeeList             : SelectItem[];
  businessPartnerGroupSapList   : SelectItem[];

  modelo                        : IOrdersSeguimientoDetallado[];
  statusItem                    : IStatus[];
  statusSelected                : IStatus[];
  documentTypeItem              : ITipoDocumento[];
  documentTypeSelected          : ITipoDocumento[];
  salesEmployeeSelected         : ISalesPersons[];
  businessPartnerGroupSelected  : IGrupoSocioNegocioSap[];

  readonly nombreArchivo        = `Órdenes de Venta - Seguimiento Detallado - ${this.utilService.fecha_DD_MM_YYYY()}`;

  columnas                      : TableColumn[] = [];

  rows                          = 20;
  rowsPerPageOptions            = [20, 40, 60, 80, 100];

  constructor
  (
    private readonly fb: FormBuilder,
    private readonly datePipe: DatePipe,
    private readonly sopService: SopService,
    private readonly tiempoService: TiempoService,
    private readonly ordersService: OrdersService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly grupoSocionegocioSapService: GrupoSocionegocioSapService,
    public  readonly utilService: UtilService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    this.loadAllCombos();
    this.getListAnio();
    this.getListMes();
    this.getListSemana();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBuildForm() {
    const today = new Date();

    this.modeloForm = this.fb.group({
      startDate               : [today, Validators.required],
      endDate                 : [today, Validators.required],
      msBusinessPartnerGroup  : ['', Validators.required],
      msSalesEmployee         : ['', Validators.required],
      msDocumentType          : ['', Validators.required],
      msStatus                : ['', Validators.required],
      customer                : [''],
      item                    : [''],
    });

    this.modeloFormSop = this.fb.group({
      year                    : ['', Validators.required],
      month                   : ['', Validators.required],
      week                    : ['', Validators.required],
      name                    : ['', Validators.required],
      comments                : [''],
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-ov-detallado-direccion-fiscal');
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'cardCode',                header: 'Código de Cliente' },
      { field: 'cardName',                header: 'Nombre de Cliente' },
      { field: 'nomTipDocumento',         header: 'Tipo de Documento' },
      { field: 'numeroDocumento',         header: 'Número de Documento' },
      { field: 'numeroPedido',            header: 'Número de Pedido' },
      { field: 'numeroFactura',           header: 'Número de Factura' },
      { field: 'docDate',                 header: 'Fecha de Contabilización' },
      { field: 'taxDate',                 header: 'Fecha de Emisión' },
      { field: 'docDueDate',              header: 'Fecha de Entrega' },
      { field: 'nomStatus',               header: 'Estado' },
      { field: 'slpName',                 header: 'Vendedor' },
      { field: 'itemCode',                header: 'Código de Artículo' },
      { field: 'itemName',                header: 'Nombre de Artículo' },
      { field: 'whsName',                 header: 'Almacén' },
      { field: 'salUnitMsr',              header: 'UM de Venta' },
      { field: 'stockProduccion',         header: 'Stock' },
      { field: 'pendienteProduccion',     header: 'Pendiente' },
      { field: 'solicitadoProduccion',    header: 'Solicitado' },
      { field: 'disponibleProduccion',    header: 'Disponible' },
      { field: 'quantity',                header: 'Cantidad' },
      { field: 'rolloPedido',             header: 'Rol Pedido' },
      { field: 'kgPedido',                header: 'Kg Pedido' },
      { field: 'toneladaPedida',          header: 'Tn Pedida' },
      { field: 'openQty',                 header: 'Cantidad Pendiente Por Despachar' },
      { field: 'rolloPendiente',          header: 'Rol Pendiente' },
      { field: 'kgPendiente',             header: 'Kg Pendiente' },
      { field: 'toneladaPendiente',       header: 'Tn Pendiente' },
      { field: 'delivrdQty',              header: 'Cantidad Despachada' },
      { field: 'price',                   header: 'Precio' },
      { field: 'totalSumSy',              header: 'Importe USD' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { label: 'S&OP',    icon: 'pi pi-chart-line',           command: () => { this.onClickCopyModal() } },
    ];
  }

  private loadAllCombos(): void {
    const param = { groupType: 'C' };

    // 🔹 Spinner
    this.isDisplay = true;

    // 🔹 Datos locales (igual que docTypes en tu ejemplo)
    const documentData = [
      { codTipDocumento: '01', nomTipDocumento: 'Órden de Venta' },
      { codTipDocumento: '02', nomTipDocumento: 'Factura de Reserva' },
    ];

    const statusData = [
      { codStatus: '01', nomStatus: 'Pendiente' },
      { codStatus: '02', nomStatus: 'Cerrado' },
    ];

    // 👉 Transformación local inmediata
    this.documentTypeList = documentData.map(item => ({
      label: item.nomTipDocumento,
      value: item
    }));

    this.statusList = statusData.map(item => ({
      label: item.nomStatus,
      value: item
    }));

    // 🔹 forkJoin SOLO servicios (igual que tu base)
    forkJoin({
      grupos: this.grupoSocionegocioSapService.getListByGroupType(param)
        .pipe(catchError(() => of([]))),

      vendedores: this.salesPersonsService.getList()
        .pipe(catchError(() => of([])))
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {

        // 🔹 Transformaciones (igual que tu ejemplo base)
        this.businessPartnerGroupSapList = (res.grupos || []).map(item => ({
          label: item.groupName,
          value: item
        }));

        this.salesEmployeeList = (res.vendedores || []).map(item => ({
          label: item.slpName,
          value: item
        }));

        // 🔥 Patch único (igual que loadAllCombos)
        this.modeloForm.patchValue({
          msBusinessPartnerGroup: res.grupos,
          msSalesEmployee: res.vendedores,
          msDocumentType: documentData,
          msStatus: statusData
        }, { emitEvent: false });
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  onClickBuscar() {
    this.loadData();
  }

  buildFilterParams(): any {
    const {
      startDate,
      endDate,
      msBusinessPartnerGroup,
      msSalesEmployee,
      msDocumentType,
      msStatus,
      customer,
      item
    } = this.modeloForm.getRawValue();

    return {
      startDate,
      endDate,
      businessPartnerGroup: this.utilService.mapJoin(msBusinessPartnerGroup, 'groupCode'),
      salesEmployee: this.utilService.mapJoin(msSalesEmployee, 'slpCode'),
      documentType: this.utilService.mapJoin(msDocumentType, 'codTipDocumento'),
      status: this.utilService.mapJoin(msStatus, 'codStatus'),
      customer,
      item
    };
  }

  onListar() {
    this.isDisplay = true;
    this.ordersService
    .getListSeguimientoDetalladoDireccionFiscalByFilter(this.buildFilterParams())
    .subscribe({ next: (resp: IOrdersSeguimientoDetallado[])=>{
        this.isDisplay = false;
        this.modelo = resp;
      },
      error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  private loadData(): void {
      this.isDisplay = true;

      this.ordersService
      .getListSeguimientoDetalladoDireccionFiscalByFilter(this.buildFilterParams())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isDisplay = false)
      )
      .subscribe({
        next: (data: IOrdersSeguimientoDetallado[]) => {
          this.modelo = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
        }
      });
    }

  onClickExcel() {
    this.isDisplay = true;
    this.ordersService
    .getSeguimientoDetalladoDireccionFiscalByFilterExcel(this.buildFilterParams())
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

  buildParamsSop(): FilterRequestModel {
    const {
      year,
      month,
      ...rest
    } = this.modeloFormSop.getRawValue();

    return {
      ...rest,
      id1: year?.value ?? 0,
      id2: month?.value ?? 0
    };
  }

  getListSemana(): void {
  const params = this.buildParamsSop();

  if (!params.id1 || !params.id2) {
    this.listSemana = [];
    return;
  }

  this.isDisplay = true;

  this.tiempoService.getListSemana(params)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data: ISemana[]) => {
        this.listSemana = data.map(item => ({
          label: item.nomSemana,
          value: item.codSemana
        }));
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e.error?.resultadoDescripcion);
      }
    });
}

  copySo()
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

    // this.modeloSave.codYear         = codYear;
    // this.modeloSave.codMonth        = coMonth;
    // this.modeloSave.codWeek         = codMeek;
    // this.modeloSave.name            = this.modeloFormSop.controls['name'].value;
    // this.modeloSave.comments        = this.modeloFormSop.controls['comments'].value;
    // this.modeloSave.idUsuarioCreate = this.userContextService.getIdUsuario();

    // this.modeloSave.linea = [];

    // for (let index = 0; index < this.modelo.length; index++) {
    //   this.modeloSave.linea.push
    //   ({
    //     docEntry            : this.modelo[index].docEntry,
    //     lineNum             : this.modelo[index].lineNum,
    //     docNum              : this.modelo[index].numeroDocumento,
    //     docDate             : this.modelo[index].docDate,
    //     codTipDocumento     : this.modelo[index].codTipDocumento,
    //     nomTipDocumento     : this.modelo[index].nomTipDocumento,
    //     cardCode            : this.modelo[index].cardCode,
    //     cardName            : this.modelo[index].cardName,
    //     codOriCliente       : this.modelo[index].codOriCliente,
    //     nomOriCliente       : this.modelo[index].nomOriCliente,
    //     slpCode             : this.modelo[index].slpCode,
    //     slpName             : this.modelo[index].slpName,
    //     itemCode            : this.modelo[index].itemCode,
    //     itemName            : this.modelo[index].itemName,
    //     codLinNegocio       : this.modelo[index].codLinNegocio,
    //     nomLinNegocio       : this.modelo[index].nomLinNegocio,
    //     codGpoArticulo      : this.modelo[index].codGpoArticulo,
    //     nomGpoArticulo      : this.modelo[index].nomGpoArticulo,
    //     salUnitMsr          : this.modelo[index].salUnitMsr,
    //     stock               : this.modelo[index].stockProduccion,
    //     qtyEarring          : this.modelo[index].openQty,
    //     pesoPromedioKg      : this.modelo[index].pesoPromedioKg,
    //     kgEarring           : this.modelo[index].kgPendiente,
    //     price               : this.modelo[index].price,
    //     lineTotEarring      : this.modelo[index].lineTotEarring,
    //     codConPago          : this.modelo[index].codConPago,
    //     nomConPago          : this.modelo[index].nomConPago,
    //     idUsuarioCreate     : this.userContextService.getIdUsuario()
    //   });
    // }

    // this.sopService.setCreate(this.modeloSave)
    // .subscribe({ next: (data:any)=>{
    //     this.isSaving = false;
    //     this.swaMsgExito(null);
    //     this.onClear();
    //     this.getListAnio();
    //     this.getListMes();
    //     this.getListSemana();
    //   },
    //   error:(e)=>{
    //     this.isSaving = false;
    //     let msg = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
    //     msg.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
    //   }
    // });
  }

  copySop(): void {
    this.isSaving = true;

    const form = this.modeloFormSop.getRawValue();
    const userId = this.userContextService.getIdUsuario();

    const modeloSave: SopCreateModel = {
      id              : 0,
      codYear         : form.year?.value ?? 0,
      codMonth        : form.month?.value ?? 0,
      codWeek         : form.week?.value ?? 0,
      name            : form.name,
      comments        : form.comments,
      idUsuarioCreate : userId,

      linea: (this.modelo ?? []).map(item => ({
        docEntry        : item.docEntry,
        lineNum         : item.lineNum,
        docNum          : item.numeroDocumento,
        docDate         : item.docDate,
        codTipDocumento : item.codTipDocumento,
        nomTipDocumento : item.nomTipDocumento,
        cardCode        : item.cardCode,
        cardName        : item.cardName,
        codOriCliente   : item.codOriCliente,
        nomOriCliente   : item.nomOriCliente,
        slpCode         : item.slpCode,
        slpName         : item.slpName,
        itemCode        : item.itemCode,
        itemName        : item.itemName,
        codLinNegocio   : item.codLinNegocio,
        nomLinNegocio   : item.nomLinNegocio,
        codGpoArticulo  : item.codGpoArticulo,
        nomGpoArticulo  : item.nomGpoArticulo,
        salUnitMsr      : item.salUnitMsr,
        stock           : item.stockProduccion,
        qtyEarring      : item.openQty,
        pesoPromedioKg  : item.pesoPromedioKg,
        kgEarring       : item.kgPendiente,
        price           : item.price,
        lineTotEarring  : item.lineTotEarring,
        codConPago      : item.codConPago,
        nomConPago      : item.nomConPago,
        idUsuarioCreate : userId
      }))
    };

    this.sopService.setCreate(modeloSave)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isSaving = false; })
      )
      .subscribe({
        next: () => {
          this.swaMsgExito(null);
          this.onClear();
          this.getListAnio();
          this.getListMes();
          this.getListSemana();
        },
        error: (e) => {
          const msg = swal.mixin({
            customClass: { container: 'my-swal' },
            target: document.getElementById('modal')
          });

          msg.fire(
            this.globalConstants.msgInfoSummary,
            e.error?.resultadoDescripcion,
            'error'
          );
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
