import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';

import { ISop, ISopDetalle } from '../../../interfaces/web/sop.interface';
import { SopService } from '../../../services/web/sop.service';
import { SopUpdateModel } from '../../../models/web/sop.model';
import { IAnio } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/anio.interface';
import { TiempoService } from 'src/app/modulos/modulo-gestion/services/web/definiciones/general/tiempo.service';
import { IMes } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/mes.interface';
import { ISemana } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/semana.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';

interface DocStatus {
  statusCode  : string,
  statusName  : string
}

@Component({
  selector: 'app-ven-panel-sop-update',
  templateUrl: './panel-sop-update.component.html',
  styleUrls: ['./panel-sop-update.component.css']
})
export class PanelSopUpdateComponent implements OnInit, AfterViewInit {
  // Titulo del componente
  titulo            = 'S&OP';

  modeloForm        : FormGroup;
  globalConstants   : GlobalsConstantsForm = new GlobalsConstantsForm();

  id                : number = 0;
  // MODAL: Progreso
  isSaving          : boolean = false;
  isDeleting        : boolean = false;
  isDisplay         : boolean = false;
  // DETALLE
  columnas          : any[];
  opciones          : any = [];

  docStatus         : DocStatus[];
  listYear          : SelectItem[];
  listMonth         : SelectItem[];
  listWeek          : SelectItem[];

  modelo            : ISop;
  detalle           : ISopDetalle[] = [];
  detalleSelected   : ISopDetalle;
  modeloSave        : SopUpdateModel = new SopUpdateModel();
  params            : FilterRequestModel = new FilterRequestModel();


  constructor
  (
    private el: ElementRef,
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private userContextService: UserContextService,
    private readonly route: ActivatedRoute,
    public readonly utilService: UtilService,
    private readonly swaCustomService: SwaCustomService,
    private sopService: SopService,
    private tiempoService: TiempoService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    this.getListAnio();
    this.getListMes();

    this.route.params.subscribe((params: Params) => {
      this.id = Number(params["id"]);
      setTimeout(() => {
        this.getById(this.id);
      }, 10);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const inputElement = this.el.nativeElement.querySelector('.input-number');
      if (inputElement) {
        inputElement.setAttribute('style', 'text-align: right !important;');
      }
    }, 100);  // Espera a que el input se renderice
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
      'year'            : new FormControl('', Validators.compose([Validators.required])),
      'month'           : new FormControl('', Validators.compose([Validators.required])),
      'week'            : new FormControl('', Validators.compose([Validators.required])),
      'name'            : new FormControl('', Validators.compose([Validators.required])),
      'comments'        : new FormControl({ value: '', disabled: false })
    });
  }

  onBuildColumn() {
    this.columnas =
    [
      { field: 'cardName',            header: 'Cliente' },
      { field: 'nomTipDocumento',     header: 'Tipo de documento' },
      { field: 'docNum',              header: 'Número de pedido' },
      { field: 'docDate',             header: 'Fecha de contabilización' },
      { field: 'itemCode',            header: 'Código de artículo' },
      { field: 'itemName',            header: 'Descripción de artículo' },
      { field: 'stock',               header: 'Stock' },
      { field: 'qtyEarring',          header: 'Cantidad Pendiente' },
      { field: 'kgEarring',           header: 'Kg Pendiente' },
      { field: 'price',               header: 'Precio' },
      { field: 'lineTotEarring',      header: 'Importe pendiente' },
      { field: 'slpName',             header: 'Vendedor' },
      { field: 'nomOriCliente',       header: 'Origen de cliente' },
      { field: 'nomLinNegocio',       header: 'Línea de negocio' },
      { field: 'nomGpoArticulo',      header: 'Grupo de artículo' },
      { field: 'fecEntFinal',         header: 'Fecha de entrega final' },
      { field: 'fecEntProdProceso',   header: 'Fecha de entrega de PP' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { label: 'Añadir línea',      icon: 'pi pi-pencil',      command: () => { this.onClickAddNewLine() } },
      { label: 'Borrar línea',      icon: 'pi pi-times',       command: () => { this.onClickDelete () } },
    ];
  }

  getListAnio() {
    this.listYear = [];
    this.tiempoService.getListAnio()
    .subscribe({next:(data: IAnio[]) =>{
        this.listYear = [];
        for (let item of data) {
          this.listYear.push({ label: item.nomAnio, value: item.codAnio });
        }

        const yearCurrent = new Date().getFullYear();
        const item: any = this.listYear.find(x => x.value === yearCurrent);
        this.modeloForm.controls['year'].setValue({ label: item.label, value: item.value });

        this.getListSemana();
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListMes() {
    this.listMonth = [];
    this.tiempoService.getListMes()
    .subscribe({next:(data: IMes[]) =>{
        this.listMonth = [];
        for (let item of data) {
          this.listMonth.push({ label: item.nomMes, value: item.codMes });
        }

        const mesActual=new Date().getMonth() + 1;
        const item: any = this.listMonth.find(x => x.value === mesActual);
        this.modeloForm.controls['month'].setValue({ label: item.label, value: item.value });

        this.getListSemana();
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onSetParametro()
  {
    let codYear   : number = 0;
    let codMonth  : number = 0;

    this.params = this.modeloForm.getRawValue();

    if (this.modeloForm.controls['year'].value) {
      let itemAnio = this.modeloForm.controls['year'].value;
      codYear = itemAnio.value;
    }

    if (this.modeloForm.controls['month'].value) {
      let itemMes = this.modeloForm.controls['month'].value;
      codMonth = itemMes.value;
    }

    this.params.id1 = codYear;
    this.params.id2 = codMonth;
  }

  getListSemana() {
    this.listWeek = [];
    this.onSetParametro();

    if(this.params.id1 === 0 || this.params.id2 === 0)
    {
      return;
    }

    this.tiempoService.getListSemana(this.params)
    .subscribe({next:(data: ISemana[]) =>{
        this.listWeek = [];
        for (let item of data) {
          this.listWeek.push({ label: item.nomSemana, value: item.codSemana });
        }
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onSelectedItem(modelo: ISopDetalle) {
    this.detalleSelected = modelo;
    if(this.detalle.filter(x => x.itemCode === '').length === 0){
      this.opciones.find(x => x.label == "Añadir línea").visible = true;
    } else {
      this.opciones.find(x => x.label == "Añadir línea").visible = false;
    }
    if(this.detalle.length > 0){
      this.opciones.find(x => x.label == "Borrar línea").visible = true;
    } else {
      this.opciones.find(x => x.label == "Borrar línea").visible = false;
    }
  }

  onChangeQuantity(value: ISopDetalle, index: number)
  {
    let qtyEarring      : number = 0;
    let pesoPromedioKg  : number = 0;
    let kgEarring       : number = 0;
    let price           : number = 0;
    let lineTotEarring  : number = 0;

    qtyEarring          = this.utilService.onRedondearDecimal(value.qtyEarring, 3);
    pesoPromedioKg      = this.utilService.onRedondearDecimal(value.pesoPromedioKg, 3);
    kgEarring           = this.utilService.onRedondearDecimal((value.salUnitMsr === 'KG' ? (qtyEarring) : (qtyEarring * pesoPromedioKg)), 3);
    price               = this.utilService.onRedondearDecimal(value.price, 3);
    lineTotEarring      = (price * qtyEarring);

    this.detalle[index].qtyEarring      = qtyEarring;
    this.detalle[index].kgEarring       = kgEarring;
    this.detalle[index].lineTotEarring  = lineTotEarring;
    this.detalle[index].record          = (this.detalle[index].record === 1 ? 1 : 3);
    this.detalle[index].idUsuarioUpdate = (this.detalle[index].record === 1 ? null : this.userContextService.getIdUsuario());
  }

  onChangekgEarring(index: number)
  {
    this.detalle[index].record          = (this.detalle[index].record === 1 ? 1 : 3);
    this.detalle[index].idUsuarioUpdate = (this.detalle[index].record === 1 ? null : this.userContextService.getIdUsuario());
  }

  onChangeFecEntFinal(index: number)
  {
    this.detalle[index].record          = (this.detalle[index].record === 1 ? 1 : 3);
    this.detalle[index].idUsuarioUpdate = (this.detalle[index].record === 1 ? null : this.userContextService.getIdUsuario());
  }

  onChangeFecProdProceso(index: number)
  {
    this.detalle[index].record          = (this.detalle[index].record === 1 ? 1 : 3);
    this.detalle[index].idUsuarioUpdate = (this.detalle[index].record === 1 ? null : this.userContextService.getIdUsuario());
  }

  getItem = (): ISopDetalle =>
  (
    {
      id                  : this.detalleSelected.id,
      line                : 0,
      docEntry            : this.detalleSelected.docEntry,
      lineNum             : this.detalleSelected.lineNum,
      order               : this.detalleSelected.order,
      docNum              : this.detalleSelected.docNum,
      docDate             : this.detalleSelected.docDate,
      codTipDocumento     : this.detalleSelected.codTipDocumento,
      nomTipDocumento     : this.detalleSelected.nomTipDocumento,
      cardCode            : this.detalleSelected.cardCode,
      cardName            : this.detalleSelected.cardName,
      codOriCliente       : this.detalleSelected.codOriCliente,
      nomOriCliente       : this.detalleSelected.nomOriCliente,
      slpCode             : this.detalleSelected.slpCode,
      slpName             : this.detalleSelected.slpName,
      itemCode            : this.detalleSelected.itemCode,
      itemName            : this.detalleSelected.itemName,
      codLinNegocio       : this.detalleSelected.codLinNegocio,
      nomLinNegocio       : this.detalleSelected.nomLinNegocio,
      codGpoArticulo      : this.detalleSelected.codGpoArticulo,
      nomGpoArticulo      : this.detalleSelected.nomGpoArticulo,
      salUnitMsr          : this.detalleSelected.salUnitMsr,
      stock               : this.detalleSelected.stock,
      qtyEarring          : this.detalleSelected.qtyEarring,
      pesoPromedioKg      : this.detalleSelected.pesoPromedioKg,
      kgEarring           : this.detalleSelected.kgEarring,
      price               : this.detalleSelected.price,
      lineTotEarring      : this.detalleSelected.lineTotEarring,
      codConPago          : this.detalleSelected.codConPago,
      nomConPago          : this.detalleSelected.nomConPago,
      fecEntFinal         : this.detalleSelected.fecEntFinal,
      fecEntProdProceso   : this.detalleSelected.fecEntProdProceso,
      record              : 1,
      idUsuarioCreate     : this.userContextService.getIdUsuario()
    }
  );

  onClickAddNewLine()
  {
    let index = this.detalle.indexOf(this.detalleSelected) + 1;
    this.detalle.splice(index, 0, this.getItem());
  }

  delete()
  {
    let index = this.modelo.linea.indexOf(this.detalleSelected);
    this.modelo.linea.splice(+index, 1)

    if(this.detalleSelected.line !== 0)
    {
      const value = { id: this.detalleSelected.id, line: this.detalleSelected.line };
      this.isDeleting = true;
      this.sopService.setDeleteDetalle(value)
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
  }

  onClickDelete()
  {
      this.swaCustomService.swaConfirmation(
      this.globalConstants.titleCerrar,
      this.globalConstants.subTitleCerrar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.delete();
      }
    });
  }

  set(value: ISop)
  {
    const itemYear: any = this.listYear.find(x => x.value === value.codYear);
    const itemMonth: any = this.listMonth.find(x => x.value === value.codMonth);
    const itemWeek: any = this.listWeek.find(x => x.value === value.codWeek);

    this.modeloForm.controls['year'].setValue({ label: itemYear.label, value: itemYear.value });
    this.modeloForm.controls['month'].setValue({ label: itemMonth.label, value: itemMonth.value });
    this.modeloForm.controls['week'].setValue({ label: itemWeek.label, value: itemWeek.value });
    this.modeloForm.controls['name'].setValue( value.name );
    this.modeloForm.controls['comments'].setValue( value.comments );

    this.detalle = value.linea;
  }

  getById(id: number) {
    this.isDisplay = true;
    this.sopService.getById(id)
    .subscribe({next:(data: ISop) => {
      this.isDisplay = false;
      this.modelo = data;
      this.set(this.modelo);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  save()
  {
    this.isSaving = true;
    let codYear   : number = 0;
    let coMonth   : number = 0;
    let codMeek   : number = 0;

    if (this.modeloForm.controls['year'].value) {
      let itemYear = this.modeloForm.controls['year'].value;
      codYear = itemYear.value;
    }
    if (this.modeloForm.controls['month'].value) {
      let itemMonth = this.modeloForm.controls['month'].value;
      coMonth = itemMonth.value;
    }
    if (this.modeloForm.controls['week'].value) {
      let itemWeek = this.modeloForm.controls['week'].value;
      codMeek = itemWeek.value;
    }

    this.modeloSave.id              = this.id;
    this.modeloSave.codYear         = codYear;
    this.modeloSave.codMonth        = coMonth;
    this.modeloSave.codWeek         = codMeek;
    this.modeloSave.name            = this.modeloForm.controls['name'].value;
    this.modeloSave.comments        = this.modeloForm.controls['comments'].value;
    this.modeloSave.idUsuarioUpdate = this.userContextService.getIdUsuario();

    this.modeloSave.linea = [];

    for (let index = 0; index < this.detalle.length; index++) {
      this.modeloSave.linea.push
      ({
        id                  : this.detalle[index].id,
        line               : this.detalle[index].line,
        docEntry            : this.detalle[index].docEntry,
        lineNum             : this.detalle[index].lineNum,
        order               : index + 1,
        docNum              : this.detalle[index].docNum,
        docDate             : this.detalle[index].docDate,
        codTipDocumento     : this.detalle[index].codTipDocumento,
        nomTipDocumento     : this.detalle[index].nomTipDocumento,
        cardCode            : this.detalle[index].cardCode,
        cardName            : this.detalle[index].cardName,
        codOriCliente       : this.detalle[index].codOriCliente,
        nomOriCliente       : this.detalle[index].nomOriCliente,
        slpCode             : this.detalle[index].slpCode,
        slpName             : this.detalle[index].slpName,
        itemCode            : this.detalle[index].itemCode,
        itemName            : this.detalle[index].itemName,
        codLinNegocio       : this.detalle[index].codLinNegocio,
        nomLinNegocio       : this.detalle[index].nomLinNegocio,
        codGpoArticulo      : this.detalle[index].codGpoArticulo,
        nomGpoArticulo      : this.detalle[index].nomGpoArticulo,
        salUnitMsr          : this.detalle[index].salUnitMsr,
        stock               : this.detalle[index].stock,
        qtyEarring          : this.detalle[index].qtyEarring,
        pesoPromedioKg      : this.detalle[index].pesoPromedioKg,
        kgEarring           : this.detalle[index].kgEarring,
        price               : this.detalle[index].price,
        lineTotEarring      : this.detalle[index].lineTotEarring,
        codConPago          : this.detalle[index].codConPago,
        nomConPago          : this.detalle[index].nomConPago,
        fecEntFinal         : this.detalle[index].fecEntFinal,
        fecEntProdProceso   : this.detalle[index].fecEntProdProceso,
        record              : this.detalle[index].record,
        idUsuarioCreate     : this.detalle[index].idUsuarioCreate,
        idUsuarioUpdate     : this.detalle[index].idUsuarioUpdate,
      });
    }

    this.sopService.setUpdate(this.modeloSave)
    .subscribe({ next: (data:any)=>{
        this.isSaving = false;
        this.swaCustomService.swaMsgExito(null);
      this.onClickBack();
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
        this.save();
      }
    });
  }

  onClickBack() {
    this.router.navigate(['/main/modulo-ven/panel-sop-list']);
  }
}
