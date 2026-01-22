import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelVentaResumenByFechaGrupoComponent } from './panel-venta-resumen-by-fecha-grupo.component';

describe('PanelVentaResumenByFechaGrupoComponent', () => {
  let component: PanelVentaResumenByFechaGrupoComponent;
  let fixture: ComponentFixture<PanelVentaResumenByFechaGrupoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelVentaResumenByFechaGrupoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelVentaResumenByFechaGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
