import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-panel-cerrar',
  templateUrl: './panel-cerrar.component.html'
})
export class PanelCerrarComponent implements OnInit, OnDestroy {

  @Input() isClosing: Boolean;
  constructor() { }

  ngOnInit(): void {}
  ngOnDestroy() {}
}
