import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-panel-cancelar',
  templateUrl: './panel-cancelar.component.html'
})
export class PanelCancelarComponent implements OnInit, OnDestroy {

  @Input() isCancel: Boolean;
  constructor() { }

  ngOnInit(): void {}
  ngOnDestroy() {}
}
