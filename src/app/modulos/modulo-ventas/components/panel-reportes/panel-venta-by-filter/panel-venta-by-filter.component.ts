import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IVentaByFecha } from 'src/app/modulos/modulo-ventas/interfaces/factura-venta.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/sales-persons.interface';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { FacturaVentaService } from '../../../services/sap/factura-venta-sap.service';
import { VentaByFilterFindModel } from '../../../models/factura-venta.model';



@Component({
  selector: 'app-ven-panel-venta-by-filter',
  templateUrl: './panel-venta-by-filter.component.html',
  styleUrls: ['./panel-venta-by-filter.component.css']
})
export class PanelVentaByFilterComponent implements OnInit {
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
  reporteList             : IVentaByFecha[];
  params                  : VentaByFilterFindModel = new VentaByFilterFindModel();
  fecha                   : string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo           : string = 'Ventas - ' + this.fecha;


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private facturaVentaService: FacturaVentaService,
    private salesPersonsService: SalesPersonsService
  ) {}

  ngOnInit() {
    this.modeloForm = this.fb.group(
      {
        'startDate'           : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'endDate'             : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'msSalesEmployee'     : new FormControl('', Validators.compose([Validators.required])),
        'customer'            : new FormControl(''),
        'item'                : new FormControl(''),
      });

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-venta-by-filter');

    this.getListEmpleadoVenta();
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
    this.reporteList = [];
    this.onSetParametro();
    this.facturaVentaService.getListVentaByFilter(this.params)
    .subscribe({next:(data: IVentaByFecha[]) =>{
      if(data)
      {
        this.isDisplay = false;
        this.reporteList = data;
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
    this.facturaVentaService.getListVentaByFilterExcel(this.params)
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
