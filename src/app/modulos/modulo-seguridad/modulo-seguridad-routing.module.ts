import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PanelPerfilComponent } from './components/panel-perfil/panel-perfil.component';
import { PerfilCreateComponent } from './components/panel-perfil/perfil-create/perfil-create.component';
import { PanelPersonaComponent } from './components/panel-persona/panel-persona.component';
import { PersonaCreateComponent } from './components/panel-persona/persona-create/persona-create.component';
import { PersonaUpdateComponent } from './components/panel-persona/persona-update/persona-update.component';
import { PanelMenuComponent } from './components/panel-menu/panel-menu.component';
import { PanelOpcionComponent } from './components/panel-opcion/panel-opcion.component';
import { OpcionCreateComponent } from './components/panel-opcion/opcion-create/opcion-create.component';
import { PanelOpcionPorPerfilComponent } from './components/panel-opcion-por-perfil/panel-opcion-por-perfil.component';
import { PanelConexionComponent } from './components/panel-conexion/panel-conexion.component';
import { PanelSistemaComponent } from './components/panel-sistema/panel-sistema.component';
import { PanelRecuperarClaveComponent } from './components/panel-recuperar-clave/panel-recuperar-clave.component';
import { PanelAuditoriaComponent } from './components/panel-auditoria/panel-auditoria.component';
import { PersonaPermisoLogisticoComponent } from './components/panel-persona/persona-permiso-logistico/persona-permiso-logistico.component';

const ROUTES: Routes = [
    { path: 'panel-perfil',                   data: { breadcrumb: 'Perfil' },             component: PanelPerfilComponent},
    { path: 'perfil-create',                  data: { breadcrumb: 'Registrar Perfil' },   component: PerfilCreateComponent},
    { path: 'panel-persona',                  data: { breadcrumb: 'Usuario' },            component: PanelPersonaComponent},
    { path: 'persona-create',                 data: { breadcrumb: 'Registrar Usuario' },  component: PersonaCreateComponent },
    { path: 'persona-update/:id',             data: { breadcrumb: 'Editar Usuario' },     component: PersonaUpdateComponent },
    { path: 'persona-permiso-logistico/:id',  data: { breadcrumb: 'Permiso Logistico' },  component: PersonaPermisoLogisticoComponent },
    { path: 'panel-menu',                     data: { breadcrumb: 'Menu' },               component: PanelMenuComponent},
    { path: 'panel-opcion',                   data: { breadcrumb: 'Opción' },             component: PanelOpcionComponent},
    { path: 'opcion-create/:id',              data: { breadcrumb: 'Nueva Opción' },       component: OpcionCreateComponent},
    { path: 'panel-opcion-x-perfil',          data: { breadcrumb: 'Opción por Perfil' },  component: PanelOpcionPorPerfilComponent},
    { path: 'panel-parametro-conexion',       data: { breadcrumb: 'Parametro Conexión' }, component: PanelConexionComponent},
    { path: 'panel-parametro-sistema',        data: { breadcrumb: 'Parametro Sistemas' }, component: PanelSistemaComponent},
    { path: 'panel-recuperar-clave',          data: { breadcrumb: 'Recuperar Clave' },    component: PanelRecuperarClaveComponent},
    { path: 'panel-auditoria',                data: { breadcrumb: 'Audítoria' },          component: PanelAuditoriaComponent},
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class SeguridadRoutingModule {}
