import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { FilterRequestModel } from 'src/app/models/filter-request.model';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { DeliveryNotesService } from '../../../services/sap-business-one/delivery-notes.service';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';



@Component({
  selector: 'app-ven-panel-guia-by-fecha',
  templateUrl: './panel-guia-by-fecha.component.html',
  styleUrls: ['./panel-guia-by-fecha.component.css']
})
export class PanelGuiaByFechaComponent implements OnInit, OnDestroy {
  modeloForm: FormGroup;
  subscription: Subscription;

  // Titulo del componente
  titulo = 'Guías';
  subtitulo = 'Guías';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;

  empleadoVentaList: SelectItem[];
  empleadoVentaSelected: ISalesPersons[];
  reporteList: any[];
  findModel: FilterRequestModel = new FilterRequestModel();

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Guías - ' + this.fecha;


  constructor
  (
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private salesPersonsService: SalesPersonsService
  ) {}

  ngOnInit() {
    this.modeloForm = this.fb.group(
      {
        'dat1'                : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'dat2'                : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      });

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-guia-by-fecha');

    this.getListEmpleadoVenta();
  }

  getListEmpleadoVenta() {
    this.salesPersonsService.getList()
    .subscribe({next:(data: ISalesPersons[]) =>{
        this.empleadoVentaList = [];
        this.empleadoVentaSelected = [];

        for (let item of data) {
          this.empleadoVentaSelected.push({ slpCode: item.slpCode, slpName: item.slpName });
          this.empleadoVentaList.push({ label: item.slpName, value: { slpCode: item.slpCode, slpName: item.slpName } });
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
    this.findModel = this.modeloForm.getRawValue();
    this.findModel.cod1 = this.empleadoVentaSelected.map(x=> x.slpCode).join(",");;
  }

  onListar() {
    // this.isDisplay = true;
    // this.reporteList = [];
    // this.onSetParametro();
    // this.DeliveryNotesService.getListGuiaByFecha(this.findModel)
    // .subscribe({next:(data: IGuiaSapByFecha[]) =>{
    //   if(data)
    //   {
    //     this.isDisplay = false;
    //     this.reporteList = data;
    //   }
    //   this.isDisplay = false;
    //   },error:(e)=>{
    //     this.isDisplay = false;
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  onToExcel() {
    // this.isDisplay = true;
    // this.onSetParametro();
    // this.deliveryNotesService.getGuiaExcelByFecha(this.findModel)
    // .subscribe({next:(response: any) => {
    //   saveAs(
    //     new Blob([response],
    //     {
    //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     }),
    //     this.nombreArchivo
    //   );
    //   this.isDisplay = false;
    //   this.swaCustomService.swaMsgExito(null);
    //   },error:(e)=>{
    //     this.isDisplay = false;
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
