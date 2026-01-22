import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { GrupoArticuloService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/grupo-articulo-sap.service';

import { IGrupoArticulo } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/grupo-articulo-sap.interface';
import { IFacturaVentaSap, IVentaResumenSapByFechaGrupo } from 'src/app/modulos/modulo-ventas/interfaces/factura-venta.interface';
import { FacturaVentaService } from '../../../services/sap/factura-venta-sap.service';
import { FilterRequestModel } from 'src/app/models/filter-request.model';



interface Iproceso {
  id: number;
  terminado: boolean;
}

@Component({
  selector: 'app-ven-panel-venta-resumen-by-fecha-grupo',
  templateUrl: './panel-venta-resumen-by-fecha-grupo.component.html',
  styleUrls: ['./panel-venta-resumen-by-fecha-grupo.component.css']
})
export class PanelVentaResumenByFechaGrupoComponent implements OnInit, OnDestroy {
  modeloForm: FormGroup;
  subscription: Subscription;

  // Titulo del componente
  titulo = 'Ventas - Resumido';
  subtitulo = 'Ventas - Resumido';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;

  columnas1: any[];
  columnas2: any[];
  columnas3: any[];
  grupoArticuloList: SelectItem[];
  grupoArticuloSelected: IGrupoArticulo[];
  reporteList1: IVentaResumenSapByFechaGrupo[];
  reporteList2: IVentaResumenSapByFechaGrupo[];
  reporteList3: IVentaResumenSapByFechaGrupo[];

  params: FilterRequestModel = new FilterRequestModel();

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Ventas - Resumido -' + this.fecha;

  subjectEjecutarConsulta: Subject<Iproceso> = new Subject<Iproceso>();


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private grupoArticuloService: GrupoArticuloService,
    private facturaVentaService: FacturaVentaService) {}

  ngOnInit() {

    this.modeloForm = this.fb.group(
      {
        'dat1'                : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'dat2'                : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'msGrupoArticuloSap'  : new FormControl('', Validators.compose([Validators.required])),
      }
    );

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-venta-resumen-by-fecha-grupo');

    this.columnas1 = [
      { field: 'nomVendedor', header: 'Vendedor' },
      { field: 'nomGrupo', header: 'Grupo' },
      { field: 'cantidad', header: 'Cantidad' },
      { field: 'TotalItemUSD', header: 'Total USD' },
    ];
    this.columnas2 = [
      { field: 'nomVendedor', header: 'Vendedor' },
      { field: 'nomGrupo', header: 'Grupo' },
      { field: 'unidadMedida', header: 'Unidad Medida' },
      { field: 'cantidad', header: 'Cantidad' },
      { field: 'TotalItemUSD', header: 'Total USD' },
    ];
    this.columnas3 = [
      { field: 'nomVendedor', header: 'Vendedor' },
      { field: 'nomGrupo', header: 'Grupo' },
      { field: 'itemName', header: 'Artículo' },
      { field: 'unidadMedida', header: 'Unidad Medida' },
      { field: 'cantidad', header: 'Cantidad' },
      { field: 'TotalItemUSD', header: 'Total USD' },
    ];

    this.getListGrupoArticulo();
  }

  getListGrupoArticulo() {
    this.subscription = new Subscription();
    this.grupoArticuloService.getList()
    .subscribe({next:(data: IGrupoArticulo[]) =>{
        this.grupoArticuloList = [];
        this.grupoArticuloSelected = [];

        for (let item of data) {
          this.grupoArticuloSelected.push({ itmsGrpCod: item.itmsGrpCod, itmsGrpNam: item.itmsGrpNam });
          this.grupoArticuloList.push({ label: item.itmsGrpNam, value: { itmsGrpCod: item.itmsGrpCod, itmsGrpNam: item.itmsGrpNam } });
        }
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToBuscar() {
    this.subjectEjecutarConsulta.next({ id: 1, terminado: false });
    this.isDisplay = true;
    this.onListar();
    this.subjectEjecutarConsulta.next({ id: 1, terminado: true });
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    this.params.cod1 = this.grupoArticuloSelected.map(x=> x.itmsGrpCod).join(",");
  }

  onListar() {
    this.subjectEjecutarConsulta.next({ id: 2, terminado: false });
    this.isDisplay = true;
    this.reporteList1 = [];
    this.onSetParametro();
    this.facturaVentaService.getListVentaResumenByFechaGrupo(this.params)
    .subscribe({next:(data: IFacturaVentaSap) =>{
        this.reporteList1 = data.ventaResumen1;
        this.reporteList2 = data.ventaResumen2;
        this.reporteList3 = data.ventaResumen3;
        this.isDisplay = false;
        this.subjectEjecutarConsulta.next({ id: 2, terminado: true });
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToExcel() {
    this.subjectEjecutarConsulta.next({ id: 5, terminado: false });
    this.isDisplay = true;
    this.onSetParametro();
    this.subscription = new Subscription();
    this.facturaVentaService.getVentaResumenExcelByFechaGrupo(this.params)
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
        this.subjectEjecutarConsulta.next({ id: 5, terminado: true });
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
