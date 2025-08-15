import { Component, NgModule,} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Header } from './home/header/header';
import { Footer } from './home/footer/footer';
import { Body } from './home/body/body';
import { Introduction } from './home/body/introduction/introduction';
import { Type } from './home/body/type/type';
import { Continuum } from './home/body/continuum/continuum';
import { Emission } from './home/body/emission/emission';
import { Calculation } from './home/body/calculation/calculation';
import { ContinuumWindow } from './home/body/calculation/continuum-window/continuum-window';
import { EmissionLine } from './home/body/calculation/emission-line/emission-line';
import { Radio } from './home/body/type/radio/radio';
import { Seyfert } from './home/body/type/seyfert/seyfert';
import { Blazars } from './home/body/type/blazars/blazars';
import { Quasars } from './home/body/type/quasars/quasars';
import { Liners } from './home/body/type/liners/liners';
import { About } from './home/about/about';
import { How } from './home/body/calculation/how/how';
import { Feedback } from './home/footer/feedback/feedback';
import { MultiEmission } from './home/body/calculation/multi-emission/multi-emission';


const routes: Routes = [
  {path:'',pathMatch:'full',redirectTo:'home'},
  {path:"home",component:Home,
    children:[
      {path:"header",component:Header},
      {path:"footer",component:Footer},
      {path:"feedback",component:Feedback},
      {path:"body",component:Body},
      {path:"introduction",component:Introduction},
      {path:"type",component:Type,
        children:[
          {path:"radio",component:Radio},
          {path:"seyfert",component:Seyfert},
          {path:"blazars",component:Blazars},
          {path:"quasars",component:Quasars},
          {path:"liners",component:Liners}
        ]
      },
      {path:"continuum",component:Continuum},
      {path:"emission",component:Emission},
      {path:"calculation",component:Calculation,
        children:[
          {path:"continuum-window",component:ContinuumWindow},
          {path:"emission-line",component:EmissionLine},
          {path:"how",component:How},
          {path:"multi-emission",component:MultiEmission}
        ]
      },
      {path:'',component:About}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
