import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';
import { GestionPrimeNgModule } from './modulo-gestion-primeng.module';
import { GestionRoutingModule } from './modulo-gestion-routing.module';



@NgModule({
    declarations:
    [
    ],
    imports:
    [
      CommonModule,
      GestionPrimeNgModule,
      GestionRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [],
    providers: [],
})
export class GestionModule {}
