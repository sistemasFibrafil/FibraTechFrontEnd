import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenFabricacionGeneralByFechaSedeComponent } from './panel-of-general-by-fecha-sede.component';

describe('PanelOrdenFabricacionGeneralByFechaSedeComponent', () => {
  let component: PanelOrdenFabricacionGeneralByFechaSedeComponent;
  let fixture: ComponentFixture<PanelOrdenFabricacionGeneralByFechaSedeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenFabricacionGeneralByFechaSedeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenFabricacionGeneralByFechaSedeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
