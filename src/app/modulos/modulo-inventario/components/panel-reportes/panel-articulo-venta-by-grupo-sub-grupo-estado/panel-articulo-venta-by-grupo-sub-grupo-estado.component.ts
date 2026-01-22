import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IArticuloVentaByGrupoSubGrupoEstado } from '../../../interfaces/articulo.interface';
import { IGrupoArticulo, ISubGrupoArticulo2, ISubGrupoArticulo } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/grupo-articulo-sap.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ArticuloService } from '../../../services/articulo.service';
import { GrupoArticuloService } from '../../../../modulo-gestion/services/sap/definiciones/inventario/grupo-articulo-sap.service';
import { SubGrupoArticuloService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/sub-grupo-articulo-sap.service';
import { SubGrupoArticulo2Service } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/sub-grupo-articulo2-sap.service';



interface IEstadoArticulo
{
  codEstado: string;
  nomEstado: string;
}

@Component({
  selector: 'app-inv-panel-articulo-venta-by-grupo-sub-grupo-estado',
  templateUrl: './panel-articulo-venta-by-grupo-sub-grupo-estado.component.html',
  styleUrls: ['./panel-articulo-venta-by-grupo-sub-grupo-estado.component.css']
})
export class PanelArticuloVentaByGrupoSubGrupoEstadoComponent implements OnInit, OnDestroy {
  modeloForm: FormGroup;
  subscription: Subscription;

  // Titulo del componente
  titulo = 'Artículos de Venta';
  subtitulo = 'Artículos de Venta';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;

  grupoArticuloList: SelectItem[];
  estadoArticuloList: SelectItem[];
  subGrupoArticuloList: SelectItem[];
  subGrupoArticulo2List: SelectItem[];

  grupoArticuloSelected: IGrupoArticulo[];
  estadoArticuloSelected: IEstadoArticulo[];
  subGrupoArticuloSelected: ISubGrupoArticulo[];
  subGrupoArticulo2Selected: ISubGrupoArticulo2[];

  lista: IEstadoArticulo[];
  reporteList: IArticuloVentaByGrupoSubGrupoEstado[];
  params: FilterRequestModel = new FilterRequestModel();

  columnas: any[];

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Artículos de Venta -' + this.fecha;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private ArticuloService: ArticuloService,
    private grupoArticuloService: GrupoArticuloService,
    private subGrupoArticuloService: SubGrupoArticuloService,
    private subGrupoArticulo2Service: SubGrupoArticulo2Service) {}

  ngOnInit() {
    this.modeloForm = this.fb.group(
      {
        'msGrupo' : new FormControl('', Validators.compose([Validators.required])),
        'msSubGrupo' : new FormControl('', Validators.compose([Validators.required])),
        'msSubGrupo2' : new FormControl('', Validators.compose([Validators.required])),
        'msEstadoArticulo' : new FormControl('', Validators.compose([Validators.required])),
      }
    );

    this.columnas = [
      { field: 'itemCode', header: 'Código de Artículo' },
      { field: 'itemName', header: 'Nombre de Artículo' },
      { field: 'nomGrupo', header: 'Grupo' },
      { field: 'nomSubGrupo', header: 'SubGrupo' },
      { field: 'nomSubGrupo2', header: 'SubGrupo 2' },
      { field: 'nomEstado', header: 'Estado' },
      { field: 'unidadVenta', header: 'UM' },
      { field: 'pesoItem', header: 'Peso Item' },
      { field: '"PesoPromedioKg"', header: 'Peso Promedio Kg' }
    ];

    this.lista =
    [
      { codEstado: 'Y', nomEstado: 'ACTIVO' },
      { codEstado: 'N', nomEstado: 'INACTIVO' },
    ];

    this.getListGrupoArticulo();
    this.getListSubGrupoArticulo();
    this.getListSubGrupoArticulo2();
    this.getListEstadoArticulo();

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-articulo-venta-by-grupo-sub-grupo-estado');
  }

  getListGrupoArticulo() {
    this.grupoArticuloList = [];
    this.grupoArticuloService.getList()
    .subscribe({next:(data: IGrupoArticulo[]) =>{
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

  getListSubGrupoArticulo() {
    this.subGrupoArticuloList = [];
    this.subGrupoArticuloService.getList()
    .subscribe({next:(data: ISubGrupoArticulo[]) =>{
      this.subGrupoArticuloSelected = [];

        for (let item of data) {
          this.subGrupoArticuloSelected.push({ code: item.code, name: item.name });
          this.subGrupoArticuloList.push({ label: item.name, value: { code: item.code, name: item.name } });
        }
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListSubGrupoArticulo2() {
    this.subGrupoArticulo2List = [];
    this.subGrupoArticulo2Service.getList()
    .subscribe({next:(data: ISubGrupoArticulo2[]) =>{
      this.subGrupoArticulo2Selected = [];

        for (let item of data) {
          this.subGrupoArticulo2Selected.push({ code: item.code, name: item.name });
          this.subGrupoArticulo2List.push({ label: item.name, value: { code: item.code, name: item.name } });
        }
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListEstadoArticulo() {
    this.estadoArticuloList = [];
    this.estadoArticuloSelected = [];

    for (let item of this.lista) {
      this.estadoArticuloSelected.push({ codEstado: item.codEstado, nomEstado: item.nomEstado });
      this.estadoArticuloList.push({ label: item.nomEstado, value: { codEstado: item.codEstado, nomEstado: item.nomEstado } });
    }
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    this.params.cod1 = this.grupoArticuloSelected.map(x=> x.itmsGrpCod).join(",");
    this.params.cod2 = this.subGrupoArticuloSelected.map(x=> x.code).join(",");
    this.params.cod3 = this.subGrupoArticulo2Selected.map(x=> x.code).join(",");
    this.params.cod4 = this.estadoArticuloSelected.map(x=> x.codEstado).join(",");
  }

  onListar() {
    this.isDisplay = true;
    this.reporteList = [];
    this.onSetParametro();
    this.ArticuloService.getListArticuloVentaByGrupoSubGrupoEstado(this.params)
    .subscribe({next:(data: IArticuloVentaByGrupoSubGrupoEstado[]) =>{
        this.isDisplay = false;
        this.reporteList = data;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ArticuloService.getArticuloVentaExcelByGrupoSubGrupoEstado(this.params)
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

  onToSalir()
  {
    this.router.navigate(['/main/bienvenido/bienvenido']);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
