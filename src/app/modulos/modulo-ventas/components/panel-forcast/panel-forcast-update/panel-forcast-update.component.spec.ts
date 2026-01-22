import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelForcastUpdateComponent } from './panel-forcast-update.component';

describe('PanelForcastUpdateComponent', () => {
  let component: PanelForcastUpdateComponent;
  let fixture: ComponentFixture<PanelForcastUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelForcastUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelForcastUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
