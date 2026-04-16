import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelDocumentoBorradorListComponent } from './components/panel-documento-borrador/panel-documento-borrador-list/panel-documento-borrador-list.component';
import { PanelDocumentoBorradorCreateComponent } from './components/panel-documento-borrador/panel-documento-borrador-create/panel-documento-borrador-create.component';
import { PanelDocumentoBorradorEditComponent } from './components/panel-documento-borrador/panel-documento-borrador-edit/panel-documento-borrador-edit.component';
import { PanelDocumentoBorradorViewComponent } from './components/panel-documento-borrador/panel-documento-borrador-view/panel-documento-borrador-view.component';

const ROUTES: Routes =
[
  { path: 'panel-documento-borrador-list',                 data: { breadcrumb: 'Documento Borrador' }, component: PanelDocumentoBorradorListComponent },
  { path: 'panel-documento-borrador-create/:id',           data: { breadcrumb: 'Documento Borrador' }, component: PanelDocumentoBorradorCreateComponent },
  { path: 'panel-documento-borrador-edit/:id',             data: { breadcrumb: 'Documento Borrador' }, component: PanelDocumentoBorradorEditComponent },
  { path: 'panel-documento-borrador-view',                 data: { breadcrumb: 'Documento Borrador' }, component: PanelDocumentoBorradorViewComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class DocumentosBorradorRoutingModule {}
