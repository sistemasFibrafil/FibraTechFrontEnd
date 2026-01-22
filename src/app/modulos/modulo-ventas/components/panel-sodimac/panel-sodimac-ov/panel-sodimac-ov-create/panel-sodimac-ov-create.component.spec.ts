import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSodimacOrdenVentaCreateComponent } from './panel-sodimac-ov-create.component';

describe('PanelSodimacOrdenVentaCreateComponent', () => {
  let component: PanelSodimacOrdenVentaCreateComponent;
  let fixture: ComponentFixture<PanelSodimacOrdenVentaCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSodimacOrdenVentaCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSodimacOrdenVentaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
