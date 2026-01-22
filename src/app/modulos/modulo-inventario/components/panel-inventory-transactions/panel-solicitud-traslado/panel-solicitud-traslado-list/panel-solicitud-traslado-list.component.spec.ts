import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSolicitudTrasladoListComponent } from './panel-solicitud-traslado-list.component';

describe('PanelSolicitudTrasladoListComponent', () => {
  let component: PanelSolicitudTrasladoListComponent;
  let fixture: ComponentFixture<PanelSolicitudTrasladoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSolicitudTrasladoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSolicitudTrasladoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should list', () => {
    expect(component).toBeTruthy();
  });
});
