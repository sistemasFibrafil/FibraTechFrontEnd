import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelArticuloVentaByGrupoSubGrupoEstadoComponent } from './panel-articulo-venta-by-grupo-sub-grupo-estado.component';

describe('PanelArticuloVentaByGrupoSubGrupoEstadoComponent', () => {
  let component: PanelArticuloVentaByGrupoSubGrupoEstadoComponent;
  let fixture: ComponentFixture<PanelArticuloVentaByGrupoSubGrupoEstadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelArticuloVentaByGrupoSubGrupoEstadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelArticuloVentaByGrupoSubGrupoEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
