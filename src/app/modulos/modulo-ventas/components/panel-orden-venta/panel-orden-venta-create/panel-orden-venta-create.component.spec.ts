import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaCreateComponent } from './panel-orden-venta-create.component';

describe('PanelOrdenVentaCreateComponent', () => {
  let component: PanelOrdenVentaCreateComponent;
  let fixture: ComponentFixture<PanelOrdenVentaCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
