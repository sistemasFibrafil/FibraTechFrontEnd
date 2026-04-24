import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelDocumentoPreliinarOptionsComponent } from './components/panel-informes/panel-documento-preliminar-options/panel-documento-preliminar-options.component';
import { PanelDocumentoPreliminarComponent } from './components/panel-informes/panel-documento-preliminar/panel-documento-preliminar.component';

const ROUTES: Routes =
[
  { path: 'panel-documento-preliminar-options',                                   data: { breadcrumb: 'Informe documento preliminar' }, component: PanelDocumentoPreliinarOptionsComponent },
  { path: 'panel-documento-preliminar',                                           data: { breadcrumb: 'Informe documento preliminar' }, component: PanelDocumentoPreliminarComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class DocumentosBorradorRoutingModule {}
