import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelFacturaReservaEditComponent } from './panel-factura-reserva-edit.component';

describe('PanelFacturaReservaEditComponent', () => {
  let component: PanelFacturaReservaEditComponent;
  let fixture: ComponentFixture<PanelFacturaReservaEditComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelFacturaReservaEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelFacturaReservaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should edit', () => {
    expect(component).toBeTruthy();
  });
});
