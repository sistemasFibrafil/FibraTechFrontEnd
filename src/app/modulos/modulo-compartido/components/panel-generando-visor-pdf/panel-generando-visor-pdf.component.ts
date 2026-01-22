import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-panel-generando-visor-pdf',
  templateUrl: './panel-generando-visor-pdf.component.html'
})
export class PanelGerandoVisorPdfComponent implements OnInit, OnDestroy {

  @Input() isDisplay: Boolean;
  constructor() { }

  ngOnInit(): void {}
  ngOnDestroy() {}
}
