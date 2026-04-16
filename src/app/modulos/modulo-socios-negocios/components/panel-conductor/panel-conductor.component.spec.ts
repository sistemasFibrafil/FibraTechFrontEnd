import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelVehiculoComponent } from './panel-conductor.component';

describe('PanelVehiculoComponent', () => {
  let component: PanelVehiculoComponent;
  let fixture: ComponentFixture<PanelVehiculoComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelVehiculoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelVehiculoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
