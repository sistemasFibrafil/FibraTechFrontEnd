import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelInformeStatusAutorizacionOptionsComponent } from './panel-informe-status-autorizacion-options.component';

describe('PanelInformeStatusAutorizacionOptionsComponent', () => {
  let component: PanelInformeStatusAutorizacionOptionsComponent;
  let fixture: ComponentFixture<PanelInformeStatusAutorizacionOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelInformeStatusAutorizacionOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelInformeStatusAutorizacionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should options', () => {
    expect(component).toBeTruthy();
  });
});
