import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaProgramcionByFechaComponent } from './panel-ov-programacion-by-fecha.component';

describe('PanelOrdenVentaProgramcionByFechaComponent', () => {
  let component: PanelOrdenVentaProgramcionByFechaComponent;
  let fixture: ComponentFixture<PanelOrdenVentaProgramcionByFechaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaProgramcionByFechaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaProgramcionByFechaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
