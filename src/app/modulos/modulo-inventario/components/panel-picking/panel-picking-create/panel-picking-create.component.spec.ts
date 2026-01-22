import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPickingCreateComponent } from './panel-picking-create.component';

describe('PanelPickingCreateComponent', () => {
  let component: PanelPickingCreateComponent;
  let fixture: ComponentFixture<PanelPickingCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPickingCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPickingCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
