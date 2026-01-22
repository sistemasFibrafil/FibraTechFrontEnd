import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSolicitudCompraViewComponent } from './panel-solicitud-compra-view.component';

describe('PanelSolicitudCompraViewComponent', () => {
  let component: PanelSolicitudCompraViewComponent;
  let fixture: ComponentFixture<PanelSolicitudCompraViewComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSolicitudCompraViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSolicitudCompraViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should view', () => {
    expect(component).toBeTruthy();
  });
});
