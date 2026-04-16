import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelFacturaReservaCreateComponent } from './panel-factura-reserva-create.component';

describe('PanelFacturaReservaCreateComponent', () => {
  let component: PanelFacturaReservaCreateComponent;
  let fixture: ComponentFixture<PanelFacturaReservaCreateComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelFacturaReservaCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelFacturaReservaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
