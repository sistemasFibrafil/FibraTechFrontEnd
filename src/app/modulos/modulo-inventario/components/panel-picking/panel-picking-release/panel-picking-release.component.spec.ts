import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPickingReleaseComponent } from './panel-picking-release.component';

describe('PanelPickingReleaseComponent', () => {
  let component: PanelPickingReleaseComponent;
  let fixture: ComponentFixture<PanelPickingReleaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelPickingReleaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelPickingReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
