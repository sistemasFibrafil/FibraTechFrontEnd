import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ComprasPrimeNgModule } from './modulo-compras-primeng.module';
import { ComprasRoutingModule } from './modulo-compras-routing.module';
import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';

import { PanelSolicitdCompraListComponent } from './components/panel-solicitud-compra/panel-solicitud-compra-list/panel-solicitud-compra-list.component';
import { PanelSolicitudCompraCreateComponent } from './components/panel-solicitud-compra/panel-solicitud-compra-create/panel-solicitud-compra-create.component';
import { PanelSolicitudCompraEditComponent } from './components/panel-solicitud-compra/panel-solicitud-compra-edit/panel-solicitud-compra-edit.component';
import { PanelSolicitudCompraViewComponent } from './components/panel-solicitud-compra/panel-solicitud-compra-view/panel-solicitud-compra-view.component';


@NgModule({
    declarations:
    [
      PanelSolicitdCompraListComponent,
      PanelSolicitudCompraCreateComponent,
      PanelSolicitudCompraEditComponent,
      PanelSolicitudCompraViewComponent
    ],
    imports:
    [
      CommonModule,
      ComprasRoutingModule,
      ComprasPrimeNgModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class ComprasModule {}
