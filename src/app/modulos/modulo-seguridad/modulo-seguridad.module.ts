import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeguridadPrimeNgModule } from './modulo-seguridad-primeng.module';
import { PanelPerfilComponent } from './components/panel-perfil/panel-perfil.component';
import { PerfilCreateComponent } from './components/panel-perfil/perfil-create/perfil-create.component';
import { SeguridadRoutingModule } from './modulo-seguridad-routing.module';
import { PanelPersonaComponent } from './components/panel-persona/panel-persona.component';
import { PersonaCreateComponent } from './components/panel-persona/persona-create/persona-create.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PersonaUpdateComponent } from './components/panel-persona/persona-update/persona-update.component';
import { PanelMenuComponent } from './components/panel-menu/panel-menu.component';
import { PanelOpcionComponent } from './components/panel-opcion/panel-opcion.component';
import { OpcionCreateComponent } from './components/panel-opcion/opcion-create/opcion-create.component';
import { PanelOpcionPorPerfilComponent } from './components/panel-opcion-por-perfil/panel-opcion-por-perfil.component';
import { PanelSistemaComponent } from './components/panel-sistema/panel-sistema.component';
import { PanelConexionComponent } from './components/panel-conexion/panel-conexion.component';
import { PanelRecuperarClaveComponent } from './components/panel-recuperar-clave/panel-recuperar-clave.component';
import { PersonaVerComponent } from './components/panel-persona/persona-ver/persona-ver.component';
import { PanelAuditoriaComponent } from './components/panel-auditoria/panel-auditoria.component';
import { CompartidoModule } from '../modulo-compartido/modulo-compartido.module';
import { PersonaPermisoLogisticoComponent } from './components/panel-persona/persona-permiso-logistico/persona-permiso-logistico.component';


@NgModule({
    declarations:
    [
      PanelPerfilComponent,
      PerfilCreateComponent,
      PanelPersonaComponent,
      PersonaCreateComponent,
      PersonaUpdateComponent,
      PersonaPermisoLogisticoComponent,
      PanelMenuComponent,
      PanelOpcionComponent,
      OpcionCreateComponent,
      PanelOpcionPorPerfilComponent,
      PanelConexionComponent,
      PanelSistemaComponent,
      PanelRecuperarClaveComponent,
      PersonaVerComponent,
      PanelAuditoriaComponent,
    ],
    imports:
    [
      CommonModule,
      SeguridadPrimeNgModule,
      SeguridadRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      CompartidoModule
    ],
    exports: [PersonaVerComponent],
    providers: [],
})
export class SeguridadModule {}
