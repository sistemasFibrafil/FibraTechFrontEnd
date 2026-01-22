import { Component, OnInit, Input } from '@angular/core';
import { LayoutComponent } from '../layout.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

 @Input() model: any[];

  constructor(public app: LayoutComponent) { }

  ngOnInit() {
    //   this.model = [
    //       { label: 'Dashboard', icon: 'fa fa-fw fa-dashboard' },
    //       {
    //         label: 'Configuración', icon: 'fa fa-fw fa-cog',
    //         items: [
    //             { label: 'Usuario', icon: 'fa fa-fw fa-user', routerLink: ['modulo-se/panel-persona'] },
    //             {
    //                 label: 'Acceso', icon: 'fa fa-fw fa-briefcase',
    //                 items: [
    //                     { label: 'Perfil', icon: 'fa fa-fw fa-user',
    //                     routerLink: ['modulo-se/panel-perfil'] },
    //                     { label: 'Menu', icon: 'fa fa-fw fa-sitemap',
    //                     routerLink: ['modulo-se/panel-menu'] },
    //                     { label: 'Opciones', icon: 'fa fa-fw fa-filter',
    //                     routerLink: ['modulo-se/panel-opcion'] },
    //                     { label: 'Opciones por Perfil', icon: 'fa fa-fw fa-users',
    //                     routerLink: ['modulo-se/panel-opcion-x-perfil'] }
    //                 ]
    //             },
    //             {
    //                 label: 'Parametros', icon: 'fa fa-fw fa-cogs',
    //                 items: [
    //                     { label: 'Conexión', icon: 'fa fa-fw fa-database',
    //                     routerLink: ['modulo-se/panel-parametro-conexion'] },
    //                     { label: 'Sistema', icon: 'fa fa-fw fa-cog',
    //                     routerLink: ['modulo-se/panel-parametro-sistema'] }
    //                 ]
    //             }
    //         ]
    //     },
    //     { label: 'Docs', icon: 'fa fa-fw fa-book', routerLink: ['/documentation'] }
    //   ];
  }
}
