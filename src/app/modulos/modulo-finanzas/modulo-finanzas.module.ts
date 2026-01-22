import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { FinanzasPrimeNgModule } from './modulo-finanzas-primeng.module';
import { FinanzasRoutingModule } from './modulo-finanzas-routing.module';
import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';



@NgModule({
    declarations:
    [
    ],
    imports:
    [
      CommonModule,
      FinanzasPrimeNgModule,
      FinanzasRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class FinanzasModule {}
