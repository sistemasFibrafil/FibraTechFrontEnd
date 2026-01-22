import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSodimacOrdenVentaListComponent } from './panel-sodimac-ov-list.component';

describe('PanelSodimacOrdenVentaListComponent', () => {
  let component: PanelSodimacOrdenVentaListComponent;
  let fixture: ComponentFixture<PanelSodimacOrdenVentaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSodimacOrdenVentaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSodimacOrdenVentaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
