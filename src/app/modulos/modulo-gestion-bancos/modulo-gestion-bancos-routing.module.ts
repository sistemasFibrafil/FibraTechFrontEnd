import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanelCobranzaCarteraVencidaByFilterComponent } from './components/panel-reportes/panel-cobranza-cartera-vencida-by-filter/panel-cobranza-cartera-vencida-by-filter.component';


const ROUTES: Routes = [
  { path: 'panel-cobranza-cartera-vencida-by-filter', data: { breadcrumb: 'Informe - Cobranza de Carteras Vencidas' }, component: PanelCobranzaCarteraVencidaByFilterComponent },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class GestionBancosRoutingModule {}
