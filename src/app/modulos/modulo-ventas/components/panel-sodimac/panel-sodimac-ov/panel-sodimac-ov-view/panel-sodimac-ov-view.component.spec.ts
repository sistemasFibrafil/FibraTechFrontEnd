import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSodimacOrdenVentaViewComponent } from './panel-sodimac-ov-view.component';

describe('PanelSodimacOrdenVentaViewComponent', () => {
  let component: PanelSodimacOrdenVentaViewComponent;
  let fixture: ComponentFixture<PanelSodimacOrdenVentaViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSodimacOrdenVentaViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSodimacOrdenVentaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
