import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { UtilService } from 'src/app/services/util.service';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { SwaCustomService } from 'src/app/services/swa-custom.service';

import { IStatus } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/status.interface';
import { IOrdenVentaSapPendienteByFiltro } from 'src/app/modulos/modulo-ventas/interfaces/sap/orden-venta.interface';
import { IOrdenVentaSodimac, IOrdenVentaSodimacDetalle } from 'src/app/modulos/modulo-ventas/interfaces/web/orden-venta-sodimac.interface';
import { OrdenVentaSodimacCreateModel } from 'src/app/modulos/modulo-ventas/models/web/orden-venta-sodimac.model';
import { StatusService } from 'src/app/modulos/modulo-gestion/services/web/definiciones/general/status.service';
import { OrdenVentaSodimacService } from 'src/app/modulos/modulo-ventas/services/web/orden-venta-sodimac.service';


@Component({
  selector: 'app-ven-panel-sodimac-ov-view',
  templateUrl: './panel-sodimac-ov-view.component.html',
  styleUrls: ['./panel-sodimac-ov-view.component.css']
})
export class PanelSodimacOrdenVentaViewComponent implements OnInit {
  // Titulo del componente
  titulo              = 'Órden de Venta';

  modeloFormCab1      : FormGroup;
  modeloFormCab2      : FormGroup;
  buttonAcces         : ButtonAcces = new ButtonAcces();
  globalConstants     : GlobalsConstantsForm = new GlobalsConstantsForm();

  docEntry            : number = 0;
  idOrdenVentaSodimac : number = 0;

  modeloSave          : OrdenVentaSodimacCreateModel = new OrdenVentaSodimacCreateModel();
  listEstado          : SelectItem[];
  //MODAL:
  isImport            : Boolean = false;
  // MODAL: Progreso
  isDisplay           : boolean = false;
  isSaving            : boolean = false;
  // DETALLE
  columnas            : any[];
  detalle             : IOrdenVentaSodimacDetalle[] = [];
  selectedItem        : IOrdenVentaSodimacDetalle;


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private readonly route: ActivatedRoute,
    public readonly utilService: UtilService,
    private readonly swaCustomService: SwaCustomService,
    private statusService: StatusService,
    private ordenVentaSodimacService: OrdenVentaSodimacService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.getListEstado();

    this.route.params.subscribe((params: Params) => {
      this.idOrdenVentaSodimac = params["id"];
      setTimeout(() => {
        this.getById(this.idOrdenVentaSodimac);
      }, 10);
    });
  }

  onBuildForm() {
    this.modeloFormCab1 = this.fb.group(
    {
      'cardCode'                  : new FormControl({ value: '', disabled: true }),
      'cardName'                  : new FormControl({ value: '', disabled: true }),
      'cntctCode'                 : new FormControl({ value: '', disabled: true }),
      'cntctName'                 : new FormControl({ value: '', disabled: true }),
      'address'                   : new FormControl({ value: '', disabled: true })
    });
    this.modeloFormCab2 = this.fb.group(
    {
      'docEntry'                  : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'docNum'                    : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'numOrdenCompra'            : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'estado'                    : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'docDate'                   : new FormControl({ value: null, disabled: true }, Validators.compose([Validators.required])),
      'docDueDate'                : new FormControl({ value: null, disabled: true }, Validators.compose([Validators.required])),
      'taxDate'                   : new FormControl({ value: null, disabled: true }, Validators.compose([Validators.required])),
    });
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'line1',           header: '#' },
      { field: 'itemCode',        header: 'Código' },
      { field: 'sku',             header: 'Sku' },
      { field: 'dscription',      header: 'Descripción' },
      { field: 'dscriptionLarga', header: 'Descripción larga' },
      { field: 'nomLocal',        header: 'Local' },
      { field: 'isOriente',       header: '¿Oriente?' },
      { field: 'quantity',        header: 'Cantidad' }
    ];
  }

  getListEstado() {
    this.statusService.getList()
    .subscribe({next:(data: IStatus[]) =>{
        this.listEstado = [];
        for (let item of data) {
          this.listEstado.push({ label: item.statusName, value: item.statusCode });
        }

        const item: any = this.listEstado.find(x=>x.value === '01');
        this.modeloFormCab2.controls['estado'].setValue({ label: item.label, value: item.value });
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToOrdenVentaSelected(value: IOrdenVentaSapPendienteByFiltro)
  {
    this.docEntry         = value.docEntry;
    this.modeloFormCab1.patchValue
    ({
        cardCode          : value.cardCode,
        cardName          : value.cardName,
        cntctCode         : value.cntctCode,
        cntctName         : value.cntctName,
        address           : value.address2
    });

    this.modeloFormCab2.patchValue
    ({
        docEntry          : value.docEntry,
        docNum            : value.docNum,
        numOrdenCompra    : value.numOrdenCompra,
        docDate           : (value.docDate == null ?  null : new Date(value.docDate)),
        docDueDate        : (value.docDueDate == null ?  null : new Date(value.docDueDate)),
        taxDate           : (value.taxDate == null ?  null : new Date(value.taxDate)),
    });
  }

  set(value: IOrdenVentaSodimac)
  {
    this.docEntry = value.docEntry;
    this.detalle   = value.item;
  }

  getById(id: number) {
    this.isDisplay = true;
    this.ordenVentaSodimacService.getOrdenVentaSodimacById(id)
    .subscribe({next:(data: IOrdenVentaSodimac) =>{
        this.isDisplay = false;
        this.set(data);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToImportExcel() {

    if(!this.modeloFormCab2.controls['docNum'].value)
    {
      this.swaCustomService.swaMsgInfo('Selecione la órden de venta.');
      return;
    }

    if(this.modeloFormCab2.controls['docNum'].value)
    {
      if(!this.modeloFormCab2.controls['numOrdenCompra'].value)
      {
        this.swaCustomService.swaMsgInfo('La órden de venta seleccionada no tiene el número de OC asignado.');
        return;
      }
    }

    this.isImport = !this.isImport;
  }

  onToSelectedFile(data)
  {
    this.detalle  = [];
    this.detalle  = data;
    this.isImport = !this.isImport;
  }

  onToCancelImport(event)
  {
    this.isImport = !this.isImport;
  }

  onToValidatedSave(){
    if(!this.modeloFormCab1.controls['cardCode'].value)
    {
      this.swaCustomService.swaMsgInfo('El código de cliente no es válido.');
      return false;
    }

    if(!this.modeloFormCab1.controls['cardCode'].value)
    {
      this.swaCustomService.swaMsgInfo('El nombre de cliente no es válido.');
      return false;
    }

    if(!this.modeloFormCab2.controls['docNum'].value)
    {
      this.swaCustomService.swaMsgInfo('Selecione la órden de venta.');
      return false;
    }

    if(this.modeloFormCab2.controls['docNum'].value)
    {
      if(!this.modeloFormCab2.controls['numOrdenCompra'].value)
      {
        this.swaCustomService.swaMsgInfo('La órden de venta seleccionada no tiene el número de OC asignado.');
        return false;
      }
    }

    if (!this.modeloFormCab2.controls['estado'].value) {
      this.swaCustomService.swaMsgInfo('Seleccione el estado.');
      return false;
    }

    if(!this.modeloFormCab2.controls['docDate'].value)
    {
      this.swaCustomService.swaMsgInfo('La fecha de contabilización no es válida.');
      return false;
    }

    if(!this.modeloFormCab2.controls['docDueDate'].value)
    {
      this.swaCustomService.swaMsgInfo('La fecha de contabilización no es válida.');
      return false;
    }

    if(!this.modeloFormCab2.controls['taxDate'].value)
    {
      this.swaCustomService.swaMsgInfo('La fecha de contabilización no es válida.');
      return false;
    }

    return true;
  }

  onToSave() {
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

  back() {
    this.router.navigate(['/main/modulo-ven/panel-sodimac-ov-list']);
  }
}
