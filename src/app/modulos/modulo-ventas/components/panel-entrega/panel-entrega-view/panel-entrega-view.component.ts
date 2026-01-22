import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { IOrdenVenta } from '../../../interfaces/sap/orden-venta.interface';

import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { PickingVentaService } from '../../../services/web/picking-venta.service';
import { ISocioNegocio } from 'src/app/modulos/modulo-socios-negocios/interfaces/socio-segocio.interface';
import { SocioNegocioService } from 'src/app/modulos/modulo-socios-negocios/services/socio-negocios.service';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/warehouses.interface';
import { IPickingVentaItem, IPickingVentaByIdPicking, IPickingVentaItemGrilla } from '../../../interfaces/picking-venta.interface';



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
  selector: 'app-ven-panel-entrega-view',
  templateUrl: './panel-entrega-view.component.html',
  styleUrls: ['./panel-entrega-view.component.css']
})
export class PanelEntregaViewComponent implements OnInit {

  // Titulo del componente
  titulo = 'Entrega';

  buttonAcces: ButtonAcces = new ButtonAcces();

  modeloForm: FormGroup;
  modeloFormItem: FormGroup;
  modeloFormCliente: FormGroup;
  modeloFormBarCode: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();


  idPicking: number = 0;
  listEstado: IEstadoPicking[];
  listTipoPicking: ITipoPicking[];
  modeloView: IPickingVentaByIdPicking;


  // MODAL: Progreso
  isDisplay: boolean = false;

  // MODAL: CLiente
  cardCode: string = '';
  columnasCliente: any[];
  isDisplayCliente = false;
  selectedCliente: ISocioNegocio;
  listCliente: ISocioNegocio[] = [];

  // MODAL: BarCode
  displayBarCode = false;
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
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private readonly route: ActivatedRoute,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private pickingVentaService: PickingVentaService,
    private socioNegocioService: SocioNegocioService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.getTipoPicking();
    this.getEstadoPicking();

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
      'comentarios' : new FormControl({ value: '', disabled: true })
    });

    this.modeloFormCliente = this.fb.group(
    {
      'filtro' : new FormControl('')
    });

    this.modeloFormItem = this.fb.group(
    {
      'ordenVenta'  : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'almacen'     : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'barCode'     : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
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
      { field: 'cardName', header: 'Nombre' },
      { field: 'licTradNum', header: 'RUC' },
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
  }


  //#region <<< MODAL: Cliente >>>
  onClickShowModalCliente()
  {
    this.listCliente = [];
    this.isDisplayCliente = true;
  }

  onClickBuscarCliente()
  {
    // this.isDisplay = true;
    // this.listCliente = [];
    // const buscar = this.modeloFormCliente.value;
    // this.socioNegocioService.getListByFiltro(buscar.filtro)
    // .subscribe({next:(data: ISocioNegocio[]) =>{
    //     this.isDisplay = false;
    //     this.listCliente = data;
    //   },error:(e)=>{
    //     this.isDisplay = false;
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  onClickRowCliente(value: ISocioNegocio)
  {
    this.onToLimpiarCliente();

    this.modeloForm.patchValue({
      cardCode: value.cardCode,
      cardName: value.cardName,
      licTradNum: value.licTradNum
    });

    this.listOrdenVenta = [];
    this.listPickingItem = [];
    this.listPickingItemGrilla = [];
    this.modeloFormCliente.patchValue({ filtro: '' });

    this.getListDocumento();
    this.onClickCloseModalCliente();
  }

  onClickAceptModalCliente()
  {
    if(this.selectedCliente === null) return;
    if(this.selectedCliente === undefined) return;

    this.onClickRowCliente(this.selectedCliente);
  }

  onToLimpiarCliente()
  {
    this.modeloForm.patchValue({ cardCode: '', cardName: '', licTradNum: '' });
  }

  onClickCloseModalCliente()
  {
    this.listCliente = [];
    this.isDisplayCliente = false;
  }
  //#endregion


  onClickAddItem()
  {
  }

  setAddPickingItem(data: IPickingVentaItem)
  {
    let suma: number = 0;
    let peso: number = 0;

    const listaBarCode = this.listPickingItem.filter(x => x.docEntry === data.docEntry && x.docNum === data.docNum && x.lineNum === data.lineNum && x.objType === data.objType && x.itemCode === data.itemCode && x.barCode === data.barCode);

    if (listaBarCode.length > 0)
    {
      const whsCode: string = `<b>${data.barCode}</b>`;
      this.swaCustomService.swaMsgInfo('El artículo con el código de barra ' + whsCode + ' existe en el detalle.');
      return;
    }

    this.listPickingItem.push
    ({
        idPicking       : 0,
        idPickingItem   : 0,
        lineNumItem     : 0,
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
          idPicking     : 0,
          idPickingItem : 0,
          lineNumItem   : 0,
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

  onToRowSelectedItemShow(value: IPickingVentaItemGrilla)
  {
    const listBarcode = this.listPickingItem.filter(x => x.docEntry === value.docEntry && x.docNum === value.docNum && x.lineNum === value.lineNum && x.objType === value.objType && x.itemCode === value.itemCode);

    this.listPickingBarCode = [];
    this.listPickingBarCode = listBarcode;
    this.displayBarCode = true;
  }


  //#region MODAL: BarCode

  onToRowSelectedBarCodeDelete(value: IPickingVentaItem)
  {
  }

  onClickCloseModalBarCode()
  {
    this.listPickingBarCode = [];
    this.displayBarCode = false;
  }

  //#endregion


  onToRowSelectedItemDelete(value: IPickingVentaItemGrilla)
  {
  }

  onClickSave() {
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

    data.item.forEach(element => {
      this.setAddPickingItem(element);
    });
  }

  getPickingVentaByIdPicking(idPicking: number) {
    this.pickingVentaService.getPickingVentaByIdPicking(idPicking)
    .subscribe({next:(data: IPickingVentaByIdPicking) =>{
        this.modeloView = data;
        this.setPicking(this.modeloView);
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  back() {
    this.router.navigate(['/main/modulo-ven/panel-entrega-list']);
  }
}
