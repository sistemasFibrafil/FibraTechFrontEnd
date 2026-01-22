import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelArticuloByGrupoSubGrupoFiltroComponent } from './panel-articulo-by-grupo-sub-grupo-filtro.component';

describe('PanelArticuloByGrupoSubGrupoFiltroComponent', () => {
  let component: PanelArticuloByGrupoSubGrupoFiltroComponent;
  let fixture: ComponentFixture<PanelArticuloByGrupoSubGrupoFiltroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelArticuloByGrupoSubGrupoFiltroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelArticuloByGrupoSubGrupoFiltroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
