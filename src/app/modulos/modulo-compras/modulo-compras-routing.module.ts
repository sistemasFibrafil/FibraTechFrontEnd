import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelSolicitdCompraListComponent } from './components/panel-solicitud-compra/panel-solicitud-compra-list/panel-solicitud-compra-list.component';
import { PanelSolicitudCompraCreateComponent } from './components/panel-solicitud-compra/panel-solicitud-compra-create/panel-solicitud-compra-create.component';
import { PanelSolicitudCompraEditComponent } from './components/panel-solicitud-compra/panel-solicitud-compra-edit/panel-solicitud-compra-edit.component';
import { PanelSolicitudCompraViewComponent } from './components/panel-solicitud-compra/panel-solicitud-compra-view/panel-solicitud-compra-view.component';


const ROUTES: Routes =
[
  { path: 'panel-solicitud-compra-list',                                 data: { breadcrumb: 'Solicitud de compra' },                                        component: PanelSolicitdCompraListComponent },
  { path: 'panel-solicitud-compra-create',                               data: { breadcrumb: 'Solicitud de compra' },                                        component: PanelSolicitudCompraCreateComponent },
  { path: 'panel-solicitud-compra-edit/:id',                             data: { breadcrumb: 'Solicitud de compra' },                                        component: PanelSolicitudCompraEditComponent },
  { path: 'panel-solicitud-compra-view/:id',                             data: { breadcrumb: 'Solicitud de compra' },                                        component: PanelSolicitudCompraViewComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class ComprasRoutingModule {}
