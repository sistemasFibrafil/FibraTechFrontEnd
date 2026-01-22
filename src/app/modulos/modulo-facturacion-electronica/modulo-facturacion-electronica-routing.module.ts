import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelGuiaListComponent } from './components/panel-guia/panel-guia-list/panel-guia-list.component';

const ROUTES: Routes =
[
    { path: 'panel-guia-list', data: { breadcrumb: 'Lista de guías' }, component: PanelGuiaListComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class FacturacionElectronicaRoutingModule {}
