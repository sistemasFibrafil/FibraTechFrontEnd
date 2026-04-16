import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SociosNegociosRoutingNgModule } from './modulo-socios-negocios-routing.module';
import { SociosNegociosPrimeNgModule } from './modulo-socios-negocios-primeng.module';

import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';

import { PanelSocioNegociosListComponent } from './components/panel-socio-negocios/panel-socio-negocios-list/panel-socio-negocios-list.component';
import { PanelVehiculoComponent } from './components/panel-vehiculo/panel-vehiculo.component';
import { PanelConductorComponent } from './components/panel-conductor/panel-conductor.component';

import { PanelClienteBySectorEstadoComponent } from './components/panel-reportes/panel-cliente-by-sector-estado/panel-cliente-by-sector-estado.component';


@NgModule({
    declarations:
    [
      PanelSocioNegociosListComponent,
      PanelVehiculoComponent,
      PanelConductorComponent,

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
