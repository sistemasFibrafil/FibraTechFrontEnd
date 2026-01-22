import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './modulos/modulo-login/components/login/login.component';
import { PanelRecuperarClaveComponent } from './modulos/modulo-seguridad/components/panel-recuperar-clave/panel-recuperar-clave.component';

const routes: Routes = [
  {path: 'login',  component: LoginComponent},
  {path: 'panel-recuperar-clave',  component: PanelRecuperarClaveComponent},
  {path: 'main', component: LayoutComponent,
    children:
    [
      {
        path: 'bienvenido',
        data: { breadcrumb: 'Bienvenido' },
        loadChildren: () => import('./modulos/modulo-page-bienvenida/modulo-page-bienvenida.module').then(m => m.PageBienvenidaModule)
      },
      {
        path: 'modulo-das',
        data: { breadcrumb: 'Dashboard' },
        loadChildren: () => import('./modulos/modulo-dashboard/modulo-dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-seg',
        data: { breadcrumb: 'Configuración' },
        loadChildren: () => import('./modulos/modulo-seguridad/modulo-seguridad.module').then(m => m.SeguridadModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-ges',
        data: { breadcrumb: 'Maestros' },
        loadChildren: () => import('./modulos/modulo-gestion/modulo-gestion.module').then(m => m.GestionModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-fin',
        data: { breadcrumb: 'Finanzas' },
        loadChildren: () => import('./modulos/modulo-finanzas/modulo-finanzas.module').then(m => m.FinanzasModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-inv',
        data: { breadcrumb: 'Inventario' },
        loadChildren: () => import('./modulos/modulo-inventario/modulo-inventario.module').then(m => m.InventarioModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-com',
        data: { breadcrumb: 'Compras' },
        loadChildren: () => import('./modulos/modulo-compras/modulo-compras.module').then(m => m.ComprasModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-ban',
        data: { breadcrumb: 'Reportes' },
        loadChildren: () => import('./modulos/modulo-gestion-bancos/modulo-gestion-bancos.module').then(m => m.GestionBancosModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-soc',
        data: { breadcrumb: 'Socios de Negocios' },
        loadChildren: () => import('./modulos/modulo-socios-negocios/modulo-socios-negocios.module').then(m => m.SociosNegociosModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-ven',
        data: { breadcrumb: 'Ventas' },
        loadChildren: () => import('./modulos/modulo-ventas/modulo-ventas.module').then(m => m.VentasModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-fac',
        data: { breadcrumb: 'Facturación Electrónica' },
        loadChildren: () => import('./modulos/modulo-facturacion-electronica/modulo-facturacion-electronica.module').then(m => m.FacturacionElectronicaModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-pro',
        data: { breadcrumb: 'Producción' },
        loadChildren: () => import('./modulos/modulo-produccion/modulo-produccion.module').then(m => m.ProduccionModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'modulo-rh',
        data: { breadcrumb: 'Recursos Humanos' },
        loadChildren: () => import('./modulos/modulo-recursos-humanos/modulo-recursos-humanos.module').then(m => m.RecursosHumanosModule),
        canActivate: [AuthGuard]
      },
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
