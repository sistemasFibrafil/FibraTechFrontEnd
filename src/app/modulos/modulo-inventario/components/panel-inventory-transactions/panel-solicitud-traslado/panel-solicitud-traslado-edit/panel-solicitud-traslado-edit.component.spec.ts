import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSolicitudTrasladoEditComponent } from './panel-solicitud-traslado-edit.component';

describe('PanelSolicitudTrasladoEditComponent', () => {
  let component: PanelSolicitudTrasladoEditComponent;
  let fixture: ComponentFixture<PanelSolicitudTrasladoEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSolicitudTrasladoEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSolicitudTrasladoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should edit', () => {
    expect(component).toBeTruthy();
  });
});
