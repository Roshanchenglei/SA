import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Type } from './type';

describe('Type', () => {
  let component: Type;
  let fixture: ComponentFixture<Type>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Type]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Type);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
