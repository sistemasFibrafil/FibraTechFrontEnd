import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaSeguimientoByFilterComponent } from './panel-ov-seguimiento-by-filter.component';

describe('PanelOrdenVentaSeguimientoByFilterComponent', () => {
  let component: PanelOrdenVentaSeguimientoByFilterComponent;
  let fixture: ComponentFixture<PanelOrdenVentaSeguimientoByFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaSeguimientoByFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaSeguimientoByFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
