import { Injectable } from '@angular/core';
import { ButtonAcces } from '../models/acceso-button.model';
import { MenuModel } from '../modulos/modulo-seguridad/models/menu.model';
import { OpcionModel } from '../modulos/modulo-seguridad/models/opcion.model';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AccesoOpcionesService {

  private buttonAcces: ButtonAcces = new ButtonAcces();
  private listOpcion: OpcionModel[];

  constructor(private sessionService: SessionService) { }

  // Se tiene que mejorar el acceso a las opciones
  getObtieneOpciones(nombreFormulario: string): ButtonAcces {
    this.buttonAcces = new ButtonAcces();
    this.listOpcion = [];
    if (this.sessionService.getItem('menu-opciones')){
      let data: MenuModel[] = this.sessionService.getItem('menu-opciones');
      this.listOpcion  = [...data].find(x => x.nombreFormulario === nombreFormulario).listaOpciones;

          this.listOpcion.forEach(element => {
            if (element.keyOpcion === 'btn-nuevo') {
              this.buttonAcces.btnNuevo = false;
            }
            if (element.keyOpcion === 'btn-grabar') {
              this.buttonAcces.btnGrabar = false;
            }
            if (element.keyOpcion === 'btn-liberar') {
              this.buttonAcces.btnLiberar = false;
            }
            if (element.keyOpcion === 'btn-anular') {
              this.buttonAcces.btnAnular = false;
            }
            if (element.keyOpcion === 'btn-editar') {
              this.buttonAcces.btnEditar = false;
            }
            if (element.keyOpcion === 'btn-eliminar') {
              this.buttonAcces.btnEliminar = false;
            }
            if (element.keyOpcion === 'btn-cerrar') {
              this.buttonAcces.btnCerrar = false;
            }
            if (element.keyOpcion === 'btn-cancelar') {
              this.buttonAcces.btnCancelar = false;
            }
            if (element.keyOpcion === 'btn-transferir') {
              this.buttonAcces.btnTransferir = false;
            }
            if (element.keyOpcion === 'btn-archivo') {
              this.buttonAcces.btnArchivo = false;
            }
            if (element.keyOpcion === 'btn-grabar') {
              this.buttonAcces.btnGrabar = false;
            }
            if (element.keyOpcion === 'btn-menu-hijo') {
              this.buttonAcces.btnMenuHijo = false;
            }
            if (element.keyOpcion === 'btn-menu-padre') {
              this.buttonAcces.btnMenuPadre = false;
            }
            if (element.keyOpcion === 'btn-pdf') {
              this.buttonAcces.btnPDF = false;
            }
            if (element.keyOpcion === 'btn-excel') {
              this.buttonAcces.btnEXCEL = false;
            }
            if (element.keyOpcion === 'btn-exportar') {
              this.buttonAcces.btnExportar = false;
            }
            if (element.keyOpcion === 'btn-exp-excel') {
              this.buttonAcces.btnExpExcel = false;
            }
            if (element.keyOpcion === 'btn-imp-excel') {
              this.buttonAcces.btnImpExcel = false;
            }
            if (element.keyOpcion === 'btn-imp-file') {
              this.buttonAcces.btnImpFile = false;
            }
            if (element.keyOpcion === 'btn-download') {
              this.buttonAcces.btnDownload = false;
            }
            if (element.keyOpcion === 'btn-guiar') {
              this.buttonAcces.btnGuiar = false;
            }
            if (element.keyOpcion === 'btn-ver') {
              this.buttonAcces.btnVer = false;
            }
            if (element.keyOpcion === 'btn-adicionar-eliminar') {
              this.buttonAcces.btnAdicionarEliminar = false;
            }
            if (element.keyOpcion === 'btn-buscar') {
              this.buttonAcces.btnBuscar = false;
            }
            if (element.keyOpcion === 'btn-activar') {
              this.buttonAcces.btnActivar = false;
            }
            if (element.keyOpcion === 'btn-revision') {
              this.buttonAcces.btnRevisar = false;
            }
            if (element.keyOpcion === 'btn-aprobar') {
              this.buttonAcces.btnAprobar = false;
            }
            if (element.keyOpcion === 'btn-asignar') {
              this.buttonAcces.btnAsignar = false;
            }
            if (element.keyOpcion === 'btn-imprimir') {
              this.buttonAcces.btnImprimir = false;
            }
            if (element.keyOpcion === 'btn-imprimir-picking-list') {
              this.buttonAcces.btnImprimirPickingList = false;
            }
            if (element.keyOpcion === 'btn-enviar-sap') {
              this.buttonAcces.btnEnviarSAP = false;
            }
            if (element.keyOpcion === 'btn-duplicar') {
              this.buttonAcces.btnDuplicar = false;
            }
            if (element.keyOpcion === 'btn-copiar-pedido') {
              this.buttonAcces.btnCopiarPedido = false;
            }
            if (element.keyOpcion === 'btn-enviar-correo') {
              this.buttonAcces.btnEnviarCorreo = false;
            }
            if (element.keyOpcion === 'btn-flujo-aprobacion') {
              this.buttonAcces.btnFlujoAprobacion = false;
            }
            if (element.keyOpcion === 'btn-resumen') {
              this.buttonAcces.btnResumen = false;
            }
            if (element.keyOpcion === 'btn-enviar') {
              this.buttonAcces.btnEnviar = false;
            }
            if (element.keyOpcion === 'btn-agregar') {
              this.buttonAcces.btnAgregar = false;
            }
            if (element.keyOpcion === 'btn-permiso-logistico') {
              this.buttonAcces.btnPermisoLogistico = false;
            }
            if (element.keyOpcion === 'btn-vehiculo') {
              this.buttonAcces.btnVehiculo = false;
            }
            if (element.keyOpcion === 'btn-conductor') {
              this.buttonAcces.btnConductor = false;
            }
          });
    }
    return this.buttonAcces;
  }
}
