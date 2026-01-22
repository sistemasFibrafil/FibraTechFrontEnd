import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { VentasRoutingModule } from './modulo-ventas-routing.module';
import { VentasPrimeNgModule } from './modulo-ventas-primeng.module';
import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';

import { PanelOrdenVentaListComponent } from './components/panel-orden-venta/panel-orden-venta-list/panel-orden-venta-list.component';
import { PanelOrdenVentaCreateComponent } from './components/panel-orden-venta/panel-orden-venta-create/panel-orden-venta-create.component';

import { PanelSodimacOrdenVentaCreateComponent } from './components/panel-sodimac/panel-sodimac-ov/panel-sodimac-ov-create/panel-sodimac-ov-create.component';
import { PanelSodimacOrdenVentaListComponent } from './components/panel-sodimac/panel-sodimac-ov/panel-sodimac-ov-list/panel-sodimac-ov-list.component';
import { PanelSodimacOrdenVentaUpdateComponent } from './components/panel-sodimac/panel-sodimac-ov/panel-sodimac-ov-update/panel-sodimac-ov-update.component';
import { PanelSodimacOrdenVentaViewComponent } from './components/panel-sodimac/panel-sodimac-ov/panel-sodimac-ov-view/panel-sodimac-ov-view.component';

import { PanelSodimacPalletAsignacionComponent } from './components/panel-sodimac/panel-sodimac-pallet/panel-sodimac-pallet-asignacion/panel-sodimac-pallet-asignacion.component';
import { PanelSodimacPalletListComponent } from './components/panel-sodimac/panel-sodimac-pallet/panel-sodimac-pallet-list/panel-sodimac-pallet-list.component';
import { PanelSodimacDetalladoPalletViewComponent } from './components/panel-sodimac/panel-sodimac-pallet/panel-sodimac-detallado-pallet-view/panel-sodimac-detallado-pallet-view.component';
import { PanelSodimacDetalladoEanViewComponent } from './components/panel-sodimac/panel-sodimac-pallet/panel-sodimac-detallado-ean-view/panel-sodimac-detallado-ean-view.component';

import { PanelGuiaByFechaComponent } from './components/panel-reportes/panel-guia-by-fecha/panel-guia-by-fecha.component';
import { PanelEntregaListComponent } from './components/panel-entrega/panel-entrega-list/panel-entrega-list.component';
import { PanelEntregaViewComponent } from './components/panel-entrega/panel-entrega-view/panel-entrega-view.component';
import { PanelEntregaCreateComponent } from './components/panel-entrega/panel-entrega-create/panel-entrega-create.component';
import { PanelEntregaUpdateComponent } from './components/panel-entrega/panel-entrega-update/panel-entrega-update.component';

import { PanelForcastListComponent } from './components/panel-forcast/panel-forcast-list/panel-forcast-list.component';
import { PanelForcastImportComponent } from './components/panel-forcast/panel-forcast-import/panel-forcast-import.component';
import { PanelForcastCreateComponent } from './components/panel-forcast/panel-forcast-create/panel-forcast-create.component';
import { PanelForcastUpdateComponent } from './components/panel-forcast/panel-forcast-update/panel-forcast-update.component';

import { PanelSopListComponent } from './components/panel-sop/panel-sop-list/panel-sop-list.component';
import { PanelSopUpdateComponent } from './components/panel-sop/panel-sop-update/panel-sop-update.component';

import { PanelOrdenVentaProgramcionByFechaComponent } from './components/panel-reportes/panel-ov-programacion-by-fecha/panel-ov-programacion-by-fecha.component';
import { PanelOrdenVentaSeguimientoByFilterComponent } from './components/panel-reportes/panel-ov-seguimiento-by-filter/panel-ov-seguimiento-by-filter.component';
import { PanelOrdenVentaPendienteStockAlmaProdByFechaComponent } from './components/panel-reportes/panel-ov-pendiente-stock-alma-prod-by-fecha/panel-ov-pendiente-stock-alma-prod-by-fecha.component';
import { PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent } from './components/panel-reportes/panel-ov-seguimiento-detallado-direccion-fiscal-by-filter/panel-ov-seguimiento-detallado-direccion-fiscal-by-filter.component';
import { PanelOrdenVentaSeguimientoDetalladoDirecionDespachoByFilterComponent } from './components/panel-reportes/panel-ov-seguimiento-detallado-direccion-despacho-by-filter/panel-ov-seguimiento-detallado-direccion-despacho-by-filter.component';

import { PanelOrdenVentaPreliminarByFechaComponent } from './components/panel-reportes/panel-ov-preliminar-by-fecha/panel-ov-preliminar-by-fecha.component';

import { PanelOrdenVentaSodimacByFechaNumeroComponent } from './components/panel-reportes/panel-ov-sodimac-by-fecha-numero/panel-ov-sodimac-by-fecha-numero.component';
import { PanelOrdenVentaSodimacOrienteByFechaNumeroComponent } from './components/panel-reportes/panel-ov-sodimac-oriente-by-fecha-numero/panel-ov-sodimac-oriente-by-fecha-numero.component';

import { PanelVentaByFilterComponent } from './components/panel-reportes/panel-venta-by-filter/panel-venta-by-filter.component';
import { PanelVentaResumenByFechaGrupoComponent } from './components/panel-reportes/panel-venta-resumen-by-fecha-grupo/panel-venta-resumen-by-fecha-grupo.component';
import { PanelFacturaVentaByFilterComponent } from './components/panel-reportes/panel-factura-venta-by-filter/panel-factura-venta-by-filter.component';
import { PanelOrdenVentaEditComponent } from './components/panel-orden-venta/panel-orden-venta-edit/panel-orden-venta-edit.component';




@NgModule({
    declarations:
    [
      PanelOrdenVentaListComponent,
      PanelOrdenVentaCreateComponent,
      PanelOrdenVentaEditComponent,

      PanelSodimacOrdenVentaListComponent,
      PanelSodimacOrdenVentaCreateComponent,
      PanelSodimacOrdenVentaUpdateComponent,
      PanelSodimacOrdenVentaViewComponent,

      PanelSodimacPalletAsignacionComponent,
      PanelSodimacPalletListComponent,
      PanelSodimacDetalladoPalletViewComponent,
      PanelSodimacDetalladoEanViewComponent,

      PanelGuiaByFechaComponent,
      PanelEntregaListComponent,
      PanelEntregaViewComponent,
      PanelEntregaCreateComponent,
      PanelEntregaUpdateComponent,

      PanelForcastListComponent,
      PanelForcastImportComponent,
      PanelForcastCreateComponent,
      PanelForcastUpdateComponent,

      PanelSopListComponent,
      PanelSopUpdateComponent,

      PanelOrdenVentaPreliminarByFechaComponent,
      PanelOrdenVentaProgramcionByFechaComponent,
      PanelOrdenVentaSeguimientoByFilterComponent,
      PanelOrdenVentaPendienteStockAlmaProdByFechaComponent,
      PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent,
      PanelOrdenVentaSeguimientoDetalladoDirecionDespachoByFilterComponent,

      PanelOrdenVentaSodimacByFechaNumeroComponent,
      PanelOrdenVentaSodimacOrienteByFechaNumeroComponent,

      PanelVentaByFilterComponent,
      PanelFacturaVentaByFilterComponent,
      PanelVentaResumenByFechaGrupoComponent,
    ],
    imports:
    [
      CommonModule,
      VentasPrimeNgModule,
      VentasRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class VentasModule {}
