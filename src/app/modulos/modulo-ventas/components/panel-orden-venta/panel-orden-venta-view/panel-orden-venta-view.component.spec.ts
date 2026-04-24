import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaViewComponent } from './panel-orden-venta-view.component';

describe('PanelOrdenVentaViewComponent', () => {
  let component: PanelOrdenVentaViewComponent;
  let fixture: ComponentFixture<PanelOrdenVentaViewComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
