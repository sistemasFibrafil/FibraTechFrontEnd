import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { finalize, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';

import { MovimientoStokByFechaSedeFindModel } from '../../../models/items.model';
import { IMovimientoStockByFechaSede } from '../../../interfaces/items.interface';
import { ILocation } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/location.interface';

import { UtilService } from 'src/app/services/util.service';
import { ItemsService } from '../../../services/items.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { LocationService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/location.service';


@Component({
  selector: 'app-inv-panel-movimiento-stock-by-fecha-sede',
  templateUrl: './panel-movimiento-stock-by-fecha-sede.component.html',
  styleUrls: ['./panel-movimiento-stock-by-fecha-sede.component.css']
})
export class PanelMovimientoStockByFechaSedeComponent implements OnInit, OnDestroy {
  // Cancelación de observables
  private readonly destroy$       : Subject<void> = new Subject<void>();

  // Formulario reactivo
  modeloForm                        : FormGroup;

  // Título del componente
  titulo                            = 'Movimientos de Stock';
  subtitulo                         = 'Movimientos de Stock';

  // Nombre de los botones de acción / Acceso a botones
  globalConstants                   : GlobalsConstantsForm = new GlobalsConstantsForm();
  buttonAcces                       : ButtonAcces = new ButtonAcces();

  // Estado de la interfaz (UI)
  isDisplay                         : boolean = false;

  // Listas y columnas
  locationList                      : SelectItem[];
  typeMovementList                  : SelectItem[];
  columnas                          : any[];

  // Datos mostrados
  modelo                            : IMovimientoStockByFechaSede[];

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];

  // Parámetros y filtros
  params                            : MovimientoStokByFechaSedeFindModel = new MovimientoStokByFechaSedeFindModel();

  // Fecha y archivo de exportación
  fecha                             : string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo                     : string = 'Movimientos de Stock -' + this.fecha;

  constructor
  (
    private readonly fb: FormBuilder,
    private readonly datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly utilService: UtilService,
    private readonly locationService: LocationService,
    private readonly localDataService: LocalDataService,
    private readonly itemsService: ItemsService,
  ) {}

  ngOnInit() {

    this.modeloForm = this.fb.group({
      'startDate'               : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'endDate'                 : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'mslocation'              : ['', [Validators.required]],
      'mstypeMovement'          : ['', [Validators.required]],
      'customer'                : [''],
      'item'                    : ['']
    });

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-movimiento-stock-by-fecha-sede');

    this.columnas = [
      { field: 'nomTipoMovimiento',   header: 'Tipo de movimiento' },
      { field: 'numeroGuiaSAP',       header: 'Número de Guía SAP' },
      { field: 'numeroGuiaSUNAT',     header: 'Número de Guía SUNAT' },
      { field: 'docDate',             header: 'Fecha de Guía' },
      { field: 'cardCode',            header: 'Código de Cliente' },
      { field: 'cardName',            header: 'Nombre de Cliente' },
      { field: 'usuario',             header: 'Usuario' },
      { field: 'itemCode',            header: 'Código de Artículo' },
      { field: 'itemName',            header: 'Nombre de Artículo' },
      { field: 'sede',                header: 'Sede' },
      { field: 'centroCosto',         header: 'Centro de Costo' },
      { field: 'almacenOrigen',       header: 'Almacén de Origen' },
      { field: 'almacenDestino',      header: 'Almacén de Destino' },
      { field: 'bulto',               header: 'Bulto' },
      { field: 'totalKg',             header: 'Total Kg' },
      { field: 'unidadMedida',        header: 'UM' },
      { field: 'Quantity',            header: 'Cantidad' },
      { field: 'numeroPedido',        header: 'Número de Pedido' },
      { field: 'fechaPedido',         header: 'Fecha de Pedido' },
      { field: 'numeroFacturaSAP',    header: 'Número de Factura SAP' },
      { field: 'numeroFacturaSUNAT',  header: 'Número de Factura SUNAT' },
      { field: 'u_BPP_MDNT',          header: 'Nombre de Transportista' },
      { field: 'rucTransportista',    header: 'RUC de Transportista' },
      { field: 'placaTransportista',  header: 'Placa de Transportista' },
      { field: 'u_FIB_NOM_COND',      header: 'Nombre de Conductor' },
      { field: 'lincenciaConductor',  header: 'Licencia de Conductor' },
    ];

    this.getListSede();
    this.getListTipoMovimiento();
  }

  getListSede() {
    this.locationService.getList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: ILocation[]) => {
        this.locationList = data.map(i => ({ label: i.location, value: i.code }));
        const codes = data.map(i => i.code);
        this.modeloForm.get('mslocation')?.setValue(codes);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListSede', this.swaCustomService);
      }
    });
  }

  private getListTipoMovimiento(): void {
    const typeMovimiento = this.localDataService.getListTypeMovimiento();
    this.typeMovementList = typeMovimiento.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('mstypeMovement')?.setValue(typeMovimiento);
  }

  onToBuscar() {
    this.loadData();
  }

  loadData(): void {
    this.isDisplay = true;

    this.itemsService
    .getListMovimientoStockByFechaSede(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IMovimientoStockByFechaSede[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(): MovimientoStokByFechaSedeFindModel {
    const {
      startDate,
      endDate,
      mslocation,
      mstypeMovement,
      customer,
      item
    } = this.modeloForm.getRawValue();

    return {
      startDate,
      endDate,
      location: (mslocation || []).join(','),
      typeMovement: (mstypeMovement || []).map(x => x.code).join(','),
      customer,
      item
    };
  }

  onToExcel(): void {
    this.isDisplay = true;

    this.itemsService
    .getMovimientoStockExcelByFechaSede(this.buildFilterParams())
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
