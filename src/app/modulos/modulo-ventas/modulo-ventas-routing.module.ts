import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelOrdenVentaListComponent } from './components/panel-orden-venta/panel-orden-venta-list/panel-orden-venta-list.component';
import { PanelOrdenVentaCreateComponent } from './components/panel-orden-venta/panel-orden-venta-create/panel-orden-venta-create.component';
import { PanelOrdenVentaEditComponent } from './components/panel-orden-venta/panel-orden-venta-edit/panel-orden-venta-edit.component';
import { PanelOrdenVentaViewComponent } from './components/panel-orden-venta/panel-orden-venta-view/panel-orden-venta-view.component';

import { PanelSodimacOrdenVentaListComponent } from './components/panel-sodimac/panel-sodimac-ov/panel-sodimac-ov-list/panel-sodimac-ov-list.component';
import { PanelSodimacOrdenVentaCreateComponent } from './components/panel-sodimac/panel-sodimac-ov/panel-sodimac-ov-create/panel-sodimac-ov-create.component';
import { PanelSodimacOrdenVentaUpdateComponent } from './components/panel-sodimac/panel-sodimac-ov/panel-sodimac-ov-update/panel-sodimac-ov-update.component';
import { PanelSodimacOrdenVentaViewComponent } from './components/panel-sodimac/panel-sodimac-ov/panel-sodimac-ov-view/panel-sodimac-ov-view.component';

import { PanelSodimacPalletListComponent } from './components/panel-sodimac/panel-sodimac-pallet/panel-sodimac-pallet-list/panel-sodimac-pallet-list.component';
import { PanelSodimacPalletAsignacionComponent } from './components/panel-sodimac/panel-sodimac-pallet/panel-sodimac-pallet-asignacion/panel-sodimac-pallet-asignacion.component';
import { PanelSodimacDetalladoPalletViewComponent } from './components/panel-sodimac/panel-sodimac-pallet/panel-sodimac-detallado-pallet-view/panel-sodimac-detallado-pallet-view.component';
import { PanelSodimacDetalladoEanViewComponent } from './components/panel-sodimac/panel-sodimac-pallet/panel-sodimac-detallado-ean-view/panel-sodimac-detallado-ean-view.component';

import { PanelGuiaByFechaComponent } from './components/panel-reportes/panel-guia-by-fecha/panel-guia-by-fecha.component';

import { PanelEntregaListComponent } from './components/panel-entrega/panel-entrega-list/panel-entrega-list.component';
import { PanelEntregaCreateComponent } from './components/panel-entrega/panel-entrega-create/panel-entrega-create.component';
import { PanelEntregaViewComponent } from './components/panel-entrega/panel-entrega-view/panel-entrega-view.component';
import { PanelEntregaEditComponent } from './components/panel-entrega/panel-entrega-edit/panel-entrega-edit.component';

import { PanelForcastListComponent } from './components/panel-forcast/panel-forcast-list/panel-forcast-list.component';
import { PanelForcastCreateComponent } from './components/panel-forcast/panel-forcast-create/panel-forcast-create.component';
import { PanelForcastUpdateComponent } from './components/panel-forcast/panel-forcast-update/panel-forcast-update.component';

import { PanelSopListComponent } from './components/panel-sop/panel-sop-list/panel-sop-list.component';
import { PanelSopUpdateComponent } from './components/panel-sop/panel-sop-update/panel-sop-update.component';

import { PanelOrdenVentaPreliminarByFechaComponent } from './components/panel-reportes/panel-ov-preliminar-by-fecha/panel-ov-preliminar-by-fecha.component';
import { PanelOrdenVentaProgramcionByFechaComponent } from './components/panel-reportes/panel-ov-programacion-by-fecha/panel-ov-programacion-by-fecha.component';
import { PanelOrdenVentaSeguimientoByFilterComponent } from './components/panel-reportes/panel-ov-seguimiento-by-filter/panel-ov-seguimiento-by-filter.component';
import { PanelOrdenVentaPendienteStockAlmaProdByFechaComponent } from './components/panel-reportes/panel-ov-pendiente-stock-alma-prod-by-fecha/panel-ov-pendiente-stock-alma-prod-by-fecha.component';
import { PanelOrdenVentaDetalladoDirecionDespachoComponent } from './components/panel-reportes/panel-ov-detallado-direccion-despacho/panel-ov-detallado-direccion-despacho.component';
import { PanelOrdenVentaDetalladoDirecionFiscalComponent } from './components/panel-reportes/panel-ov-detallado-direccion-fiscal/panel-ov-detallado-direccion-fiscal.component';

import { PanelOrdenVentaSodimacByFechaNumeroComponent } from './components/panel-reportes/panel-ov-sodimac-by-fecha-numero/panel-ov-sodimac-by-fecha-numero.component';
import { PanelOrdenVentaSodimacOrienteByFechaNumeroComponent } from './components/panel-reportes/panel-ov-sodimac-oriente-by-fecha-numero/panel-ov-sodimac-oriente-by-fecha-numero.component';

import { PanelVentaByFilterComponent } from './components/panel-reportes/panel-venta-by-filter/panel-venta-by-filter.component';
import { PanelFacturaVentaByFilterComponent } from './components/panel-reportes/panel-factura-venta-by-filter/panel-factura-venta-by-filter.component';
import { PanelVentaResumenByFechaGrupoComponent } from './components/panel-reportes/panel-venta-resumen-by-fecha-grupo/panel-venta-resumen-by-fecha-grupo.component';

import { PanelFacturaReservaListComponent } from './components/panel-factura-reserva/panel-factura-reserva-list/panel-factura-reserva-list.component';
import { PanelFacturaReservaCreateComponent } from './components/panel-factura-reserva/panel-factura-reserva-create/panel-factura-reserva-create.component';
import { PanelFacturaReservaEditComponent } from './components/panel-factura-reserva/panel-factura-reserva-edit/panel-factura-reserva-edit.component';
import { PanelFacturaReservaViewComponent } from './components/panel-factura-reserva/panel-factura-reserva-view/panel-factura-reserva-view.component';



const routes: Routes = [
  { path: 'panel-orden-venta-list',                                         data: { breadcrumb: 'Órden de Venta' }, component: PanelOrdenVentaListComponent },
  { path: 'panel-orden-venta-create',                                       data: { breadcrumb: 'Órden de Venta' }, component: PanelOrdenVentaCreateComponent },
  { path: 'panel-orden-venta-edit/:id',                                     data: { breadcrumb: 'Órden de Venta' }, component: PanelOrdenVentaEditComponent },
  { path: 'panel-orden-venta-view/:id',                                     data: { breadcrumb: 'Órden de Venta' }, component: PanelOrdenVentaViewComponent },

  { path: 'panel-sodimac-ov-list',                                          data: { breadcrumb: 'Orden de Venta' }, component: PanelSodimacOrdenVentaListComponent },
  { path: 'panel-sodimac-ov-create',                                        data: { breadcrumb: 'Orden de Venta' }, component: PanelSodimacOrdenVentaCreateComponent },
  { path: 'panel-sodimac-ov-update/:id',                                    data: { breadcrumb: 'Orden de Venta' }, component: PanelSodimacOrdenVentaUpdateComponent },
  { path: 'panel-sodimac-ov-view/:id',                                      data: { breadcrumb: 'Orden de Venta' }, component: PanelSodimacOrdenVentaViewComponent },

  { path: 'panel-sodimac-pallet-list',                                      data: { breadcrumb: 'Pallet' }, component: PanelSodimacPalletListComponent },
  { path: 'panel-sodimac-pallet-asignacion',                                data: { breadcrumb: 'Pallet' }, component: PanelSodimacPalletAsignacionComponent },
  { path: 'panel-sodimac-detallado-pallet-view/:id',                        data: { breadcrumb: 'Detallado - Pallet' }, component: PanelSodimacDetalladoPalletViewComponent },
  { path: 'panel-sodimac-detallado-ean-view/:id',                           data: { breadcrumb: 'Detallado - Ean' }, component: PanelSodimacDetalladoEanViewComponent },

  { path: 'panel-guia-by-fecha',                                            data: { breadcrumb: 'Entrega' }, component: PanelGuiaByFechaComponent },

  { path: 'panel-entrega-list',                                             data: { breadcrumb: 'Entrega' }, component: PanelEntregaListComponent },
  { path: 'panel-entrega-create',                                           data: { breadcrumb: 'Entrega' }, component: PanelEntregaCreateComponent },
  { path: 'panel-entrega-view/:id',                                         data: { breadcrumb: 'Entrega' }, component: PanelEntregaViewComponent },
  { path: 'panel-entrega-edit/:id',                                         data: { breadcrumb: 'Entrega' }, component: PanelEntregaEditComponent },

  { path: 'panel-factura-reserva-list',                                     data: { breadcrumb: 'Factura Reserva' }, component: PanelFacturaReservaListComponent },
  { path: 'panel-factura-reserva-create',                                   data: { breadcrumb: 'Factura Reserva' }, component: PanelFacturaReservaCreateComponent },
  { path: 'panel-factura-reserva-edit/:id',                                 data: { breadcrumb: 'Factura Reserva' }, component: PanelFacturaReservaEditComponent },
  { path: 'panel-factura-reserva-view/:id',                                 data: { breadcrumb: 'Factura Reserva' }, component: PanelFacturaReservaViewComponent },

  { path: 'panel-forcast-list',                                             data: { breadcrumb: 'Proyección de Venta' }, component: PanelForcastListComponent },
  { path: 'panel-forcast-create',                                           data: { breadcrumb: 'Proyección de Venta' }, component: PanelForcastCreateComponent },
  { path: 'panel-forcast-update/:id',                                       data: { breadcrumb: 'Proyección de Venta' }, component: PanelForcastUpdateComponent },

  { path: 'panel-sop-list',                                                 data: { breadcrumb: 'S&OP' }, component: PanelSopListComponent },
  { path: 'panel-sop-update/:id',                                           data: { breadcrumb: 'S&OP' }, component: PanelSopUpdateComponent },

  { path: 'panel-ov-preliminar-by-fecha',                                   data: { breadcrumb: 'Informe - OV - Preliminar' }, component: PanelOrdenVentaPreliminarByFechaComponent },
  { path: 'panel-ov-programacion-by-fecha',                                 data: { breadcrumb: 'Informe - OV - Programación' }, component: PanelOrdenVentaProgramcionByFechaComponent },
  { path: 'panel-ov-seguimiento-by-filter',                                 data: { breadcrumb: 'Informe - OV - Seguimiento' }, component: PanelOrdenVentaSeguimientoByFilterComponent },
  { path: 'panel-ov-detallado-direccion-fiscal',                            data: { breadcrumb: 'Informe - OV - Seguimiento Detallado - Dirección Fiscal' }, component: PanelOrdenVentaDetalladoDirecionFiscalComponent },
  { path: 'panel-ov-detallado-direccion-despacho',                          data: { breadcrumb: 'Informe - OV - Seguimiento Detallado - Direción Despacho' }, component: PanelOrdenVentaDetalladoDirecionDespachoComponent },
  { path: 'panel-ov-pendiente-stock-alma-prod-by-fecha',                    data: { breadcrumb: 'Informe - OV - Pendientes - Stock de Almacenes de Produccíon' }, component: PanelOrdenVentaPendienteStockAlmaProdByFechaComponent },

  { path: 'panel-ov-sodimac-by-fecha-numero',                               data: { breadcrumb: 'Informe - Despacho de Sodimac- Fecha - Número' }, component: PanelOrdenVentaSodimacByFechaNumeroComponent },
  { path: 'panel-ov-sodimac-oriente-by-fecha-numero',                       data: { breadcrumb: 'Informe - Despacho de Sodimac Selva- Fecha - Número' }, component: PanelOrdenVentaSodimacOrienteByFechaNumeroComponent },

  { path: 'panel-venta-by-filter',                                          data: { breadcrumb: 'Informe - Ventas-fecha' }, component: PanelVentaByFilterComponent },
  { path: 'panel-factura-venta-by-filter',                                  data: { breadcrumb: 'Informe - Facturas de Venta' }, component: PanelFacturaVentaByFilterComponent },
  { path: 'panel-venta-resumen-by-fecha-grupo',                             data: { breadcrumb: 'Informe - Ventas - Resumido' }, component: PanelVentaResumenByFechaGrupoComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VentasRoutingModule {}
