import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent } from './panel-ov-seguimiento-detallado-direccion-fiscal-by-filter.component';

describe('PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent', () => {
  let component: PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent;
  let fixture: ComponentFixture<PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaSeguimientoDetalladoDirecionFiscalByFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
