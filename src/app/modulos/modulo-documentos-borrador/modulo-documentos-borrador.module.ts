import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';
import { DocumentosBorradorRoutingModule } from './modulo-documentos-borrador-routing.module';
import { DocumentosBorradorPrimeNgModule } from './modulo-documentos-borrador-primeng.module';

import { PanelDocumentoBorradorListComponent } from './components/panel-documento-borrador/panel-documento-borrador-list/panel-documento-borrador-list.component';
import { PanelDocumentoBorradorCreateComponent } from './components/panel-documento-borrador/panel-documento-borrador-create/panel-documento-borrador-create.component';
import { PanelDocumentoBorradorEditComponent } from './components/panel-documento-borrador/panel-documento-borrador-edit/panel-documento-borrador-edit.component';
import { PanelDocumentoBorradorViewComponent } from './components/panel-documento-borrador/panel-documento-borrador-view/panel-documento-borrador-view.component';

@NgModule({
    declarations:
    [
      PanelDocumentoBorradorListComponent,
      PanelDocumentoBorradorCreateComponent,
      PanelDocumentoBorradorEditComponent,
      PanelDocumentoBorradorViewComponent
    ],
    imports:
    [
      CommonModule,
      DocumentosBorradorPrimeNgModule,
      DocumentosBorradorRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class DocumentosBorradorModule {}
