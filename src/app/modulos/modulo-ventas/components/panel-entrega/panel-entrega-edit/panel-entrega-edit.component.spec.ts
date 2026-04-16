import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEntregaEditComponent } from './panel-entrega-edit.component';

describe('PanelEntregaEditComponent', () => {
  let component: PanelEntregaEditComponent;
  let fixture: ComponentFixture<PanelEntregaEditComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelEntregaEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelEntregaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should edit', () => {
    expect(component).toBeTruthy();
  });
});
