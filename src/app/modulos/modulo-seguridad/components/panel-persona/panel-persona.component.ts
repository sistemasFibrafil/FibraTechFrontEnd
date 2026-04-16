import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from '../../../../constants/globals-constants-form';
import { AccesoOpcionesService } from '../../../../services/acceso-opciones.service';
import { SwaCustomService } from '../../../../services/swa-custom.service';
import { MenuItem } from 'src/app/interface/common-ui.interface';
import { UsuarioModel } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';


@Component({
  selector: 'app-seg-panel-persona',
  templateUrl: './panel-persona.component.html',
  styleUrls: ['./panel-persona.component.css']
})
export class PanelPersonaComponent implements OnInit, OnDestroy {
  // Titulo del componente
  titulo                                        = 'Usuario';
  // Acceso de botones
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();
  // UI State
  isDisplay                                     = false;
  // Opcion Buscar
  filtroFind                                    = '';
  listModelo                                    : UsuarioModel[];
  modeloSelected                                : UsuarioModel;
  opciones                                      : MenuItem[] = [];
  private opcionesMap                           : Map<string, MenuItem>;
  columnas                                      : any[];
  subscription                                  : Subscription;

  constructor
  (
    private router: Router,
    private usuarioService: UsuarioService,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
  ) {}

  ngOnInit() {
    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-seg-panel-persona');
    this.onBuildColumn();
    this.opcionesTabla();
    if(!this.buttonAcces.btnBuscar){this.onListar();}
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'usuario',           header: 'Usuario' },
      { field: 'nombreCompleto',    header: 'Apellidos y Nombres' },
      { field: 'nroDocumento',      header: 'N° Documento' },
      { field: 'descripcionPerfil', header: 'Perfil' },
      { field: 'activo',            header: 'Activo' },
    ];
  }

  private opcionesTabla(): void {
    this.opciones = [
      { value: '1', label: 'Editar',                        icon: 'pi pi-pencil',      command: () => this.onClickEdit() },
      { value: '2', label: 'Eliminar',                      icon: 'pi pi-trash',       command: () => this.onClickDelete() },
      { value: '3', label: 'Permisos logísticos',           icon: 'pi pi-shield',      command: () => this.onClickPermisoLogistico() },
      { value: '4', label: 'Configuración serie documento', icon: 'pi pi-shield',      command: () => this.onClickConfiguracionSerieDocumento() },
    ];
    this.opcionesMap = new Map(this.opciones.map(op => [op.value, op]));
  }

  // ===========================
    // Table Events
    // ===========================

    onSelectedItem(modelo: UsuarioModel): void {
      this.modeloSelected = modelo;
      this.updateMenuVisibility(modelo);
    }

  onToBuscar() {
    this.onListar();
  }

  onListar() {
    this.isDisplay = true;
    const modeloFind: any = { filter: this.filtroFind };
    this.subscription = new Subscription();
    this.subscription = this.usuarioService.getListByFilter(modeloFind)
    .subscribe((resp: UsuarioModel[]) => {
      if (resp) {
        this.isDisplay = false;
          this.listModelo = resp;
        }
      },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      }
    );
  }

  onToCreate() {
    this.router.navigate(['/main/modulo-seg/persona-create']);
  }

  onClickEdit(): void {
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-seg/persona-update', this.modeloSelected.idUsuario]);
  }

  onClickDelete(): void {
    if (!this.validateSelection()) return;
    this.onConfirmDelete();
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
    this.subscription = this.usuarioService.setDelete(this.modeloSelected)
    .subscribe((resp: any) => {
      this.listModelo = this.listModelo.filter(datafilter => datafilter.idUsuario !== this.modeloSelected.idUsuario );
      this.swaCustomService.swaMsgExito(resp.resultadoDescripcion);
    },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      });
  }

  onClickPermisoLogistico(): void {
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-seg/persona-permiso-logistico', this.modeloSelected.idUsuario]);
  }

  onClickConfiguracionSerieDocumento(): void {
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-seg/persona-configuracion-serie-documento', this.modeloSelected.idUsuario]);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ===========================
    // Helper Methods
    // ===========================

    private validateSelection(): boolean {
      if (!this.modeloSelected) {
        this.swaCustomService.swaMsgInfo('Debe seleccionar al menos un registro');
        return false;
      }
      return true;
    }

    private updateMenuVisibility(modelo: UsuarioModel): void {
      this.opcionesMap.get('1')!.visible = !this.buttonAcces.btnEditar;
      this.opcionesMap.get('2')!.visible = !this.buttonAcces.btnEliminar;
      this.opcionesMap.get('3')!.visible = !this.buttonAcces.btnPermisoLogistico;
    }

}
