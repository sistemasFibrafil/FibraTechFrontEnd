import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { InventarioPrimeNgModule } from './modulo-inventario-primeng.module';
import { InventarioRoutingModule } from './modulo-inventario-routing.module';
import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';

import { PanelPickingListComponent } from './components/panel-picking/panel-picking-list/panel-picking-list.component';
import { PanelPickingCreateComponent } from './components/panel-picking/panel-picking-create/panel-picking-create.component';
import { PanelPickingReleaseComponent } from './components/panel-picking/panel-picking-release/panel-picking-release.component';

import { PanelSolicitudTrasladoListComponent } from './components/panel-inventory-transactions/panel-solicitud-traslado/panel-solicitud-traslado-list/panel-solicitud-traslado-list.component';
import { PanelSolicitudTrasladoEditComponent } from './components/panel-inventory-transactions/panel-solicitud-traslado/panel-solicitud-traslado-edit/panel-solicitud-traslado-edit.component';
import { PanelSolicitudTrasladoCreateComponent } from './components/panel-inventory-transactions/panel-solicitud-traslado/panel-solicitud-traslado-create/panel-solicitud-traslado-create.component';
import { PanelSolicitudTrasladoViewComponent } from './components/panel-inventory-transactions/panel-solicitud-traslado/panel-solicitud-traslado-view/panel-solicitud-traslado-view.component';

import { PanelPanelTransferenciaStockListComponent } from './components/panel-inventory-transactions/panel-transferencia-stock/panel-transferencia-stock-list/panel-transferencia-stock-list.component';
import { PanelPanelTransferenciaStockCreateComponent } from './components/panel-inventory-transactions/panel-transferencia-stock/panel-transferencia-stock-create/panel-transferencia-stock-create.component';
import { PanelPanelTransferenciaStockEditComponent } from './components/panel-inventory-transactions/panel-transferencia-stock/panel-transferencia-stock-edit/panel-transferencia-stock-edit.component';
import { PanelPanelTransferenciaStockViewComponent } from './components/panel-inventory-transactions/panel-transferencia-stock/panel-transferencia-stock-view/panel-transferencia-stock-view.component';

import { PanelCargaSaldoInicialListComponent } from './components/panel-inventory-transactions/panel-carga-saldo-inicial/panel-carga-saldo-inicial-list/panel-carga-saldo-inicial-list.component';

import { PanelSkuComercialListComponent } from './components/panel-sku/panel-sku-comercial/panel-sku-comercial-list/panel-sku-comercial-list.component';
import { PanelSkuComercialCreateComponent } from './components/panel-sku/panel-sku-comercial/panel-sku-comercial-create/panel-sku-comercial-create.component';
import { PanelSkuComercialUpdateComponent } from './components/panel-sku/panel-sku-comercial/panel-sku-comercial-update/panel-sku-comercial-update.component';
import { PanelSkuProduccionListComponent } from './components/panel-sku/panel-sku-produccion/panel-sku-produccion-list/panel-sku-produccion-list.component';
import { PanelSkuProduccionCreateComponent } from './components/panel-sku/panel-sku-produccion/panel-sku-produccion-create/panel-sku-produccion-create.component';
import { PanelSkuProduccionUpdateComponent } from './components/panel-sku/panel-sku-produccion/panel-sku-produccion-update/panel-sku-produccion-update.component';

import { PanelStockGeneralByAlmacenComponent } from './components/panel-reportes/panel-stock-general-by-almacen/panel-stock-general-by-almacen.component';
import { PanelMovimientoStockByFechaSedeComponent } from './components/panel-reportes/panel-movimiento-stock-by-fecha-sede/panel-movimiento-stock-by-fecha-sede.component';
import { PanelArticuloByGrupoSubGrupoFiltroComponent } from './components/panel-reportes/panel-articulo-by-grupo-sub-grupo-filtro/panel-articulo-by-grupo-sub-grupo-filtro.component';
import { PanelStockArticuloVentaByGrupoSubGrupoComponent } from './components/panel-reportes/panel-stock-articulo-venta-by-grupo-sub-grupo/panel-stock-articulo-venta-by-grupo-sub-grupo.component';
import { PanelArticuloVentaByGrupoSubGrupoEstadoComponent } from './components/panel-reportes/panel-articulo-venta-by-grupo-sub-grupo-estado/panel-articulo-venta-by-grupo-sub-grupo-estado.component';
import { PanelStockGeneralDetalladoAlmacenByAlmacenComponent } from './components/panel-reportes/panel-stock-general-detallado-almacen-by-almacen/panel-stock-general-detallado-almacen-by-almacen.component';
import { PanelCargaMasivaArticuloComponent } from './components/panel-carga-masiva-articulo/panel-carga-masiva-articulo.component';
import { TakeInventoryFinishedProductsCreateComponent } from './components/panel-take-inventory/panel-finished-produts/panel-finished-produts-create/panel-finished-produts-create.component';
import { TakeInventoryFinishedProductsListComponent } from './components/panel-take-inventory/panel-finished-produts/panel-finished-produts-list/panel-finished-produts-list.component';
import { PanelTakeInventorySparePartsListComponent } from './components/panel-take-inventory/panel-spare-parts/panel-spare-parts-list/panel-spare-parts-list.component';
import { PanelTakeInventorySparePartsCreateComponent } from './components/panel-take-inventory/panel-spare-parts/panel-spare-parts-create/panel-spare-parts-create.component';



@NgModule({
    declarations:
    [
      PanelPickingListComponent,
      PanelPickingCreateComponent,
      PanelPickingReleaseComponent,

      PanelTakeInventorySparePartsListComponent,
      PanelTakeInventorySparePartsCreateComponent,

      TakeInventoryFinishedProductsListComponent,
      TakeInventoryFinishedProductsCreateComponent,

      PanelSolicitudTrasladoListComponent,
      PanelSolicitudTrasladoCreateComponent,
      PanelSolicitudTrasladoEditComponent,
      PanelSolicitudTrasladoViewComponent,

      PanelPanelTransferenciaStockListComponent,
      PanelPanelTransferenciaStockCreateComponent,
      PanelPanelTransferenciaStockEditComponent,
      PanelPanelTransferenciaStockViewComponent,

      PanelCargaSaldoInicialListComponent,

      PanelSkuComercialListComponent,
      PanelSkuComercialCreateComponent,
      PanelSkuComercialUpdateComponent,
      PanelSkuProduccionListComponent,
      PanelSkuProduccionCreateComponent,
      PanelSkuProduccionUpdateComponent,

      PanelStockGeneralByAlmacenComponent,
      PanelMovimientoStockByFechaSedeComponent,
      PanelArticuloByGrupoSubGrupoFiltroComponent,
      PanelStockArticuloVentaByGrupoSubGrupoComponent,
      PanelArticuloVentaByGrupoSubGrupoEstadoComponent,
      PanelStockGeneralDetalladoAlmacenByAlmacenComponent,
      PanelCargaMasivaArticuloComponent

    ],
    imports:
    [
      CommonModule,
      InventarioPrimeNgModule,
      InventarioRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class InventarioModule {}
