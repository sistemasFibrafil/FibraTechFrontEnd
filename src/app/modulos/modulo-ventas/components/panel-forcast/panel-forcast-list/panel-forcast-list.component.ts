import { saveAs } from 'file-saver';
import { MenuItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IForcastVentaByFecha } from '../../../interfaces/web/forcast-venta.interface';
import { ForCastVentaService } from '../../../services/web/forcast-venta.service';



@Component({
  selector: 'app-ven-panel-forcast-list',
  templateUrl: './panel-forcast-list.component.html',
  styleUrls: ['./panel-forcast-list.component.css']
})
export class PanelForcastListComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'Forcast de Venta';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  items: MenuItem[];
  columnas: any[];
  opciones: any = [];

  modeloDelete: IForcastVentaByFecha;
  modeloSelected: IForcastVentaByFecha;
  list: IForcastVentaByFecha[] = [];

  isDisplay: Boolean = false;
  isDeleting: Boolean = false;

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Forcast de Venta - ' + this.fecha;

  //MODAL:
  isImport: Boolean = false;
  isImportPlantilla: Boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private forCastVentaService: ForCastVentaService,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService
  ) {}


  ngOnInit() {
    this.onBuildForm();
    this.opcionesItem();
    this.opcionesTabla();

    if(!this.buttonAcces.btnBuscar){ this.onListar(); }
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
      'fecInicial'  : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'fecFinal'    : new FormControl(new Date(new Date()), Validators.compose([Validators.required]))
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-forcast-list');
  }

  opcionesItem() {
    this.items = [
      {
        label: 'Exportar plantilla', icon: 'pi pi-file-export', command: () => { this.onToExportExcel() }
      },
      {
        label: 'Importar plantilla', icon: 'pi pi-file-import', command: () => { }
      }
  ];

  }

  opcionesTabla() {
    this.opciones = [
      { label: 'Editar',      icon: 'pi pi-pencil',         command: () => { this.editar() } },
      { label: 'Eliminar',    icon: 'pi pi-trash',          command: () => { this.eliminar() } },
    ];
  }


  onListar() {
    this.isDisplay = true;
    const find = this.modeloForm.getRawValue();
    this.forCastVentaService.getListForcastVentaByFecha(find)
    .subscribe({next:(data: IForcastVentaByFecha[]) =>
    {
      this.isDisplay = false;
      this.list = data;
    },error:(e)=>{
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    }
    });
  }

  onToBuscar() {
    this.onListar();
  }

  onToCreate() {
    this.router.navigate(['/main/modulo-ve/panel-forcast-create']);
  }

  onToExportExcel() {
    this.isDisplay = true;
    this.forCastVentaService.getForcastVentaPlantillaExcel()
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

  onToImportExcel() {
    this.isImport = !this.isImport;
  }

  onToCancelImport(event)
  {
    this.isImport = !this.isImport;
  }


  onToItemSelected(modelo: IForcastVentaByFecha) {
    this.modeloSelected = modelo;
  }

  guiar(){
    this.router.navigate(['/main/modulo-ve/panel-forcast-create']);
  }

  editar(){
    this.router.navigate(['/main/modulo-ve/panel-forcast-update', this.modeloSelected.idForcastVenta]);
  }

  onToDelete() {
    this.isDeleting = true;
    this.forCastVentaService.setDelete(this.modeloSelected.idForcastVenta)
    .subscribe({ next: (resp:any)=>{
        this.onListar();
        this.isDeleting = false;
        this.swaCustomService.swaMsgExito(null);
      },
      error:(e)=>{
        this.isDeleting = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  eliminar()
  {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleEliminar,
      this.globalConstants.subTitleEliminar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.onToDelete();
      }
    });
  }
}
