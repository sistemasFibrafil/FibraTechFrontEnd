import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { ISop } from '../../../interfaces/web/sop.interface';
import { IMes } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/mes.interface';
import { IAnio } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/anio.interface';
import { ISemana } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/semana.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { SopService } from '../../../services/web/sop.service';
import { TiempoService } from 'src/app/modulos/modulo-gestion/services/web/definiciones/general/tiempo.service';

@Component({
  selector: 'app-ven-panel-sop-list',
  templateUrl: './panel-sop-list.component.html',
  styleUrls: ['./panel-sop-list.component.css']
})
export class PanelSopListComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'S&OP';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDataBlob: Blob;
  isDisplay: Boolean = false;
  isDeleting: boolean = false;
  isDisplayVisor: boolean = false;
  isDisplayGenerandoVisor: boolean = false;

  columnas: any[];
  opciones: any[];

  modeloDelete    : ISop;
  modeloSelected  : ISop;
  list            : ISop[] = [];

  listAnio: SelectItem[];
  listMes: SelectItem[];
  listSemana: SelectItem[];

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Proyección - Ventas -' + this.fecha;

  params: FilterRequestModel = new FilterRequestModel();


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private sopService: SopService,
    private tiempoService: TiempoService
  ) {}


  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    this.getListAnio();
    this.getListMes();
    this.getListSemana();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
      'year'        : new FormControl('', Validators.compose([Validators.required])),
      'month'       : new FormControl('', Validators.compose([Validators.required])),
      'week'        : new FormControl(''),
      'text1'       : new FormControl('')
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-sop-list');
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'codYear',         header: 'Año' },
      { field: 'namMonth',        header: 'Mes' },
      { field: 'namWeek',         header: 'Semana' },
      { field: 'name',            header: 'Nombre' },
      { field: 'comments',        header: 'Comentarios' }
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { label: 'Editar',      icon: 'pi pi-pencil',                   command: () => { this.onClickEdit() } },
      { label: 'Eliminar',    icon: 'pi pi-times',                    command: () => { this.onClickDelete() } },
      { label: 'Exportar',    icon: 'pi pi-file-excel',               command: () => { this.onClickExcel() } },
    ];
  }

  onSelectedItem(modelo: ISop) {
    this.modeloSelected = modelo;
    if(!this.buttonAcces.btnEditar){
      this.opciones.find(x => x.label == "Editar").visible = true;
    } else {
      this.opciones.find(x => x.label == "Editar").visible = false;
    }
    if(!this.buttonAcces.btnEliminar){
      this.opciones.find(x => x.label == "Eliminar").visible = true;
    } else {
      this.opciones.find(x => x.label == "Eliminar").visible = false;
    }
    if(!this.buttonAcces.btnEXCEL){
      this.opciones.find(x => x.label == "Exportar").visible = true;
    } else {
      this.opciones.find(x => x.label == "Exportar").visible = false;
    }
    // if(!this.buttonAcces.btnVer){
    //   this.opciones.find(x => x.label == "Visualizar").visible = true;
    // } else {
    //   this.opciones.find(x => x.label == "Visualizar").visible = false;
    // }
  }

  getListAnio() {
    this.listAnio = [];
    this.tiempoService.getListAnio()
    .subscribe({next:(data: IAnio[]) =>{
        this.listAnio = [];
        for (let item of data) {
          this.listAnio.push({ label: item.nomAnio, value: item.codAnio });
        }

        const anioActual = new Date().getFullYear();
        const item: any = this.listAnio.find(x => x.value === anioActual);
        this.modeloForm.controls['year'].setValue({ label: item.label, value: item.value });

        this.getListSemana();
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListMes() {
    this.listMes = [];
    this.tiempoService.getListMes()
    .subscribe({next:(data: IMes[]) =>{
        this.listMes = [];
        for (let item of data) {
          this.listMes.push({ label: item.nomMes, value: item.codMes });
        }

        const mesActual=new Date().getMonth() + 1;
        const item: any = this.listMes.find(x => x.value === mesActual);
        this.modeloForm.controls['month'].setValue({ label: item.label, value: item.value });

        this.getListSemana();
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onSetParametro()
  {
    let year      : number = 0;
    let month     : number = 0;
    let week      : number = 0;

    this.params = this.modeloForm.getRawValue();

      if (this.modeloForm.controls['year'].value) {
        let itemYear = this.modeloForm.controls['year'].value;
        year = itemYear.value;
      }

      if (this.modeloForm.controls['month'].value) {
        let itemMonth = this.modeloForm.controls['month'].value;
        month = itemMonth.value;
      }

      if (this.modeloForm.controls['week'].value) {
        let itemWeek = this.modeloForm.controls['week'].value;
        week = itemWeek.value;
      }

      this.params.id1 = year;
      this.params.id2 = month;
      this.params.id3 = week;
  }

  getListSemana() {
    this.listSemana = [];
    this.onSetParametro();

    if(this.params.id1 === 0 || this.params.id2 === 0)
    {
      return;
    }

    this.tiempoService.getListSemana(this.params)
    .subscribe({next:(data: ISemana[]) =>{
        this.listSemana = [];
        for (let item of data) {
          this.listSemana.push({ label: item.nomSemana, value: item.codSemana });
        }
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getList() {
    this.isDisplay = true;
    this.onSetParametro();
    this.sopService.getListFiltro(this.params)
    .subscribe({next:(data: ISop[]) =>
    {
      this.isDisplay = false;
      this.list = data;
    },error:(e)=>{
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    }
    });
  }

  onClickSeach() {
    this.getList();
  }

  onClickCreate() {
    this.router.navigate(['/main/modulo-ven/panel-ov-seguimiento-detallado-direccion-fiscal-by-filter']);
  }

  onClickEdit(){
    this.router.navigate(['/main/modulo-ven/panel-sop-update', this.modeloSelected.id]);
  }

  delete() {
    this.isDeleting = true;
    const value: any = { id: this.modeloSelected.id };
    this.sopService.setDelete(value)
    .subscribe({ next: (resp:any)=>{
        this.getList();
        this.isDeleting = false;
        this.swaCustomService.swaMsgExito(null);
      },
      error:(e)=>{
        this.isDeleting = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickDelete()
  {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleEliminar,
      this.globalConstants.subTitleEliminar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.delete();
      }
    });
  }

  onClickExcel() {
    this.isDisplay = true;
    const value = { id1: this.modeloSelected.id };
    this.sopService.getSopExcelById(value)
    .subscribe({next:(response: any) => {
        saveAs(
          new Blob([response],
          {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          this.nombreArchivo + this.fecha
        );
        this.isDisplay = false;
        this.swaCustomService.swaMsgExito(null);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickView(){
    this.router.navigate(['/main/modulo-ven/panel-solicitud-traslado-view', this.modeloSelected.id]);
  }
}
