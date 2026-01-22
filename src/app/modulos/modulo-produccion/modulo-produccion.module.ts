import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ProduccionPrimeNgModule } from './modulo-produccion-primeng.module';
import { ProduccionRoutingModule } from './modulo-produccion-routing.module';

import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';

import { OrdenMantenimientoWebListComponent } from './components/orden-mantenimiento/list/om-web-list.component';
import { OrdenMantenimientoWebCreateComponent } from './components/orden-mantenimiento/create/om-web-create.component';

import { PanelOrdenFabricacionByFechaSedeComponent } from './components/panel-reportes/panel-of-by-fecha-sede/panel-of-by-fecha-sede.component';
import { PanelOrdenFabricacionGeneralByFechaSedeComponent } from './components/panel-reportes/panel-of-general-by-fecha-sede/panel-of-general-by-fecha-sede.component';

@NgModule({
    declarations:
    [
      OrdenMantenimientoWebListComponent,
      OrdenMantenimientoWebCreateComponent,

      PanelOrdenFabricacionByFechaSedeComponent,
      PanelOrdenFabricacionGeneralByFechaSedeComponent,
    ],
    imports:
    [
      CommonModule,
      ProduccionPrimeNgModule,
      ProduccionRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class ProduccionModule {}
