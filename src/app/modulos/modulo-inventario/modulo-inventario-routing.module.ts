import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelPickingListComponent } from './components/panel-picking/panel-picking-list/panel-picking-list.component';
import { PanelPickingCreateComponent } from './components/panel-picking/panel-picking-create/panel-picking-create.component';
import { PanelPickingReleaseComponent } from './components/panel-picking/panel-picking-release/panel-picking-release.component';

import { PanelSolicitudTrasladoListComponent } from './components/panel-inventory-transactions/panel-solicitud-traslado/panel-solicitud-traslado-list/panel-solicitud-traslado-list.component';
import { PanelSolicitudTrasladoCreateComponent } from './components/panel-inventory-transactions/panel-solicitud-traslado/panel-solicitud-traslado-create/panel-solicitud-traslado-create.component';
import { PanelSolicitudTrasladoEditComponent } from './components/panel-inventory-transactions/panel-solicitud-traslado/panel-solicitud-traslado-edit/panel-solicitud-traslado-edit.component';
import { PanelSolicitudTrasladoViewComponent } from './components/panel-inventory-transactions/panel-solicitud-traslado/panel-solicitud-traslado-view/panel-solicitud-traslado-view.component';

import { PanelPanelTransferenciaStockListComponent } from './components/panel-inventory-transactions/panel-transferencia-stock/panel-transferencia-stock-list/panel-transferencia-stock-list.component';
import { PanelPanelTransferenciaStockCreateComponent } from './components/panel-inventory-transactions/panel-transferencia-stock/panel-transferencia-stock-create/panel-transferencia-stock-create.component';
import { PanelPanelTransferenciaStockEditComponent } from './components/panel-inventory-transactions/panel-transferencia-stock/panel-transferencia-stock-edit/panel-transferencia-stock-edit.component';
import { PanelPanelTransferenciaStockViewComponent } from './components/panel-inventory-transactions/panel-transferencia-stock/panel-transferencia-stock-view/panel-transferencia-stock-view.component';

import { PanelCargaSaldoInicialListComponent } from './components/panel-inventory-transactions/panel-carga-saldo-inicial/panel-carga-saldo-inicial-list/panel-carga-saldo-inicial-list.component';

import { PanelSkuComercialListComponent } from './components/panel-sku/panel-sku-comercial/panel-sku-comercial-list/panel-sku-comercial-list.component';
import { PanelSkuComercialCreateComponent } from './components/panel-sku/panel-sku-comercial/panel-sku-comercial-create/panel-sku-comercial-create.component';
import { PanelSkuProduccionListComponent } from './components/panel-sku/panel-sku-produccion/panel-sku-produccion-list/panel-sku-produccion-list.component';
import { PanelSkuProduccionCreateComponent } from './components/panel-sku/panel-sku-produccion/panel-sku-produccion-create/panel-sku-produccion-create.component';

import { PanelStockGeneralByAlmacenComponent } from './components/panel-reportes/panel-stock-general-by-almacen/panel-stock-general-by-almacen.component';
import { PanelMovimientoStockByFechaSedeComponent } from './components/panel-reportes/panel-movimiento-stock-by-fecha-sede/panel-movimiento-stock-by-fecha-sede.component';
import { PanelArticuloByGrupoSubGrupoFiltroComponent } from './components/panel-reportes/panel-articulo-by-grupo-sub-grupo-filtro/panel-articulo-by-grupo-sub-grupo-filtro.component';
import { PanelArticuloVentaByGrupoSubGrupoEstadoComponent } from './components/panel-reportes/panel-articulo-venta-by-grupo-sub-grupo-estado/panel-articulo-venta-by-grupo-sub-grupo-estado.component';
import { PanelStockArticuloVentaByGrupoSubGrupoComponent } from './components/panel-reportes/panel-stock-articulo-venta-by-grupo-sub-grupo/panel-stock-articulo-venta-by-grupo-sub-grupo.component';
import { PanelStockGeneralDetalladoAlmacenByAlmacenComponent } from './components/panel-reportes/panel-stock-general-detallado-almacen-by-almacen/panel-stock-general-detallado-almacen-by-almacen.component';
import { PanelSkuComercialUpdateComponent } from './components/panel-sku/panel-sku-comercial/panel-sku-comercial-update/panel-sku-comercial-update.component';
import { PanelSkuProduccionUpdateComponent } from './components/panel-sku/panel-sku-produccion/panel-sku-produccion-update/panel-sku-produccion-update.component';

import { PanelCargaMasivaArticuloComponent } from './components/panel-carga-masiva-articulo/panel-carga-masiva-articulo.component';
import { TakeInventoryFinishedProductsCreateComponent } from './components/panel-take-inventory/panel-finished-produts/panel-finished-produts-create/panel-finished-produts-create.component';
import { TakeInventoryFinishedProductsListComponent } from './components/panel-take-inventory/panel-finished-produts/panel-finished-produts-list/panel-finished-produts-list.component';
import { PanelTakeInventorySparePartsListComponent } from './components/panel-take-inventory/panel-spare-parts/panel-spare-parts-list/panel-spare-parts-list.component';
import { PanelTakeInventorySparePartsCreateComponent } from './components/panel-take-inventory/panel-spare-parts/panel-spare-parts-create/panel-spare-parts-create.component';


const ROUTES: Routes =
[
  { path: 'panel-carga-masiva-articulo',                        data: { breadcrumb: 'Carga masiva de artículos' },                      component: PanelCargaMasivaArticuloComponent },

  { path: 'panel-picking-list',                                 data: { breadcrumb: 'Picking' },                                        component: PanelPickingListComponent },
  { path: 'panel-picking-create',                               data: { breadcrumb: 'Picking' },                                        component: PanelPickingCreateComponent },
  { path: 'panel-picking-release',                              data: { breadcrumb: 'Picking' },                                        component: PanelPickingReleaseComponent },

  { path: 'panel-take-inventory-finished-products-list',        data: { breadcrumb: 'Toma de inventario' },                             component: TakeInventoryFinishedProductsListComponent },
  { path: 'panel-take-inventory-finished-products-create',      data: { breadcrumb: 'Toma de inventario' },                             component: TakeInventoryFinishedProductsCreateComponent },

  { path: 'panel-take-inventory-spare-parts-list',              data: { breadcrumb: 'Toma de inventario' },                             component: PanelTakeInventorySparePartsListComponent },
  { path: 'panel-take-inventory-spare-parts-create',            data: { breadcrumb: 'Toma de inventario' },                             component: PanelTakeInventorySparePartsCreateComponent },

  { path: 'panel-solicitud-traslado-list',                      data: { breadcrumb: 'Solicitud de Traslado' },                          component: PanelSolicitudTrasladoListComponent },
  { path: 'panel-solicitud-traslado-create/:json',              data: { breadcrumb: 'Solicitud de Traslado' },                          component: PanelSolicitudTrasladoCreateComponent },
  { path: 'panel-solicitud-traslado-edit/:id',                  data: { breadcrumb: 'Solicitud de Traslado' },                          component: PanelSolicitudTrasladoEditComponent },
  { path: 'panel-solicitud-traslado-view/:id',                  data: { breadcrumb: 'Solicitud de Traslado' },                          component: PanelSolicitudTrasladoViewComponent },

  { path: 'panel-transferencia-stock-list',                     data: { breadcrumb: 'Transferencia de Stock' },                         component: PanelPanelTransferenciaStockListComponent },
  { path: 'panel-transferencia-stock-create/:json',             data: { breadcrumb: 'Transferencia de Stock' },                         component: PanelPanelTransferenciaStockCreateComponent },
  { path: 'panel-transferencia-stock-edit/:id',                 data: { breadcrumb: 'Transferencia de Stock' },                         component: PanelPanelTransferenciaStockEditComponent },
  { path: 'panel-transferencia-stock-view/:id',                 data: { breadcrumb: 'Transferencia de Stock' },                         component: PanelPanelTransferenciaStockViewComponent },

  { path: 'panel-carga-saldo-inicial-list',                     data: { breadcrumb: 'Carga de saldos iniciales' },                      component: PanelCargaSaldoInicialListComponent },

  { path: 'panel-sku-comercial-list',                           data: { breadcrumb: 'SKU comercial' },                                  component: PanelSkuComercialListComponent },
  { path: 'panel-sku-comercial-create',                         data: { breadcrumb: 'SKU comercial' },                                  component: PanelSkuComercialCreateComponent },
  { path: 'panel-sku-comercial-update/:id',                     data: { breadcrumb: 'SKU comercial' },                                  component: PanelSkuComercialUpdateComponent },

  { path: 'panel-sku-produccion-list',                          data: { breadcrumb: 'SKU producción' },                                 component: PanelSkuProduccionListComponent },
  { path: 'panel-sku-produccion-create',                        data: { breadcrumb: 'SKU producción' },                                 component: PanelSkuProduccionCreateComponent },
  { path: 'panel-sku-produccion-update/:id',                    data: { breadcrumb: 'SKU producción' },                                 component: PanelSkuProduccionUpdateComponent },

  { path: 'panel-stock-general-by-almacen',                     data: { breadcrumb: 'Informe - Stock General' },                        component: PanelStockGeneralByAlmacenComponent },
  { path: 'panel-movimiento-stock-by-fecha-sede',               data: { breadcrumb: 'Informe - Movimientos de Stock' },                 component: PanelMovimientoStockByFechaSedeComponent },
  { path: 'panel-articulo-venta-by-grupo-sub-grupo-estado',     data: { breadcrumb: 'Informe - Artículos de Venta' },                   component: PanelArticuloVentaByGrupoSubGrupoEstadoComponent },
  { path: 'panel-stock-articulo-venta-by-grupo-sub-grupo',      data: { breadcrumb: 'Informe - Stock de Artículos de Venta' },          component: PanelStockArticuloVentaByGrupoSubGrupoComponent },
  { path: 'panel-articulo-by-grupo-sub-grupo-filtro',           data: { breadcrumb: 'Informe - Artículos - Grupo - SubGrupo' },         component: PanelArticuloByGrupoSubGrupoFiltroComponent },
  { path: 'panel-stock-general-detallado-almacen-by-almacen',   data: { breadcrumb: 'Informe - Stock General Detallado por Almacén' },  component: PanelStockGeneralDetalladoAlmacenByAlmacenComponent},
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class InventarioRoutingModule {}
