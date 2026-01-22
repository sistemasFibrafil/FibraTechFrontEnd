import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelForcastImportComponent } from './panel-forcast-import.component';

describe('PanelForcastImportComponent', () => {
  let component: PanelForcastImportComponent;
  let fixture: ComponentFixture<PanelForcastImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelForcastImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelForcastImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
