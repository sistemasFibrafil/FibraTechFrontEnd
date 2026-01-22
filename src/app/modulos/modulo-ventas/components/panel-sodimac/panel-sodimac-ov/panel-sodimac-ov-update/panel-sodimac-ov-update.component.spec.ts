import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSodimacOrdenVentaUpdateComponent } from './panel-sodimac-ov-update.component';

describe('PanelSodimacOrdenVentaUpdateComponent', () => {
  let component: PanelSodimacOrdenVentaUpdateComponent;
  let fixture: ComponentFixture<PanelSodimacOrdenVentaUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSodimacOrdenVentaUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSodimacOrdenVentaUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
