import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaListComponent } from './panel-orden-venta-list.component';

describe('PanelOrdenVentaListComponent', () => {
  let component: PanelOrdenVentaListComponent;
  let fixture: ComponentFixture<PanelOrdenVentaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
