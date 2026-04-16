import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { finalize, takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';

import { IArticuloReporte } from '../../../interfaces/items.interface';
import { IGrupoArticulo, ISubGrupoArticulo, ISubGrupoArticulo2 } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/grupo-articulo-sap.interface';

import { UtilService } from 'src/app/services/util.service';
import { ItemsService } from '../../../services/items.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { GrupoItemsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/grupo-articulo-sap.service';
import { SubGrupoItemsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/sub-grupo-articulo-sap.service';
import { SubGrupoArticulo2Service } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/sub-grupo-articulo2-sap.service';


@Component({
  selector: 'app-inv-panel-articulo-by-grupo-sub-grupo-filtro',
  templateUrl: './panel-articulo-by-grupo-sub-grupo-filtro.component.html',
  styleUrls: ['./panel-articulo-by-grupo-sub-grupo-filtro.component.css']
})
export class PanelArticuloByGrupoSubGrupoFiltroComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  modeloForm          : FormGroup;

  // Título del componente
  titulo              = 'Artículos por grupo - subgrupo';
  subtitulo           = 'Artículos por grupo - subgrupo';

  // Nombre de los botones de acción / Acceso a botones
  globalConstants     : GlobalsConstantsForm = new GlobalsConstantsForm();
  buttonAcces         : ButtonAcces = new ButtonAcces();

  // Estado de la interfaz (UI)
  isDisplay           : boolean = false;

  // Listas y columnas
  grupoArticuloList   : SelectItem[];
  subGrupoArticuloList: SelectItem[];
  subGrupoArticulo2List: SelectItem[];

  // Resultados y parámetros
  reporteList         : IArticuloReporte[];
  columnas            : any[];

  // Fecha y archivo de exportación
  fecha               : string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo       : string = 'Artículos por grupo - subgrupo -' + this.fecha;


  constructor(
  private router: Router,
  private fb: FormBuilder,
  private datePipe: DatePipe,
  private readonly swaCustomService: SwaCustomService,
  private readonly accesoOpcionesService: AccesoOpcionesService,
  private itemsService: ItemsService,
  private grupoItemsService: GrupoItemsService,
  private subGrupoItemsService: SubGrupoItemsService,
  private subGrupoArticulo2Service: SubGrupoArticulo2Service,
  private readonly utilService: UtilService) {}

  ngOnInit() {

    this.modeloForm = this.fb.group(
      {
        'excluirInactivos'    : new FormControl({value: true,   disabled: false}),
        'excluirSinStock'     : new FormControl({value: true,   disabled: false}),
        'invntItem'           : new FormControl({value: true,   disabled: false}),
        'sellItem'            : new FormControl({value: false,  disabled: false}),
        'prchseItem'          : new FormControl({value: false,  disabled: false}),
        'msGrupo'             : new FormControl([], Validators.compose([Validators.required])),
        'msSubGrupo'          : new FormControl([], Validators.compose([Validators.required])),
        'msSubGrupo2'         : new FormControl([], Validators.compose([Validators.required])),
        'text1'               : new FormControl(''),
      }
    );

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-articulo-by-grupo-sub-grupo-filtro');

    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'nomGrupo',        header: 'Grupo' },
      { field: 'nomSubGrupo',     header: 'SubGrupo' },
      { field: 'nomSubGrupo2',    header: 'SubGrupo 2' },
      { field: 'salUnitMsr',      header: 'UM' },
      { field: 'onHand',          header: 'Stock' },
      { field: 'isCommited',      header: 'Comprometido' },
      { field: 'onOrder',         header: 'Solicitado' },
      { field: 'available',       header: 'Disponible' },
      { field: 'PesoPromedioKg',  header: 'Peso Promedio Kg' }
    ];

    this.reporteList = [];

    this.getListGrupoArticulo();
    this.getListSubGrupoArticulo();
    this.getListSubGrupoArticulo2();
  }

  getListGrupoArticulo() {
    this.grupoItemsService.getList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: IGrupoArticulo[]) => {
        this.grupoArticuloList = data.map(i => ({ label: i.itmsGrpNam, value: i.itmsGrpCod }));
        const codes = data.map(i => i.itmsGrpCod);
        this.modeloForm.get('msGrupo')?.setValue(codes);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListGrupoArticulo', this.swaCustomService);
      }
    });
  }

  getListSubGrupoArticulo() {
    this.subGrupoItemsService.getList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: ISubGrupoArticulo[]) => {
        this.subGrupoArticuloList = data.map(i => ({ label: i.name, value: i.code }));
        const codes = data.map(i => i.code);
        this.modeloForm.get('msSubGrupo')?.setValue(codes);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListSubGrupoArticulo', this.swaCustomService);
      }
    });
  }

  getListSubGrupoArticulo2() {
    this.subGrupoArticulo2Service.getList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: ISubGrupoArticulo2[]) => {
        this.subGrupoArticulo2List = data.map(i => ({ label: i.name, value: i.code }));
        const codes = data.map(i => i.code);
        this.modeloForm.get('msSubGrupo2')?.setValue(codes);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListSubGrupoArticulo2', this.swaCustomService);
      }
    });
  }

  onToBuscar() {
    this.loadData();
  }


  private buildFilterParams(): any {
  const formValue = this.modeloForm.getRawValue();

  const grupoVals: string[]    = formValue.msGrupo ?? [];
  const subGrupoVals: string[] = formValue.msSubGrupo ?? [];
  const subGrupo2Vals: string[] = formValue.msSubGrupo2 ?? [];

  return {
    ...formValue,

    cod1: grupoVals.length > 0 ? grupoVals.join(',') : '',
    cod2: subGrupoVals.length > 0 ? subGrupoVals.join(',') : '',
    cod3: subGrupo2Vals.length > 0 ? subGrupo2Vals.join(',') : '',

    val1: formValue.excluirInactivos === true ? 1 : 0,
    val2: formValue.excluirSinStock  === true ? 1 : 0,
    val3: formValue.sellItem         === true ? 1 : 0,
    val4: formValue.invntItem        === true ? 1 : 0,
    val5: formValue.prchseItem       === true ? 1 : 0
  };
}

loadData(): void {
  this.isDisplay = true;
  this.reporteList = [];

  this.itemsService
    .getListArticuloByGrupoSubGrupoFiltro(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IArticuloReporte[]) => {
        this.reporteList = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  onToExcel(): void {
    this.isDisplay = true;

    this.itemsService
    .getListArticuloExcelByGrupoSubGrupoFiltro(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (response: any) => {
        saveAs(
          new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }),
          this.nombreArchivo
        );

        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onToExcel', this.swaCustomService);
      }
    });
  }

  onToSalir()
  {
    this.router.navigate(['/main/bienvenido/bienvenido']);
  }

  ngOnDestroy() {
    // complete the destroy$ subject to cancel any pending subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}
