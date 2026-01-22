import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSopUpdateComponent } from './panel-sop-update.component';

describe('PanelSopUpdateComponent', () => {
  let component: PanelSopUpdateComponent;
  let fixture: ComponentFixture<PanelSopUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSopUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSopUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
