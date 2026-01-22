import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelFacturaVentaByFilterComponent } from './panel-factura-venta-by-filter.component';

describe('PanelFacturaVentaByFilterComponent', () => {
  let component: PanelFacturaVentaByFilterComponent;
  let fixture: ComponentFixture<PanelFacturaVentaByFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelFacturaVentaByFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelFacturaVentaByFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
