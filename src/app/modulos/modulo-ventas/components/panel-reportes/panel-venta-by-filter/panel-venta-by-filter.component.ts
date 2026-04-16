import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { VentaByFilterFindModel } from '../../../models/factura-venta.model';

import { TableColumn } from 'src/app/interface/common-ui.interface';
import { IVentaByFecha } from 'src/app/modulos/modulo-ventas/interfaces/factura-venta.interface';
import { FacturaVentaService } from '../../../services/sap-business-one/factura-venta-sap.service';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';


@Component({
  selector: 'app-ven-panel-venta-by-filter',
  templateUrl: './panel-venta-by-filter.component.html',
  styleUrls: ['./panel-venta-by-filter.component.css']
})
export class PanelVentaByFilterComponent implements OnInit {
  // Lifecycle management
    private readonly destroy$                     = new Subject<void>();
  modeloForm              : FormGroup;

  // Titulo del componente
  titulo                  = 'Ventas';
  subtitulo               = 'Ventas';
  // Acceso de botones
  buttonAcces             : ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants         : GlobalsConstantsForm = new GlobalsConstantsForm();
  // Opcion Buscar
  isDisplay               : boolean = false;
  salesEmployeesList      : SelectItem[];
  salesEmployeeSelected   : ISalesPersons[];
  modelo                  : IVentaByFecha[];
  params                  : VentaByFilterFindModel = new VentaByFilterFindModel();
  columnas                : TableColumn[] = [];

  readonly nombreArchivo  = `Ventas -  ${this.utilService.fecha_DD_MM_YYYY()}`;

  // Paginación de la tabla
  rows                    = 20;
  rowsPerPageOptions      = [20, 40, 60, 80, 100];


  constructor
  (
    private readonly fb: FormBuilder,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly facturaVentaService: FacturaVentaService,
    private readonly salesPersonsService: SalesPersonsService,
    public  readonly utilService: UtilService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.getListEmpleadoVenta();
    this.onBuildColumn();
  }

  onBuildForm() {
    const today = new Date();

    this.modeloForm = this.fb.group({
      startDate       : [today, Validators.required],
      endDate         : [today, Validators.required],
      msSalesEmployee : ['', Validators.required],
      customer        : [''],
      item            : ['']
    });

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-venta-by-filter');
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'cardCode',                header: 'Código de Cliente' },
      { field: 'cardName',                header: 'Nombre de Cliente' },
      { field: 'tipoDocumento',           header: 'Tipo de Documento' },
      { field: 'fecContabilizacion',      header: 'Fecha de Contabilización' },
      { field: 'numeroDocumento',         header: 'Número de Documento' },
      { field: 'numeroGuia',              header: 'Número de Guía' },
      { field: 'numeroPedido',            header: 'Número de Pedido' },
      { field: 'fechaPedido',             header: 'Fecha de Pedido' },
      { field: 'nomVendedor',             header: 'Vendedor' },
      { field: 'itemCode',                header: 'Código de Artículo' },
      { field: 'itemName',                header: 'Nombre de Artículo' },
      { field: 'nomGrupo',                header: 'Grupo' },
      { field: 'unidadMedida',            header: 'UM' },
      { field: 'cantidad',                header: 'Cantidad' },
      { field: 'pesoItem',                header: 'Peso Item' },
      { field: 'pesoPromedioKg',          header: 'Peso Promedio Kg' },
      { field: 'peso',                    header: 'Peso' },
      { field: 'rolloVendido',            header: 'Rol Vendido' },
      { field: 'kgVendido',               header: 'kg Vendido' },
      { field: 'toneladaVendida',         header: 'Tn Vendida' },
      { field: 'codMoneda',               header: 'Moneda' },
      { field: 'tipoCambio',              header: 'TC' },
      { field: 'precio',                  header: 'Precio' },
      { field: 'precioKg',                header: 'Precio Kg' },
      { field: 'costoSOL',                header: 'Costo SOL' },
      { field: 'costoUSD',                header: 'Costo USD' },
      { field: 'totalCostoItemSOL',       header: 'CosTotal Costo Item SOL' },
      { field: 'totalCostoItemUSD',       header: 'Total Costo Item USD' },
      { field: 'totalItemSOL',            header: 'Total Item SOL' },
      { field: 'totalItemUSD',            header: 'Total Item USD' },
    ];
  }

  getListEmpleadoVenta() {
    this.salesPersonsService.getList()
    .subscribe({next:(data: ISalesPersons[]) =>{
        this.salesEmployeesList = [];
        this.salesEmployeeSelected = [];

        for (let item of data) {
          this.salesEmployeeSelected.push({ slpCode: item.slpCode, slpName: item.slpName });
          this.salesEmployeesList.push({ label: item.slpName, value: { slpCode: item.slpCode, slpName: item.slpName } });
        }
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    this.params.salesEmployee = this.salesEmployeeSelected.map(x=> x.slpCode).join(",");;
  }

  onListar() {
    this.isDisplay = true;
    this.modelo = [];
    this.onSetParametro();
    this.facturaVentaService
    .getListVentaByFilter(this.params)
    .subscribe({next:(data: IVentaByFecha[]) =>{
      if(data)
      {
        this.isDisplay = false;
        this.modelo = data;
      }
      this.isDisplay = false;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.facturaVentaService
    .getListVentaByFilterExcel(this.params)
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
}
