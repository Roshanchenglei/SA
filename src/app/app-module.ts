import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Home } from './home/home';
import { Header } from './home/header/header';
import { Body } from './home/body/body';
import { Footer } from './home/footer/footer';
import { Introduction } from './home/body/introduction/introduction';
import { Type } from './home/body/type/type';
import { Continuum } from './home/body/continuum/continuum';
import { Emission } from './home/body/emission/emission';
import { Calculation } from './home/body/calculation/calculation';
import { ContinuumWindow } from './home/body/calculation/continuum-window/continuum-window';
import { EmissionLine } from './home/body/calculation/emission-line/emission-line';
import { Seyfert } from './home/body/type/seyfert/seyfert';
import { Quasars } from './home/body/type/quasars/quasars';
import { Radio } from './home/body/type/radio/radio';
import { Blazars } from './home/body/type/blazars/blazars';
import { Liners } from './home/body/type/liners/liners';
import { About } from './home/about/about';
import { How } from './home/body/calculation/how/how';
import { Feedback } from './home/footer/feedback/feedback';
import { MultiEmission } from './home/body/calculation/multi-emission/multi-emission';
import { Teach } from './home/shared/teach/teach';



@NgModule({
  declarations: [
    App,
    Home,
    Header,
    Body,
    Footer,
    Introduction,
    Type,
    Continuum,
    Emission,
    Calculation,
    ContinuumWindow,
    EmissionLine,
    Seyfert,
    Quasars,
    Radio,
    Blazars,
    Liners,
    About,
    How,
    Feedback,
    MultiEmission,
    Teach,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
