import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelStockGeneralDetalladoAlmacenByAlmacenComponent } from './panel-stock-general-detallado-almacen-by-almacen.component';

describe('PanelStockGeneralDetalladoAlmacenByAlmacenComponent', () => {
  let component: PanelStockGeneralDetalladoAlmacenByAlmacenComponent;
  let fixture: ComponentFixture<PanelStockGeneralDetalladoAlmacenByAlmacenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelStockGeneralDetalladoAlmacenByAlmacenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelStockGeneralDetalladoAlmacenByAlmacenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
