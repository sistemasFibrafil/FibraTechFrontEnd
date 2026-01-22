import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelForcastListComponent } from './panel-forcast-list.component';

describe('PanelForcastListComponent', () => {
  let component: PanelForcastListComponent;
  let fixture: ComponentFixture<PanelForcastListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelForcastListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelForcastListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
