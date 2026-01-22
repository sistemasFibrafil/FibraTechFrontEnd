import { NgModule } from '@angular/core';

import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
    declarations: [],
    imports: [  ],
    exports: [ PanelModule, TableModule, ButtonModule, InputTextModule, CalendarModule, ChartModule, DividerModule, DropdownModule],
    providers: [],
})
export class DashboardPrimeNgModule {}