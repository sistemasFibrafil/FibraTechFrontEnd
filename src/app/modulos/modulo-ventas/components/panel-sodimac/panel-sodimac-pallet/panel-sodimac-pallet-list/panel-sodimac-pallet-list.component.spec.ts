import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelSodimacPalletListComponent } from './panel-sodimac-pallet-list.component';

describe('PanelSodimacPalletListComponent', () => {
  let component: PanelSodimacPalletListComponent;
  let fixture: ComponentFixture<PanelSodimacPalletListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelSodimacPalletListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelSodimacPalletListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
