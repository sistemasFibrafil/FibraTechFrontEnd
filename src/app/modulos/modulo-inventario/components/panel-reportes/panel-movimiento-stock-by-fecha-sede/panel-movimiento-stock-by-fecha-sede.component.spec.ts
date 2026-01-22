import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelMovimientoStockByFechaSedeComponent } from './panel-movimiento-stock-by-fecha-sede.component';

describe('PanelMovimientoStockByFechaSedeComponent', () => {
  let component: PanelMovimientoStockByFechaSedeComponent;
  let fixture: ComponentFixture<PanelMovimientoStockByFechaSedeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelMovimientoStockByFechaSedeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelMovimientoStockByFechaSedeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
