import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IArticuloReporte } from '../../../interfaces/articulo.interface';
import { IGrupoArticulo, ISubGrupoArticulo2, ISubGrupoArticulo } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/grupo-articulo-sap.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ArticuloService } from '../../../services/articulo.service';
import { GrupoArticuloService } from '../../../../modulo-gestion/services/sap/definiciones/inventario/grupo-articulo-sap.service';
import { SubGrupoArticuloService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/sub-grupo-articulo-sap.service';
import { SubGrupoArticulo2Service } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/sub-grupo-articulo2-sap.service';
import { UtilService } from 'src/app/services/util.service';



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
  params              : FilterRequestModel = new FilterRequestModel();
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
  private ArticuloService: ArticuloService,
  private grupoArticuloService: GrupoArticuloService,
  private subGrupoArticuloService: SubGrupoArticuloService,
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
    this.grupoArticuloService.getList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: IGrupoArticulo[]) => {
        this.grupoArticuloList = data.map(i => ({ label: i.itmsGrpNam, value: i.itmsGrpCod }));
        const codes = data.map(i => i.itmsGrpCod);
        this.modeloForm.get('msGrupo')?.setValue(codes);
      },
      error: (e) => {
        this.isDisplay = false;
        this.utilService.handleErrorSingle(e, 'getListGrupoArticulo', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  getListSubGrupoArticulo() {
    this.subGrupoArticuloService.getList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: ISubGrupoArticulo[]) => {
        this.subGrupoArticuloList = data.map(i => ({ label: i.name, value: i.code }));
        const codes = data.map(i => i.code);
        this.modeloForm.get('msSubGrupo')?.setValue(codes);
      },
      error: (e) => {
        this.isDisplay = false;
        this.utilService.handleErrorSingle(e, 'getListSubGrupoArticulo', () => { this.isDisplay = false; }, this.swaCustomService);
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
        this.isDisplay = false;
        this.utilService.handleErrorSingle(e, 'getListSubGrupoArticulo2', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();

    const grupoVals: string[] = this.modeloForm.controls['msGrupo']?.value || [];
    const subGrupoVals: string[] = this.modeloForm.controls['msSubGrupo']?.value || [];
    const subGrupo2Vals: string[] = this.modeloForm.controls['msSubGrupo2']?.value || [];

    this.params.cod1 = (grupoVals && grupoVals.length > 0) ? grupoVals.join(',') : '';
    this.params.cod2 = (subGrupoVals && subGrupoVals.length > 0) ? subGrupoVals.join(',') : '';
    this.params.cod3 = (subGrupo2Vals && subGrupo2Vals.length > 0) ? subGrupo2Vals.join(',') : '';

    this.params.val1 = this.modeloForm.controls['excluirInactivos'].value === true ? 1 : 0;
    this.params.val2 = this.modeloForm.controls['excluirSinStock'].value  === true ? 1 : 0;
    this.params.val4 = this.modeloForm.controls['invntItem'].value        === true ? 1 : 0;
    this.params.val3 = this.modeloForm.controls['sellItem'].value         === true ? 1 : 0;
    this.params.val5 = this.modeloForm.controls['prchseItem'].value       === true ? 1 : 0;
  }

  onListar() {
    this.isDisplay = true;
    this.reporteList = [];
    this.onSetParametro();
    this.ArticuloService.getListArticuloByGrupoSubGrupoFiltro(this.params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: IArticuloReporte[]) => {
        this.isDisplay = false;
        this.reporteList = data;
      },
      error: (e) => {
        this.isDisplay = false;
        this.utilService.handleErrorSingle(e, 'getListArticuloByGrupoSubGrupoFiltro', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ArticuloService.getListArticuloExcelByGrupoSubGrupoFiltro(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          saveAs(new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), this.nombreArchivo);
          this.isDisplay = false;
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.isDisplay = false;
          this.utilService.handleErrorSingle(e, 'getListArticuloExcelByGrupoSubGrupoFiltro', () => { this.isDisplay = false; }, this.swaCustomService);
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
