import { Component, OnInit, ElementRef } from '@angular/core';
import { LayoutService } from '../../services/app.layout.service';
import { MenuDinamicoService } from '../../services/menu-dinamico.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  model: any[] = [];

  constructor(
    public layoutService: LayoutService, 
    public el: ElementRef,
    public menuDinamicoService: MenuDinamicoService) { 
    this.model = this.menuDinamicoService.getObtieneMenuDinamico();
  }
}
