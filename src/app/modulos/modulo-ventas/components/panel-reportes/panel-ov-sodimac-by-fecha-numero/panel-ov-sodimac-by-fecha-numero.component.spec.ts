import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenVentaSodimacByFechaNumeroComponent } from './panel-ov-sodimac-by-fecha-numero.component';

describe('PanelOrdenVentaSodimacByFechaNumeroComponent', () => {
  let component: PanelOrdenVentaSodimacByFechaNumeroComponent;
  let fixture: ComponentFixture<PanelOrdenVentaSodimacByFechaNumeroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenVentaSodimacByFechaNumeroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenVentaSodimacByFechaNumeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
