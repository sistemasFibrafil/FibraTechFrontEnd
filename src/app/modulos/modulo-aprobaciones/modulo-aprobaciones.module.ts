import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';
import { AprobacionesRoutingModule } from './modulo-aprobaciones-routing.module';
import { AprobacionesPrimeNgModule } from './modulo-aprobaciones-primeng.module';

import { PanelInformeStatusAutorizacionOptionsComponent } from './components/panel-sap-business-one/panel-procedimiento-autorizacion/panel-informe-status-autorizacion/panel-informe-status-autorizacion-options/panel-informe-status-autorizacion-options.component';
import { PanelInformeStatusAutorizacionComponent } from './components/panel-sap-business-one/panel-procedimiento-autorizacion/panel-informe-status-autorizacion/panel-informe-status-autorizacion/panel-informe-status-autorizacion.component';


@NgModule({
    declarations:
    [
      PanelInformeStatusAutorizacionOptionsComponent,
      PanelInformeStatusAutorizacionComponent
    ],
    imports:
    [
      CommonModule,
      AprobacionesPrimeNgModule,
      AprobacionesRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class AprobacionesModule {}
