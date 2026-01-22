import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelVentaByFilterComponent } from './panel-venta-by-filter.component';

describe('PanelVentaByFilterComponent', () => {
  let component: PanelVentaByFilterComponent;
  let fixture: ComponentFixture<PanelVentaByFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelVentaByFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelVentaByFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
