import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaDetalladoDirecionFiscalComponent } from './panel-ov-detallado-direccion-fiscal.component';

describe('PanelOrdenVentaDetalladoDirecionFiscalComponent', () => {
  let component: PanelOrdenVentaDetalladoDirecionFiscalComponent;
  let fixture: ComponentFixture<PanelOrdenVentaDetalladoDirecionFiscalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaDetalladoDirecionFiscalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaDetalladoDirecionFiscalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
