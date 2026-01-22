import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-panel-guardar',
  templateUrl: './panel-guardar.component.html'
})
export class PanelGuardarComponent implements OnInit, OnDestroy {

  @Input() isDisplay: Boolean;
  constructor() { }

  ngOnInit(): void {}
  ngOnDestroy() {}
}
