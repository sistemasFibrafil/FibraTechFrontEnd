import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaPreliminarByFechaComponent } from './panel-ov-preliminar-by-fecha.component';

describe('PanelOrdenVentaPreliminarByFechaComponent', () => {
  let component: PanelOrdenVentaPreliminarByFechaComponent;
  let fixture: ComponentFixture<PanelOrdenVentaPreliminarByFechaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaPreliminarByFechaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaPreliminarByFechaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
