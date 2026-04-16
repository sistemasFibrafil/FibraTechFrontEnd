import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelFacturaReservaListComponent } from './panel-factura-reserva-list.component';

describe('PanelFacturaReservaListComponent', () => {
  let component: PanelFacturaReservaListComponent;
  let fixture: ComponentFixture<PanelFacturaReservaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelFacturaReservaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelFacturaReservaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should list', () => {
    expect(component).toBeTruthy();
  });
});
