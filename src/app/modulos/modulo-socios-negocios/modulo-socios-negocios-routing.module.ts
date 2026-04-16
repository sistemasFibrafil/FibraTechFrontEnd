import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelSocioNegociosListComponent } from './components/panel-socio-negocios/panel-socio-negocios-list/panel-socio-negocios-list.component';
import { PanelVehiculoComponent } from './components/panel-vehiculo/panel-vehiculo.component';
import { PanelConductorComponent } from './components/panel-conductor/panel-conductor.component';

import { PanelClienteBySectorEstadoComponent } from './components/panel-reportes/panel-cliente-by-sector-estado/panel-cliente-by-sector-estado.component';


const ROUTES: Routes = [
  { path: 'panel-socio-negocios-list',        data: { breadcrumb: 'Socios de Negocios' }, component: PanelSocioNegociosListComponent },
  { path: 'panel-vehiculo/:id',               data: { breadcrumb: 'Vehículo' }, component: PanelVehiculoComponent },
  { path: 'panel-conductor/:id',              data: { breadcrumb: 'Conductor' }, component: PanelConductorComponent },

  { path: 'panel-cliente-by-sector-estado',   data: { breadcrumb: 'Informe - Clientes' }, component: PanelClienteBySectorEstadoComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class SociosNegociosRoutingNgModule {}
