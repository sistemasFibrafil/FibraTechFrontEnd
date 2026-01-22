import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSolicitudTrasladoViewComponent } from './panel-solicitud-traslado-view.component';

describe('PanelSolicitudTrasladoViewComponent', () => {
  let component: PanelSolicitudTrasladoViewComponent;
  let fixture: ComponentFixture<PanelSolicitudTrasladoViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSolicitudTrasladoViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSolicitudTrasladoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should view', () => {
    expect(component).toBeTruthy();
  });
});
