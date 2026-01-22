import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelStockArticuloVentaByGrupoSubGrupoComponent } from './panel-stock-articulo-venta-by-grupo-sub-grupo.component';

describe('PanelStockArticuloVentaByGrupoSubGrupoComponent', () => {
  let component: PanelStockArticuloVentaByGrupoSubGrupoComponent;
  let fixture: ComponentFixture<PanelStockArticuloVentaByGrupoSubGrupoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelStockArticuloVentaByGrupoSubGrupoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelStockArticuloVentaByGrupoSubGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
