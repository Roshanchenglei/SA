import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Liners } from './liners';

describe('Liners', () => {
  let component: Liners;
  let fixture: ComponentFixture<Liners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Liners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Liners);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
