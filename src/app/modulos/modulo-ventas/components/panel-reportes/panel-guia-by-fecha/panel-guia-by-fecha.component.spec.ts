import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelGuiaByFechaComponent } from './panel-guia-by-fecha.component';

describe('PanelGuiaByFechaComponent', () => {
  let component: PanelGuiaByFechaComponent;
  let fixture: ComponentFixture<PanelGuiaByFechaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelGuiaByFechaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelGuiaByFechaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
