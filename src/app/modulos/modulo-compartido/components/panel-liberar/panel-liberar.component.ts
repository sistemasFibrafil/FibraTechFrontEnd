import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-panel-liberar',
  templateUrl: './panel-liberar.component.html'
})
export class PanelLiberarComponent implements OnInit, OnDestroy {

  @Input() isDisplay: Boolean;
  constructor() { }

  ngOnInit(): void {}
  ngOnDestroy() {}
}
