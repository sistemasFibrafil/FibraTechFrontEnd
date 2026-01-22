import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IMovimientoStockByFechaSede } from '../../../interfaces/articulo.interface';
import { LocationService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/location.service';
import { ArticuloService } from '../../../services/articulo.service';
import { MovimientoStokByFechaSedeFindModel } from '../../../models/articulo.model';
import { ILocation } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/location.interface';
import { takeUntil } from 'rxjs/operators';
import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';


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
  list                              : IMovimientoStockByFechaSede[];

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
    private readonly ArticuloService: ArticuloService,
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
        // opciones con value = código
        this.locationList = data.map(i => ({ label: i.location, value: i.code }));
        const codes = data.map(i => i.code);
        this.modeloForm.get('mslocation')?.setValue(codes);
      },
      error: (e) => {
        this.isDisplay = false;
        this.utilService.handleErrorSingle(e, 'getListSede', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  private getListTipoMovimiento(): void {
    const typeMovimiento = this.localDataService.getListTypeMovimiento();
    this.typeMovementList = typeMovimiento.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('mstypeMovement')?.setValue(typeMovimiento);
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    // Capturamos todos los valores del formulario
    this.params = this.modeloForm.getRawValue();
    // Extraemos los códigos seleccionados de los p-multiSelect (mslocation)
    const selectedLocationCodes: string[] = (this.modeloForm.controls['mslocation']?.value) || [];
    this.params.location = (selectedLocationCodes && selectedLocationCodes.length > 0) ? selectedLocationCodes.join(',') : '';
    // Extraemos los códigos seleccionados de tipo de movimiento (mstypeMovement)
    const selectedTypeCodes = this.modeloForm.value.mstypeMovement || [];
    this.params.typeMovement = selectedTypeCodes.map(x => x.code).join(',');
  }

  onListar() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ArticuloService.getListMovimientoStockByFechaSede(this.params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: IMovimientoStockByFechaSede[]) => {
        this.isDisplay = false;
        this.list = data;
      },
      error: (e) => {
        this.isDisplay = false;
        this.utilService.handleErrorSingle(e, 'getListMovimientoStockByFechaSede', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ArticuloService.getMovimientoStockExcelByFechaSede(this.params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        saveAs(new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), this.nombreArchivo);
        this.isDisplay = false;
        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.isDisplay = false;
        this.utilService.handleErrorSingle(e, 'getMovimientoStockExcelByFechaSede', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
