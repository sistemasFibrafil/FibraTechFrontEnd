import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEntregaListComponent } from './panel-entrega-list.component';

describe('PanelEntregaListComponent', () => {
  let component: PanelEntregaListComponent;
  let fixture: ComponentFixture<PanelEntregaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelEntregaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelEntregaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
