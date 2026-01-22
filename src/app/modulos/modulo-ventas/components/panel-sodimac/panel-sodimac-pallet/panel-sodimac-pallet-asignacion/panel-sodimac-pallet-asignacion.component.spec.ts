import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSodimacPalletAsignacionComponent } from './panel-sodimac-pallet-asignacion.component';

describe('PanelSodimacPalletAsignacionComponent', () => {
  let component: PanelSodimacPalletAsignacionComponent;
  let fixture: ComponentFixture<PanelSodimacPalletAsignacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSodimacPalletAsignacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSodimacPalletAsignacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
