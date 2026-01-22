import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdenMantenimientoWebListComponent } from './components/orden-mantenimiento/list/om-web-list.component';
import { OrdenMantenimientoWebCreateComponent } from './components/orden-mantenimiento/create/om-web-create.component';
import { PanelOrdenFabricacionGeneralByFechaSedeComponent } from './components/panel-reportes/panel-of-general-by-fecha-sede/panel-of-general-by-fecha-sede.component';
import { PanelOrdenFabricacionByFechaSedeComponent } from './components/panel-reportes/panel-of-by-fecha-sede/panel-of-by-fecha-sede.component';

const ROUTES: Routes = [
    { path: 'om-web-list', data: { breadcrumb: 'Lista de Órdenes de Mantenimiento' }, component: OrdenMantenimientoWebListComponent },
    { path: 'om-web-create', data: { breadcrumb: 'Registrar Órdenes de Mantenimiento' }, component: OrdenMantenimientoWebCreateComponent },

    { path: 'panel-of-by-fecha-sede',           data: { breadcrumb: 'Informe - Órdenes de Fabricación' }, component: PanelOrdenFabricacionByFechaSedeComponent },
    { path: 'panel-of-general-by-fecha-sede',   data: { breadcrumb: 'Informe - Órdenes de Fabricación General' }, component: PanelOrdenFabricacionGeneralByFechaSedeComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class ProduccionRoutingModule {}
