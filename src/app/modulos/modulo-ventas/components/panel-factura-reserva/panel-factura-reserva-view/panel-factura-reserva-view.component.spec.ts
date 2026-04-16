import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelFacturaReservaViewComponent } from './panel-factura-reserva-view.component';

describe('PanelFacturaReservaViewComponent', () => {
  let component: PanelFacturaReservaViewComponent;
  let fixture: ComponentFixture<PanelFacturaReservaViewComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelFacturaReservaViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelFacturaReservaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should view', () => {
    expect(component).toBeTruthy();
  });
});
