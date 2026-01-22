import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RecursosHumanosPrimeNgModule } from './modulo-recursos-humanos-primeng.module';
import { RecursosHumanosRoutingModule } from './modulo-recursos-humanos-routing.module';
import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';



@NgModule({
    declarations:
    [
    ],
    imports:
    [
      CommonModule,
      RecursosHumanosPrimeNgModule,
      RecursosHumanosRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class RecursosHumanosModule {}
