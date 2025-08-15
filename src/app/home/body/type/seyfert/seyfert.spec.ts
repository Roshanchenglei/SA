import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Seyfert } from './seyfert';

describe('Seyfert', () => {
  let component: Seyfert;
  let fixture: ComponentFixture<Seyfert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Seyfert]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Seyfert);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
