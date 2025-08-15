import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiEmission } from './multi-emission';

describe('MultiEmission', () => {
  let component: MultiEmission;
  let fixture: ComponentFixture<MultiEmission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiEmission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiEmission);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
