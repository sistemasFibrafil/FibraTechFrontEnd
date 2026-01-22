import { Component, OnInit, OnDestroy } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { MenuModel } from '../../models/menu.model';
import { SeguridadService } from '../../services/seguridad.service';
import { CustomMenuItem } from '../../models/menu-item.model';
import { OpcionModel } from '../../models/opcion.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobalsConstantsForm } from '../../../../constants/globals-constants-form';
import { AccesoOpcionesService } from '../../../../services/acceso-opciones.service';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { SwaCustomService } from '../../../../services/swa-custom.service';

@Component({
  selector: 'app-seg-panel-opcion',
  templateUrl: './panel-opcion.component.html',
  styleUrls: ['./panel-opcion.component.css']
})
export class PanelOpcionComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Opcion';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  items: TreeNode[] = [];
  itemSelected: TreeNode;
  modelo: MenuModel;
  listModel: MenuModel[] = [];

  customMenuItem: CustomMenuItem;
  customMenuItemChildren: CustomMenuItem;

  columnas: any[];
  listModelo: OpcionModel[];
  // Opcion Editar
  modelocloned: { [s: string]: OpcionModel; } = {};

  // Opcion Eliminar
  modeloEliminar: OpcionModel;

  subscription: Subscription;

  constructor(private seguridadService: SeguridadService,
              private router: Router,
              private readonly accesoOpcionesService: AccesoOpcionesService,
              private readonly swaCustomService: SwaCustomService) {}

  ngOnInit() {

      // Iniciamos el acceso a las opciones con la que cuenta el usuario
      this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-seg-panel-opcion');

      this.getListaMenu();

      this.columnas = [
        { header: 'Codigo' },
        { header: 'Descripcion' },
        { header: 'KeyOpcion' }
      ];
  }

  getListaMenu() {
    this.items = [];
    this.subscription = new Subscription();
    this.subscription = this.seguridadService.getMenuAll()
    .subscribe(data => {
      this.listModel = data;
      for (const menu of this.listModel.filter(x => x.idMenuPadre === 0)) {

        this.customMenuItem = {
          label : menu.descripcionTitulo,
          data: menu,
          icon: menu.icono,
          children: []
        };

        for (const chlidernLevelOne of this.listModel.filter(x => x.idMenuPadre === menu.idMenu)) {
          this.customMenuItemChildren = {
            label: chlidernLevelOne.descripcionTitulo,
            data: chlidernLevelOne,
            icon: chlidernLevelOne.icono,
            children: []
          };

          for (const chlidernLevelTwo of this.listModel.filter(x => x.idMenuPadre === chlidernLevelOne.idMenu)) {
            this.customMenuItemChildren.children.push({
              label: chlidernLevelTwo.descripcionTitulo,
              data: chlidernLevelTwo,
              icon: chlidernLevelTwo.icono
            });
          }

          this.customMenuItem.children.push(this.customMenuItemChildren);

        }
        this.items.push(this.customMenuItem);
      }
    });
  }

  nodeSelect(menu: any)
  {
    this.itemSelected = menu;
    this.modelo = menu.data;

    this.onListar(this.modelo.idMenu);
  }


  onListar(idMenu: number) {

    this.subscription = new Subscription();
    this.subscription = this.seguridadService.getOpcion(idMenu)
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

  onRowEditInit(modelo: OpcionModel) {
    this.modelocloned[modelo.idOpcion] = {...modelo};
  }

  onRowEditSave(modelo: OpcionModel) {
    this.subscription = new Subscription();
    this.subscription = this.seguridadService.setUpdateOpcion(modelo)
    .subscribe((resp: any) => {
      delete this.modelocloned[modelo.idOpcion];
      this.swaCustomService.swaMsgExito(resp.resultadoDescripcion);
    },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      });
  }

  onRowEditCancel(modelo: OpcionModel, index: number) {
    this.listModelo[index] = this.modelocloned[modelo.idOpcion];
    delete this.modelocloned[modelo.idOpcion];
  }

  onToRowSelectDelete(modelo: OpcionModel) {
    this.modeloEliminar = modelo;
    this.onConfirmDelete();
  }

  onToCreate() {
    this.router.navigate(['/main/modulo-seg/opcion-create', this.modelo.idMenu]);
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
    this.subscription = this.seguridadService.setDeleteOpcion(this.modeloEliminar)
    .subscribe((resp: any) => {
      this.listModelo = this.listModelo.filter(datafilter => datafilter.idOpcion !== this.modeloEliminar.idOpcion );
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
