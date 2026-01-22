import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaPendienteStockAlmaProdByFechaComponent } from './panel-ov-pendiente-stock-alma-prod-by-fecha.component';

describe('PanelOrdenVentaPendienteStockAlmaProdByFechaComponent', () => {
  let component: PanelOrdenVentaPendienteStockAlmaProdByFechaComponent;
  let fixture: ComponentFixture<PanelOrdenVentaPendienteStockAlmaProdByFechaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaPendienteStockAlmaProdByFechaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaPendienteStockAlmaProdByFechaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
