import { RouterModule, Routes} from '@angular/router';
import { NopagefoundComponent} from './shared/nopagefound/nopagefound.component';
import { BookingComponent} from './pages/booking/booking.component';
import { SuccessBookingComponent} from './pages/success-booking/success-booking.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { EditBookingComponent} from './pages/booking/edit-booking.component';
import { Error401Component} from './shared/error401/error401.component';
import { ReportComponent } from './pages/report/report.component';
import { ReportPDFComponent} from './pages/report-pdf/report-pdf.component';
import { ReportExcelComponent} from './pages/report-excel/report-excel.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { UserProfileComponent } from 'src/app/pages/user-profile/user-profile.component';
import { HomeComponent } from './pages/home/home.component';
import { GraphicReportComponent } from './pages/graphic-report/graphic-report.component';
import { LoginComponent } from './pages/login/login.component';

import {SidenavComponent} from './sidenav/sidenav.component';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { TestComponent} from './pages/test/test.component';
import { PassengersComponent} from './pages/passengers/passengers.component';
import { PassengerComponent} from './pages/passengers/passenger.component';
import {DocumentsComponent} from './pages/documents/documents.component';


const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'reports', component: GraphicReportComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'login', component: LoginComponent },


  { path: 'error401', component: Error401Component },
  { path: 'edit/:idorder', component: EditBookingComponent },
  { path: 'document/:idorder', component: DocumentsComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'register', component: BookingComponent },
  { path: 'register/:id', component: BookingComponent },
  { path: 'report/pdf/:order', component: ReportPDFComponent },
  { path: 'report/xls/:order', component: ReportExcelComponent },
  { path: 'report/:mail/:finicio/:ffin/:tm', component: ReportComponent },
  { path: 'success-booking', component: SuccessBookingComponent },

  { path: '**', component: NopagefoundComponent },



  // { path: 'dashboard2', component: SidenavComponent },
  // { path: 'passengers', component: PassengersComponent },
  // { path: 'passengers/:id', component: PassengersComponent },
  // { path: 'passenger/:id', component: PassengerComponent },
  // { path: 'test', component: TestComponent },
];
// export const APP_ROUTES = RouterModule.forRoot( appRoutes, { useHash: false } );

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false }
    )
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {

}

