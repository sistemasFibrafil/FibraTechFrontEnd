import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSodimacDetalladoPalletViewComponent } from './panel-sodimac-detallado-pallet-view.component';

describe('PanelSodimacDetalladoPalletViewComponent', () => {
  let component: PanelSodimacDetalladoPalletViewComponent;
  let fixture: ComponentFixture<PanelSodimacDetalladoPalletViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSodimacDetalladoPalletViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSodimacDetalladoPalletViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
