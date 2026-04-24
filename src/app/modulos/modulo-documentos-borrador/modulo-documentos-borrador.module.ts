import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';
import { DocumentosBorradorRoutingModule } from './modulo-documentos-borrador-routing.module';
import { DocumentosBorradorPrimeNgModule } from './modulo-documentos-borrador-primeng.module';
import { PanelDocumentoPreliinarOptionsComponent } from './components/panel-informes/panel-documento-preliminar-options/panel-documento-preliminar-options.component';
import { PanelDocumentoPreliminarComponent } from './components/panel-informes/panel-documento-preliminar/panel-documento-preliminar.component';

@NgModule({
    declarations:
    [
      PanelDocumentoPreliinarOptionsComponent,
      PanelDocumentoPreliminarComponent
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
