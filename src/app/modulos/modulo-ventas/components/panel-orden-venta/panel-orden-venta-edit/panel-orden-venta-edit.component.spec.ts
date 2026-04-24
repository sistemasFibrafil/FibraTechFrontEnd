import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaEditComponent } from './panel-orden-venta-edit.component';

describe('PanelOrdenVentaEditComponent', () => {
  let component: PanelOrdenVentaEditComponent;
  let fixture: ComponentFixture<PanelOrdenVentaEditComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
