import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEntregaUpdateComponent } from './panel-entrega-update.component';

describe('PanelEntregaUpdateComponent', () => {
  let component: PanelEntregaUpdateComponent;
  let fixture: ComponentFixture<PanelEntregaUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelEntregaUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelEntregaUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
