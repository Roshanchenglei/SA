import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinuumWindow } from './continuum-window';

describe('ContinuumWindow', () => {
  let component: ContinuumWindow;
  let fixture: ComponentFixture<ContinuumWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContinuumWindow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContinuumWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
