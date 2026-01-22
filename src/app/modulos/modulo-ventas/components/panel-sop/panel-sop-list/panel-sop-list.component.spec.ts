import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSopListComponent } from './panel-sop-list.component';

describe('PanelSopListComponent', () => {
  let component: PanelSopListComponent;
  let fixture: ComponentFixture<PanelSopListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSopListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSopListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
