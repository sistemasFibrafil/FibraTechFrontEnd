import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardPrimeNgModule } from './modulo-dashboard-primeng.module';
import { DashboardRoutingModule } from './modulo-dashboard-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
    ],
    imports: [ CommonModule, DashboardPrimeNgModule, DashboardRoutingModule, ReactiveFormsModule ],
    exports: [],
    providers: [],
})
export class DashboardModule {}