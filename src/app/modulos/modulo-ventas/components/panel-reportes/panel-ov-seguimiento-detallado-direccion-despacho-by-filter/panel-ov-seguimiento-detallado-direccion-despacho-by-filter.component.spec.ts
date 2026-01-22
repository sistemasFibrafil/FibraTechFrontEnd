import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaSeguimientoDetalladoDirecionDespachoByFilterComponent } from './panel-ov-seguimiento-detallado-direccion-despacho-by-filter.component';

describe('PanelOrdenVentaSeguimientoDetalladoDirecionDespachoByFilterComponent', () => {
  let component: PanelOrdenVentaSeguimientoDetalladoDirecionDespachoByFilterComponent;
  let fixture: ComponentFixture<PanelOrdenVentaSeguimientoDetalladoDirecionDespachoByFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaSeguimientoDetalladoDirecionDespachoByFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaSeguimientoDetalladoDirecionDespachoByFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
