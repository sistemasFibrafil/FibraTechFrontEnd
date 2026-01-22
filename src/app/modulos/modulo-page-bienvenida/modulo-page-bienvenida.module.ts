import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';
import { PageBienvenidaRoutingModule } from './modulo-page-bienvenida-routing.module';
import { PageBienvenidaPrimeNgModule } from './modulo-page-bienvenida-primeng.module';
import { PageInicialComponent } from './components/page-inicial/page-inicial.component';

@NgModule({
    declarations: [
        PageInicialComponent
        ],
    imports: [
        CommonModule,
        CompartidoModule,
        PageBienvenidaPrimeNgModule,
        PageBienvenidaRoutingModule
    ],
    exports: [],
    providers: [],
})
export class PageBienvenidaModule {}
