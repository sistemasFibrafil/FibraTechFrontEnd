import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPickingListComponent } from './panel-picking-list.component';

describe('PanelPickingListComponent', () => {
  let component: PanelPickingListComponent;
  let fixture: ComponentFixture<PanelPickingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPickingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPickingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
