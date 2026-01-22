import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEntregaViewComponent } from './panel-entrega-view.component';

describe('PanelEntregaViewComponent', () => {
  let component: PanelEntregaViewComponent;
  let fixture: ComponentFixture<PanelEntregaViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelEntregaViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelEntregaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
