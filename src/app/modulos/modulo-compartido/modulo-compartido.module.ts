import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { CompartidoPrimeNgModule } from './modulo-compartido-primeng.module';

import { BtnSalirComponent } from './components/btn-salir/btn-salir.component';
import { PanelCerrarComponent } from './components/panel-cerrar/panel-cerrar.component';
import { PanelObtenerComponent } from './components/panel-obtener/panel-obtener.component';
import { PanelGuardarComponent } from './components/panel-guardar/panel-guardar.component';
import { PanelLiberarComponent } from './components/panel-liberar/panel-liberar.component';
import { PanelEliminarComponent } from './components/panel-eliminar/panel-eliminar.component';
import { PanelCancelarComponent } from './components/panel-cancelar/panel-cancelar.component';
import { ModalVisorPdfComponent } from './components/modal-visor-pdf/modal-visor-pdf.component';
import { PanelSubirArchivoComponent } from './components/panel-subir-archivo/panel-subir-archivo.component';
import { PanelGerandoVisorPdfComponent } from './components/panel-generando-visor-pdf/panel-generando-visor-pdf.component';

import { ModalFileImportComponent } from './components/web/modal/modal-file-import/modal-file-import.component';
import { ModalSubirArchivoComponent } from './components/web/modal/modal-subir-archivo/modal-subir-archivo.component';

//import { ModalVehiculoComponent } from './components/sap-business-one/modal/modal-vehiculo/modal-vehiculo-sap.component';
import { ModalArticuloComponent } from './components/sap-business-one/modal/modal-articulo/modal-articulo.component';
import { ModalConductorComponent } from './components/sap-business-one/modal/modal-conductor/modal-conductor.component';
import { ModalSocioNegocioComponent } from './components/sap-business-one/modal/modal-socio-negocio/modal-socio-negocio.component';
import { ModalSalesPersonsComponent } from './components/sap-business-one/modal/modal-sales-persons/modal-sales-persons.component';
import { ModalPersonaContactoComponent } from './components/sap-business-one/modal/modal-persona-contacto/modal-persona-contacto.component';

import { ModalSerieDocumentoComponent } from './components/sap-business-one/modal/modal-serie-documento/modal-serie-documento.component';
import { ModalSkuComercialComponent } from './components/sap-business-one/modal/modal-sku-comercial/modal-sku-comercial.component';
import { ModalSodimacOvPendienteComponent } from './components/web/modal/modal-sodimac-ov-pendiente/modal-sodimac-ov-pendiente.component';
import { ModalSodimacOvPendienteSapComponent } from './components/sap-business-one/modal/modal-sodimac-ov-pendiente/modal-sodimac-ov-pendiente.component';

import { BusquedaProcesoComponent } from './components/sap-business-one/busqueda/busqueda-proceso/busqueda-proceso.component';
import { BusquedaArticuloComponent } from './components/sap-business-one/busqueda/busqueda-articulo/busqueda-articulo.component';
import { BusquedaImpuestoComponent } from './components/sap-business-one/busqueda/busqueda-impuesto/busqueda-impuesto.component';
import { BusquedaSubGrupoComponent } from './components/sap-business-one/busqueda/busqueda-sub-grupo/busqueda-sub-grupo.component';
import { BusquedaTiempoVidaComponent } from './components/sap-business-one/busqueda/busqueda-tiempo-vida/busqueda-tiempo-vida.component';
import { BusquedaTpoLaminadoComponent } from './components/sap-business-one/busqueda/busqueda-tipo-laminado/busqueda-tipo-laminado.component';
import { BusquedaUnidadMedidaComponent } from './components/sap-business-one/busqueda/busqueda-unidad-medida/busqueda-unidad-medida.component';
import { BusquedaSocioNegocioComponent } from './components/sap-business-one/busqueda/busqueda-socio-negocio/busqueda-socio-negocio.component';
import { BusquedaTipoOperacionComponent } from './components/sap-business-one/busqueda/busqueda-tipo-operacion/busqueda-tipo-operacion.component';
import { BusquedaAlmacenStockComponent } from './components/sap-business-one/busqueda/busqueda-almacen-stock/busqueda-almacen-stock.component';
import { BusquedaColorImpresionComponent } from './components/sap-business-one/busqueda/busqueda-color-impresion/busqueda-color-impresion.component';
import { BusquedaAlmacenByArticuloComponent } from './components/sap-business-one/busqueda/busqueda-almacen/busqueda-almacen-by-articulo.component';

import { BusquedaCentroCostoComponent } from './components/sap-business-one/busqueda/busqueda-centro-costo/busqueda-centro-costo.component';
import { BusquedaCuentaContableComponent } from './components/sap-business-one/busqueda/busqueda-cuenta-contable/busqueda-cuenta-contable.component';

import { BusquedaCampoDefinidoUsuarioComponent } from './components/sap-business-one/busqueda/busqueda-campo-definido-usuario/busqueda-campo-definido-usuario.component';
import { ModalVehiculoComponent } from './components/sap-business-one/modal/modal-vehiculo/modal-vehiculo.component';
import { ModalUsuarioComponent } from './components/sap-business-one/modal/modal-usuario/modal-usuario.component';




@NgModule({
    declarations: [
      BtnSalirComponent,
      PanelCerrarComponent,
      PanelObtenerComponent,
      PanelGuardarComponent,
      PanelLiberarComponent,
      PanelEliminarComponent,
      PanelCancelarComponent,
      ModalVisorPdfComponent,
      PanelSubirArchivoComponent,
      PanelGerandoVisorPdfComponent,

      ModalFileImportComponent,
      ModalSubirArchivoComponent,

      ModalVehiculoComponent,
      ModalVehiculoComponent,
      ModalArticuloComponent,
      ModalConductorComponent,
      ModalSocioNegocioComponent,
      ModalSalesPersonsComponent,
      ModalPersonaContactoComponent,

      ModalSerieDocumentoComponent,


      ModalSkuComercialComponent,
      ModalSodimacOvPendienteComponent,
      ModalSodimacOvPendienteComponent,
      ModalSodimacOvPendienteSapComponent,

      BusquedaProcesoComponent,
      BusquedaArticuloComponent,
      BusquedaImpuestoComponent,
      BusquedaSubGrupoComponent,
      BusquedaTiempoVidaComponent,
      BusquedaTpoLaminadoComponent,
      BusquedaUnidadMedidaComponent,
      BusquedaSocioNegocioComponent,
      BusquedaAlmacenStockComponent,
      BusquedaTipoOperacionComponent,
      BusquedaColorImpresionComponent,
      BusquedaAlmacenByArticuloComponent,

      BusquedaCentroCostoComponent,
      BusquedaCuentaContableComponent,

      BusquedaCampoDefinidoUsuarioComponent,

      ModalUsuarioComponent
    ],
    imports: [
      RouterOutlet,
      CommonModule,
      CompartidoPrimeNgModule,
      FormsModule,
      ReactiveFormsModule,
      NgxDocViewerModule
    ],
    exports: [
      BtnSalirComponent,
      PanelCerrarComponent,
      PanelObtenerComponent,
      PanelGuardarComponent,
      PanelLiberarComponent,
      PanelEliminarComponent,
      PanelCancelarComponent,
      ModalVisorPdfComponent,
      PanelSubirArchivoComponent,
      PanelGerandoVisorPdfComponent,

      ModalVehiculoComponent,
      ModalArticuloComponent,
      ModalConductorComponent,
      ModalSocioNegocioComponent,
      ModalSalesPersonsComponent,
      ModalPersonaContactoComponent,

      ModalSerieDocumentoComponent,

      ModalFileImportComponent,
      ModalSubirArchivoComponent,
      ModalSkuComercialComponent,
      ModalSodimacOvPendienteComponent,
      ModalSodimacOvPendienteComponent,
      ModalSodimacOvPendienteSapComponent,

      BusquedaProcesoComponent,
      BusquedaArticuloComponent,
      BusquedaImpuestoComponent,
      BusquedaSubGrupoComponent,
      BusquedaTiempoVidaComponent,
      BusquedaTpoLaminadoComponent,
      BusquedaUnidadMedidaComponent,
      BusquedaSocioNegocioComponent,
      BusquedaAlmacenStockComponent,
      BusquedaTipoOperacionComponent,
      BusquedaColorImpresionComponent,
      BusquedaAlmacenByArticuloComponent,

      BusquedaCentroCostoComponent,
      BusquedaCuentaContableComponent,

      BusquedaCampoDefinidoUsuarioComponent,

      ModalUsuarioComponent
    ],
    providers: [ ],
    schemas:
    [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class CompartidoModule {}
