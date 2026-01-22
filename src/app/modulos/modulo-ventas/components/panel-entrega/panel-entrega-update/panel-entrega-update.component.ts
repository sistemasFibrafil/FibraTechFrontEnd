import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { IOrdenVenta } from '../../../interfaces/sap/orden-venta.interface';
import { ISocioNegocio } from 'src/app/modulos/modulo-socios-negocios/interfaces/socio-segocio.interface';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/warehouses.interface';
import { IPickingVenta, IPickingVentaByIdPicking, IPickingVentaItem, IPickingVentaItemGrilla } from '../../../interfaces/picking-venta.interface';

import { UserContextService } from 'src/app/services/user-context.service';
import { OrdenVentaService } from '../../../services/sap/orden-venta.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { PickingVentaService } from '../../../services/web/picking-venta.service';
import { FacturaVentaService } from '../../../services/sap/factura-venta-sap.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';


interface ITipoPicking
{
  codTipoPicking: string;
  nomTipoPicking: string;
}

interface IEstadoPicking
{
  codEstado: string;
  nomEstado: string;
}


@Component({
  selector: 'app-ven-panel-entrega-update',
  templateUrl: './panel-entrega-update.component.html',
  styleUrls: ['./panel-entrega-update.component.css']
})
export class PanelEntregaUpdateComponent implements OnInit {

  // Titulo del componente
  titulo = 'Entrega';

  buttonAcces: ButtonAcces = new ButtonAcces();

  modeloForm: FormGroup;
  modeloFormItem: FormGroup;
  modeloFormCliente: FormGroup;
  modeloFormBarCode: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();


  idPicking: number = 0;
  modeloSave: IPickingVenta;
  listEstado: IEstadoPicking[];
  listTipoPicking: ITipoPicking[];
  modeloView: IPickingVentaByIdPicking;

  // MODAL: Progreso
  isDisplay: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;

  // MODAL: CLiente
  columnasCliente: any[];
  isDisplayCliente = false;
  selectedCliente: ISocioNegocio;
  listCliente: ISocioNegocio[] = [];

  // MODAL: BarCode
  isDisplayBarCode = false;
  columnasBarCode: any[];
  selectedPickingBarCode: IPickingVentaItem;
  listPickingBarCode: IPickingVentaItem[] = [];

  // DETALLE
  columnasItem: any[];
  listAlmacen: IWarehouses[];
  listOrdenVenta: IOrdenVenta[];
  listPickingItem: IPickingVentaItem[] = [];
  listPickingItemGrilla: IPickingVentaItemGrilla[] = [];


  constructor
  (
    public app: LayoutComponent,
    private readonly route: ActivatedRoute,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private router: Router,
    private fb: FormBuilder,
    private userContextService: UserContextService,
    private warehousesService: WarehousesService,
    private pickingVentaService: PickingVentaService,
    private OrdenVentaService: OrdenVentaService,
    private facturaVentaService: FacturaVentaService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.getTipoPicking();
    this.getEstadoPicking();
    this.getListAlamcen();

    this.route.params.subscribe((params: Params) => {
      this.idPicking = Number(params["id"]);
      setTimeout(() => {
        this.getPickingVentaByIdPicking(this.idPicking);
      }, 10);
    });
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
      'numPicking'  : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'fecPicking'  : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'tipoPicking' : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'estado'      : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'cardCode'    : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'licTradNum'  : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'cardName'    : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'comentarios' : new FormControl('')
    });

    this.modeloFormCliente = this.fb.group(
    {
      'filtro' : new FormControl('')
    });

    this.modeloFormItem = this.fb.group(
    {
      'ordenVenta'  : new FormControl('', Validators.compose([Validators.required])),
      'almacen'     : new FormControl('', Validators.compose([Validators.required])),
      'barCode'     : new FormControl('', Validators.compose([Validators.required])),
    });

    this.modeloFormBarCode = this.fb.group(
    {
      'filtro' : new FormControl('')
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-entrega-list');
  }

  onBuildColumn() {
    this.columnasCliente = [
      { field: 'cardCode', header: 'Código' },
      { field: 'licTradNum', header: 'RUC' },
      { field: 'cardName', header: 'Nombre' },
    ];

    this.columnasItem = [
      { field: 'itemCode', header: 'Código' },
      { field: 'itemName', header: 'Descripción' },
      { field: 'docNum', header: 'Número' },
      { field: 'unitMsr', header: 'UM' },
      { field: 'quantity', header: 'Cantidad' },
      { field: 'peso', header: 'Peso' },
    ];

    this.columnasBarCode= [
      { field: 'itemCode', header: 'Código' },
      { field: 'itemName', header: 'Descripción' },
      { field: 'codeBar', header: 'Código de Barra' },
      { field: 'peso', header: 'Peso' },
    ];
  }

  getTipoPicking()
  {
    this.listTipoPicking =
    [
      { codTipoPicking: '01', nomTipoPicking: 'Órden de Venta' },
      { codTipoPicking: '02', nomTipoPicking: 'Factura de Reserva' },
    ];
  }

  getEstadoPicking()
  {
    this.listEstado =
    [
      { codEstado: '01', nomEstado: 'Abierto' },
      { codEstado: '02', nomEstado: 'Cerrado' },
      { codEstado: '03', nomEstado: 'Eliminado' },
    ];

    this.modeloForm.patchValue({ estado: this.listEstado.find(x => x.codEstado === '01') });
  }

  getListDocumento()
  {
    debugger
    this.listOrdenVenta = [];
    this.listPickingItem = [];
    this.listPickingItemGrilla = [];

    const { tipoPicking } = this.modeloForm.controls;
    const { cardCode } = this.modeloForm.controls;

    if(tipoPicking.value === null || tipoPicking.value === undefined) return;
    if(cardCode.value === '') return;

    if(tipoPicking.value.codTipoPicking === '01') this.getListOrdenVentaPendienteForPickingByCardCode(cardCode.value);
    if(tipoPicking.value.codTipoPicking === '02') this.getListFacturaReservaPendienteForPickingByCardCode(cardCode.value);
  }

  //#region <<< MODAL: Cliente >>>
  onClickShowModalCliente()
  {
  }

  onClickBuscarCliente()
  {
  }

  onClickRowCliente(value: ISocioNegocio)
  {
  }

  onClickAceptModalCliente()
  {
  }

  onToLimpiarCliente()
  {
  }

  onClickCloseModalCliente()
  {
  }
  //#endregion


  getListOrdenVentaPendienteForPickingByCardCode(cardCode: string) {
    this.isDisplay = true;
    this.listOrdenVenta = [];
    this.OrdenVentaService.getListOrdenVentaPendienteForPickingByCardCode(cardCode)
    .subscribe({next:(data: any[]) =>{
      this.isDisplay = false;
        this.listOrdenVenta = data;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListFacturaReservaPendienteForPickingByCardCode(cardCode: string) {
    this.isDisplay = true;
    this.listOrdenVenta = [];
    this.facturaVentaService.getListFacturaReservaPendienteForPickingByCardCode(cardCode)
    .subscribe({next:(data: any[]) =>{
      this.isDisplay = false;
        this.listOrdenVenta = data;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListAlamcen() {
    this.listAlmacen = [];
    const param: any = { inactive: 'N' }; // inactive
    this.warehousesService.getListByInactive(param)
    .subscribe({next:(data: IWarehouses[]) =>{
        this.listAlmacen = data;
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickAddItem()
  {
    const { tipoPicking } = this.modeloForm.controls;
    const { cardCode } = this.modeloForm.controls;
    const { estado } = this.modeloForm.controls;

    const { ordenVenta, almacen } = this.modeloFormItem.value;
    const item = this.modeloFormItem.value;

    this.modeloFormItem.patchValue({ barCode: '' });

    if (tipoPicking.value === null || tipoPicking.value === undefined)
    {
      this.swaCustomService.swaMsgInfo('Seleccione el tipo de picking.');
      return;
    }

    if (estado.value === null || estado.value === undefined)
    {
      this.swaCustomService.swaMsgInfo('Seleccione el estado.');
      return;
    }

    if (estado.value.codEstado !== '01')
    {
      this.swaCustomService.swaMsgInfo('Seleccione el estado válido.');
      return;
    }

    if (cardCode.value === '')
    {
      this.swaCustomService.swaMsgInfo('Seleccione el cliente.');
      return;
    }

    if (ordenVenta === '' || ordenVenta === null)
    {
      this.swaCustomService.swaMsgInfo('Seleccione la órden de venta.');
      return;
    }

    if (almacen === '' || almacen === null)
    {
      this.swaCustomService.swaMsgInfo('Seleccione el almacén.');
      return;
    }

    if (item.barCode === '' || item.barCode === null)
    {
      this.swaCustomService.swaMsgInfo('Ingrese el código de barra.');
      return;
    }

    const find: any = { cardCode: cardCode.value, docEntry: ordenVenta.docEntry, whsCode: almacen.whsCode, barCode: item.barCode, idSede: 1, codEstado: estado.value.codEstado, idUsuario: this.userContextService.getIdUsuario() };

    if(tipoPicking.value.codTipoPicking === '01') this.getOrdenVentaItemPendienteForPickingByCardCode(find);
    if(tipoPicking.value.codTipoPicking === '02') this.getFacturaReservaItemPendienteForPickingByBarCode(find);
  }

  setAddPickingItem(data: IPickingVentaItem)
  {
    let suma: number = 0;
    let peso: number = 0;

    const listaBarCode = this.listPickingItem.filter(x => x.docEntry === data.docEntry && x.docNum === data.docNum && x.lineNum === data.lineNum && x.objType === data.objType && x.itemCode === data.itemCode && x.barCode === data.barCode);

    if (listaBarCode.length > 0)
    {
      const whsCode: string = `${data.barCode}`;
      this.swaCustomService.swaMsgInfo('El artículo con el código de barra ' + whsCode + ' existe en el detalle.');
      return;
    }

    this.listPickingItem.push
    ({
        idPicking       : data.idPicking,
        idPickingItem   : data.idPickingItem,
        lineNumItem     : data.lineNumItem,
        docEntry        : data.docEntry,
        docNum          : data.docNum,
        lineNum         : data.lineNum,
        objType         : data.objType,
        itemCode        : data.itemCode,
        dscription      : data.dscription,
        whsCode         : data.whsCode,
        idPickingBarCode: data.idPickingBarCode,
        lineNumBarCode  : data.lineNumBarCode,
        barCode         : data.barCode,
        unitMsr         : data.unitMsr,
        quantity        : data.quantity,
        peso            : data.peso,
        codEstado       : data.codEstado,
        idUsuario       : data.idUsuario
    });

    const listaPorItem = this.listPickingItem.filter(x => x.docEntry === data.docEntry && x.docNum === data.docNum && x.lineNum === data.lineNum && x.objType === data.objType && x.itemCode === data.itemCode);

    // Si es UNO quiere decir que es el primer registro
    if(listaPorItem.length === 1)
    {
      this.listPickingItemGrilla.push
      ({
          idPicking     : data.idPicking,
          idPickingItem : data.idPickingItem,
          lineNumItem   : data.lineNumItem,
          docEntry      : data.docEntry,
          docNum        : data.docNum,
          lineNum       : data.lineNum,
          objType       : data.objType,
          itemCode      : data.itemCode,
          dscription    : data.dscription,
          unitMsr       : data.unitMsr,
          quantity      : data.quantity,
          peso          : data.peso
      });
    }
    else
    {
      listaPorItem.forEach(x => suma += x.quantity);
      listaPorItem.forEach(x => peso += x.peso);

      this.listPickingItemGrilla.forEach(x => {
        if(x.docEntry === data.docEntry && x.docNum === data.docNum && x.lineNum === data.lineNum && x.objType === data.objType && x.itemCode === data.itemCode)
        {
          x.quantity = suma;
          x.peso = peso;
        }
      });
    }
  }

  getOrdenVentaItemPendienteForPickingByCardCode(value: any) {
    this.isDisplay = true;
    this.OrdenVentaService.getOrdenVentaItemPendienteForPickingByBarCode(value)
    .subscribe({next:(data: IPickingVentaItem) =>
    {
      this.isDisplay = false;
      this.setAddPickingItem(data);
    },error:(e)=>{
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    }
    });
  }

  getFacturaReservaItemPendienteForPickingByBarCode(value: any) {
    this.isDisplay = true;
    this.facturaVentaService.getFacturaReservaItemPendienteForPickingByBarCode(value)
    .subscribe({next:(data: IPickingVentaItem) =>
    {
      this.isDisplay = false;
      this.setAddPickingItem(data);
    },error:(e)=>{
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    }
    });
  }

  onToRowSelectedItemShow(value: IPickingVentaItemGrilla)
  {
    const listBarcode = this.listPickingItem.filter(x => x.docEntry === value.docEntry && x.docNum === value.docNum && x.lineNum === value.lineNum && x.objType === value.objType && x.itemCode === value.itemCode);

    this.listPickingBarCode = [];
    this.listPickingBarCode = listBarcode;
    this.isDisplayBarCode = true;
  }


  //#region MODAL: BarCode

  onToDeleteBarcodeInArray(value: IPickingVentaItem)
  {
    let suma: number = 0;
    let peso: number = 0;

    // Se elimina el producto con el codigo de barra seleccionado. Array principal
    this.listPickingItem.filter(x => x.docEntry === value.docEntry && x.docNum === value.docNum && x.lineNum === value.lineNum  && x.objType === value.objType && x.itemCode === value.itemCode && x.barCode === value.barCode).forEach(x => this.listPickingItem.splice(this.listPickingItem.indexOf(x), 1));

    // Se elimina el producto con el codigo de barra seleccionado. Array grilla modal
    this.listPickingBarCode.filter(x => x.docEntry === value.docEntry && x.docNum === value.docNum && x.lineNum === value.lineNum && x.objType === value.objType && x.itemCode === value.itemCode && x.barCode === value.barCode).forEach(x => this.listPickingBarCode.splice(this.listPickingBarCode.indexOf(x), 1));

    // Se calcula la cantidad y peso
    this.listPickingBarCode.forEach(x => suma += x.quantity);
    this.listPickingBarCode.forEach(x => peso += x.peso);

    if(this.listPickingBarCode.length === 0)
    {
      // Sino hay registro el array principal se elimina el producto del array grilla
      this.listPickingItemGrilla.filter(x => x.docEntry === value.docEntry && x.docNum === value.docNum && x.lineNum === value.lineNum && x.objType === value.objType && x.itemCode === value.itemCode).forEach(x => this.listPickingItemGrilla.splice(this.listPickingItemGrilla.indexOf(x), 1));
    }
    else
    {
      // Se actualiza la cantidad y peso en el array grilla
      this.listPickingItemGrilla.forEach(x => {
        if(x.docEntry === value.docEntry && x.docNum === value.docNum && x.lineNum === value.lineNum && x.objType === value.objType && x.itemCode === value.itemCode)
        {
          x.quantity = suma;
          x.peso = peso;
        }
      });
    }
  }

  onToDelete(value: IPickingVentaItem)
  {
    this.isDeleting = true;
    this.onToDeleteBarcodeInArray(value);
    if(value.idPickingItem === 0)
    {
      this.isDeleting = false;
      return;
    }
    this.pickingVentaService.setDeleteItem(value.idPickingItem)
    .subscribe({ next: (resp:any)=>{
      this.isDeleting = false;
        //this.swaCustomService.swaMsgExito(resp.resultadoDescripcion);
      },
      error:(e)=>{
        this.isDeleting = false;
        //this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToRowSelectedBarCodeDelete(value: IPickingVentaItem)
  {
    this.onToDelete(value);
  }

  onClickCloseModalBarCode()
  {
    this.listPickingBarCode = [];
    this.isDisplayBarCode = false;
  }

  //#endregion

  onToDeleteItemArray(value: IPickingVentaItemGrilla)
  {
    // Se elimina el producto de la grilla
    this.listPickingItemGrilla.filter(x => x.docEntry === value.docEntry && x.docNum === value.docNum && x.lineNum === value.lineNum && x.objType === value.objType && x.itemCode === value.itemCode).forEach(x => this.listPickingItemGrilla.splice(this.listPickingItemGrilla.indexOf(x), 1));
    // Se elimina el producto del array principal
    this.listPickingItem.filter(x => x.docEntry === value.docEntry && x.docNum === value.docNum && x.lineNum === value.lineNum && x.objType === value.objType && x.itemCode === value.itemCode).forEach(x => this.listPickingItem.splice(this.listPickingItem.indexOf(x), 1));
  }

  onToDeleteItemAll(value: IPickingVentaItemGrilla)
  {
    this.isDeleting = true;
    if(value.idPicking === 0)
    {
      this.onToDeleteItemArray(value);
      this.isDeleting = false;
      this.swaCustomService.swaMsgExito(null);
      return;
    }

    const param: any = { idPicking: value.idPicking, docEntry: value.docEntry, objType: value.objType, lineNum: value.lineNum, itemCode: value.itemCode, idUsuario: this.userContextService.getIdUsuario() };
    this.pickingVentaService.setDeleteItemAll(param)
    .subscribe({ next: (resp:any)=>{
        this.isDeleting = false;
        this.swaCustomService.swaMsgExito(null);
      },
      error:(e)=>{
        this.isDeleting = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToRowSelectedItemDelete(value: IPickingVentaItemGrilla)
  {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleEliminar,
      this.globalConstants.subTitleEliminar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.onToDeleteItemAll(value);
      }
    });
  }

  onToValidatedSave(){
    const { tipoPicking, estado, cardCode } = this.modeloForm.controls;

    if (this.idPicking === 0 || this.idPicking === undefined)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('El número interno de picking no es válido.');
      return false;
    }

    if (tipoPicking.value === null || tipoPicking.value === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el tipo de picking.');
      return false;
    }

    if (estado.value === null || estado.value === undefined)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el estado.');
      return false;
    }

    if (estado.value.codEstado !== '01')
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('El estado del picking no es válido.');
      return false;
    }

    if(cardCode.value === '')
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el cliente.');
      return false;
    }

    return true;
  }

  onToSave(){
    this.isSaving = true;

    if(!this.onToValidatedSave()) return;

    const { tipoPicking, estado } = this.modeloForm.controls;

    this.modeloSave = this.modeloForm.getRawValue();
    this.modeloSave.idPicking = this.idPicking;
    this.modeloSave.codTipoPicking = tipoPicking.value.codTipoPicking;
    this.modeloSave.codEstado = estado.value.codEstado;
    this.modeloSave.idUsuario = this.userContextService.getIdUsuario();

    this.modeloSave.item = [];

    for(let i = 0; i < this.listPickingItem.length; i++)
    {
      if(this.listPickingItem[i].idPickingItem === 0)
      {
        this.modeloSave.item.push
        ({
          idPickingItem   : this.listPickingItem[i].idPickingItem,
          idPicking       : this.idPicking,
          lineNumItem     : this.listPickingItem[i].docEntry,
          docEntry        : this.listPickingItem[i].docEntry,
          docNum          : this.listPickingItem[i].docNum,
          lineNum         : this.listPickingItem[i].lineNum,
          objType         : this.listPickingItem[i].objType,
          itemCode        : this.listPickingItem[i].itemCode,
          dscription      : this.listPickingItem[i].dscription,
          whsCode         : this.listPickingItem[i].whsCode,
          idPickingBarCode: this.listPickingItem[i].idPickingBarCode,
          lineNumBarCode  : this.listPickingItem[i].lineNumBarCode,
          barCode         : this.listPickingItem[i].barCode,
          unitMsr         : this.listPickingItem[i].unitMsr,
          quantity        : this.listPickingItem[i].quantity,
          peso            : this.listPickingItem[i].peso,
          codEstado       : this.listPickingItem[i].codEstado,
          idUsuario       : this.listPickingItem[i].idUsuario
        });
      }
    }

    this.pickingVentaService.setCreate(this.modeloSave)
    .subscribe({ next: (data:any)=>{
        this.isSaving = false;
        this.swaCustomService.swaMsgExito(null);
        this.back();
      },
      error:(e)=>{
        this.isSaving = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickSave() {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.onToSave();
      }
    });
  }

  setPicking(data: IPickingVentaByIdPicking)
  {
    this.modeloForm.patchValue
    ({
      numPicking  : data.numPicking,
      fecPicking  : (data.fecPicking == null ?  null : new Date(data.fecPicking)),
      tipoPicking : this.listTipoPicking.find(x => x.codTipoPicking === data.codTipoPicking),
      estado      : this.listEstado.find(x => x.codEstado === data.codEstado),
      cardCode    : data.cardCode,
      cardName    : data.cardName,
      licTradNum  : data.licTradNum,
      comentarios : data.comentarios,
    });

    this.getListDocumento();

    data.item.forEach(element => {
      this.setAddPickingItem(element);
    });
  }

  getPickingVentaByIdPicking(idPicking: number) {
    this.isDisplay = true;
    this.pickingVentaService.getPickingVentaByIdPicking(idPicking)
    .subscribe({next:(data: IPickingVentaByIdPicking) =>{
        this.isDisplay = false;
        this.modeloView = data;
        this.setPicking(this.modeloView);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  back() {
    this.router.navigate(['/main/modulo-ven/panel-entrega-list']);
  }
}
