import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-panel-eliminar',
  templateUrl: './panel-eliminar.component.html'
})
export class PanelEliminarComponent implements OnInit, OnDestroy {

  @Input() isDisplay: Boolean;
  constructor() { }

  ngOnInit(): void {}
  ngOnDestroy() {}
}
