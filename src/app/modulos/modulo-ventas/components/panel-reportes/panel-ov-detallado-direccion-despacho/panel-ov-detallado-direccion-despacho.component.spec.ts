import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaDetalladoDirecionDespachoComponent } from './panel-ov-detallado-direccion-despacho.component';

describe('PanelOrdenVentaDetalladoDirecionDespachoComponent', () => {
  let component: PanelOrdenVentaDetalladoDirecionDespachoComponent;
  let fixture: ComponentFixture<PanelOrdenVentaDetalladoDirecionDespachoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaDetalladoDirecionDespachoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaDetalladoDirecionDespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
