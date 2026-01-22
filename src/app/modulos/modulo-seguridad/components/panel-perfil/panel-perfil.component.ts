import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { SwaCustomService } from '../../../../services/swa-custom.service';
import { GlobalsConstantsForm } from '../../../../constants/globals-constants-form';
import { AccesoOpcionesService } from '../../../../services/acceso-opciones.service';

import { PerfilModel } from '../../models/pefil.model';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-seg-panel-perfil',
  templateUrl: './panel-perfil.component.html',
  styleUrls: ['./panel-perfil.component.css']
})
export class PanelPerfilComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Perfil';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  descripcionFind = '';
  modeloFind: PerfilModel;
  listModelo: PerfilModel[];
  listItemPermiso: SelectItem[];

  columnas: any[];

  // Opcion Editar
  modelocloned: { [s: string]: PerfilModel; } = {};

  // Opcion Eliminar
  modeloEliminar: PerfilModel;

  subscription: Subscription;

  constructor
  (
    private router: Router,
    private perfilService: PerfilService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly swaCustomService: SwaCustomService
  ) {}

  ngOnInit() {

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-seg-panel-perfil');

    this.columnas = [
      { header: 'Codigo' },
      { header: 'Descripcion' },
      { header: 'Activo' }
    ];

    if (!this.buttonAcces.btnBuscar){this.onListar();}

  }

  onToBuscar() {
    this.onListar();
  }

  onListar() {

    this.modeloFind = {descripcionPerfil: this.descripcionFind};
    this.subscription = new Subscription();
    this.subscription = this.perfilService.getListByFilter(this.modeloFind)
    .subscribe(resp => {
      if (resp) {
          this.listModelo = resp;
        }
      },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      }
    );
  }

  onRowEditInit(modelo: PerfilModel) {
    this.modelocloned[modelo.idPerfil] = {...modelo};
  }

  onRowEditSave(modelo: PerfilModel) {
    this.subscription = new Subscription();
    this.subscription = this.perfilService.setUpdate(modelo)
    .subscribe((resp: any) => {
      delete this.modelocloned[modelo.idPerfil];
      this.swaCustomService.swaMsgExito(resp.resultadoDescripcion);
    },
    (error) => {
      this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    });
  }

  onRowEditCancel(modelo: PerfilModel, index: number) {
    this.listModelo[index] = this.modelocloned[modelo.idPerfil];
    delete this.modelocloned[modelo.idPerfil];
  }

  onToRowSelectDelete(modelo: PerfilModel) {
    this.modeloEliminar = modelo;
    this.onConfirmDelete();
  }

  onToCreate() {
    this.router.navigate(['/main/modulo-seg/perfil-create']);
  }

  onConfirmDelete() {
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

  onToDelete() {
    this.subscription = new Subscription();
    this.subscription = this.perfilService.setDelete(this.modeloEliminar)
    .subscribe((resp: any) => {
      this.listModelo = this.listModelo.filter(datafilter => datafilter.idPerfil !== this.modeloEliminar.idPerfil );
      this.swaCustomService.swaMsgExito(resp.resultadoDescripcion);
    },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
