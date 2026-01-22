import { Component, ElementRef, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { LayoutService } from '../../services/app.layout.service';
import { UserContextService } from '../../services/user-context.service';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { FilterService, SelectItemGroup } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SwaCustomService } from 'src/app/services/swa-custom.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnDestroy {

  isUserImage: string;
  isBabge: string = '0';

  groupedMenus: SelectItemGroup[];
  filteredGroups: any[];
  selectedItem: any;
  subscription$: Subscription;

  @ViewChild('menubutton') menuButton!: ElementRef;
  @Output() eventChangeAprobacion = new EventEmitter<any>();

  constructor(
    public layoutService: LayoutService,
    private filterService: FilterService,
    private sessionService: SessionService,
    private readonly router: Router,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService) {
      this.onInicializar();
    }

  onMenuButtonClick() {
      this.layoutService.onMenuToggle();
  }

  onProfileButtonClick() {
      this.layoutService.showProfileSidebar();
  }

  onInicializar() {
    this.isUserImage = this.userContextService.getImagen();
    this.onObtenerMenuAcceso();
  }

  onObtenerMenuAcceso() {
    let menu = this.sessionService.getItem('menu');

    let items: any[] = [];
    this.groupedMenus = [];
    for (let iterator of menu) {

      items = [];

      let listItems = iterator.items === undefined || iterator.items === null ? [] : iterator.items;

      for (let item of listItems) {
        items.push({label: item.label, value: item.routerLink});
      }

      this.groupedMenus.push({
        label: iterator.label,
        value: '/',
        items: items
      })
    }
  }

  filterGroupedMenu(event) {
    let query = event.query;
    let filteredGroups = [];

    for (let optgroup of this.groupedMenus) {
        let filteredSubOptions = this.filterService.filter(optgroup.items, ['label'], query, "contains");
        if (filteredSubOptions && filteredSubOptions.length) {
            filteredGroups.push({
                label: optgroup.label,
                value: optgroup.value,
                items: filteredSubOptions
            });
        }
    }

    this.filteredGroups = filteredGroups;
  }

  goSelectMenu() {
      this.router.navigate([`/main/${this.selectedItem.value}`]);
      this.selectedItem = null;
  }

  ngOnDestroy() {

    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }
}
