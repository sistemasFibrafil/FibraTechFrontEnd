import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInformeStatusAutorizacionComponent } from './panel-informe-status-autorizacion.component';

describe('PanelInformeStatusAutorizacionComponent', () => {
  let component: PanelInformeStatusAutorizacionComponent;
  let fixture: ComponentFixture<PanelInformeStatusAutorizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInformeStatusAutorizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInformeStatusAutorizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should list', () => {
    expect(component).toBeTruthy();
  });
});
