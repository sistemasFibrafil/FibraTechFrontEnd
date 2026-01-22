import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelForcastCreateComponent } from './panel-forcast-create.component';

describe('PanelForcastCreateComponent', () => {
  let component: PanelForcastCreateComponent;
  let fixture: ComponentFixture<PanelForcastCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelForcastCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelForcastCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
