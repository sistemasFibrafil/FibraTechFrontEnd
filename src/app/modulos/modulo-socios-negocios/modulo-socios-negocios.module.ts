import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SociosNegociosRoutingNgModule } from './modulo-socios-negocios-routing.module';
import { SociosNegociosPrimeNgModule } from './modulo-socios-negocios-primeng.module';

import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';

import { PanelClienteBySectorEstadoComponent } from './components/panel-reportes/panel-cliente-by-sector-estado/panel-cliente-by-sector-estado.component';


@NgModule({
    declarations:
    [
      PanelClienteBySectorEstadoComponent,
    ],
    imports:
    [
      CommonModule,
      SociosNegociosPrimeNgModule,
      SociosNegociosRoutingNgModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class SociosNegociosModule {}
