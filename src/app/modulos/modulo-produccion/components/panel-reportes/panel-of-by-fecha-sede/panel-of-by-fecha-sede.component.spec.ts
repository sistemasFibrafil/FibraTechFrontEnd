import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOrdenFabricacionByFechaSedeComponent } from './panel-of-by-fecha-sede.component';

describe('PanelOrdenFabricacionByFechaSedeComponent', () => {
  let component: PanelOrdenFabricacionByFechaSedeComponent;
  let fixture: ComponentFixture<PanelOrdenFabricacionByFechaSedeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOrdenFabricacionByFechaSedeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOrdenFabricacionByFechaSedeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
