import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelInformeStatusAutorizacionOptionsComponent } from './components/panel-sap-business-one/panel-procedimiento-autorizacion/panel-informe-status-autorizacion/panel-informe-status-autorizacion-options/panel-informe-status-autorizacion-options.component';
import { PanelInformeStatusAutorizacionComponent } from './components/panel-sap-business-one/panel-procedimiento-autorizacion/panel-informe-status-autorizacion/panel-informe-status-autorizacion/panel-informe-status-autorizacion.component';

const ROUTES: Routes =
[
  { path: 'panel-informe-status-autorizacion-options',         data: { breadcrumb: 'Informe status de autorización' }, component: PanelInformeStatusAutorizacionOptionsComponent },
  { path: 'panel-informe-status-autorizacion',                 data: { breadcrumb: 'Informe status de autorización' }, component: PanelInformeStatusAutorizacionComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class AprobacionesRoutingModule {}
