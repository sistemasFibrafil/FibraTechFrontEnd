import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelClienteBySectorEstadoComponent } from './components/panel-reportes/panel-cliente-by-sector-estado/panel-cliente-by-sector-estado.component';


const ROUTES: Routes = [
  { path: 'panel-cliente-by-sector-estado', data: { breadcrumb: 'Informe - Clientes' }, component: PanelClienteBySectorEstadoComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class SociosNegociosRoutingNgModule {}
