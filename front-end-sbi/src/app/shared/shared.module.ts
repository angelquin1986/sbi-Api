import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { Error401Component } from './error401/error401.component';
import { FooterContactosPublicosComponent } from './footer/footer-contactos-publicos.component';
import { FooterDashboardComponent } from './footer/footer-dashboard.component';
import { FooterLoginComponent } from './footer/footer-login.component';
import { FooterRegisterEditComponent } from './footer/footer-register-edit.component';
import { HeaderContactosPublicoComponent } from './header/header-contactos-publico.component';
import { HeaderDashboardComponent } from './header/header-dashboard.component';
import { HeaderLoginComponent } from './header/header-login.component';
import { HeaderRegisterEditComponent } from './header/header-register-edit.component';
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { RouterModule } from '@angular/router';

// import { BookingComponent } from './booking/booking.component';
// import { ContactsComponent } from './contacts/contacts.component';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { GraphicReportComponent } from './graphic-report/graphic-report.component';
// import { PassengersComponent } from './passengers/passengers.component';
// import { ReportComponent } from './report/report.component';
// import { ReportExcelComponent } from './report-excel/report-excel.component';
// import { ReportPDFComponent } from './report-pdf/report-pdf.component';
// import { UserProfileComponent } from './user-profile/user-profile.component';
// import { HomeComponent } from './home/home.component';
// import { GraphicConstructorComponent } from './graphic-constructor/graphic-constructor.component';
// import { PassengerComponent } from './passengers/passenger.component';
// import { RegisterComponent } from './passengers/register.component';
// import { TestComponent } from './test/test.component';
// import { SuccessBookingComponent } from './success-booking.component';
@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        RouterModule,
    ],
    declarations: [
        Error401Component,
        FooterContactosPublicosComponent,
        FooterDashboardComponent,
        FooterLoginComponent,
        FooterRegisterEditComponent,
        HeaderContactosPublicoComponent,
        HeaderDashboardComponent,
        HeaderLoginComponent,
        HeaderRegisterEditComponent,
        NopagefoundComponent,
    ],
    exports: [
        Error401Component,
        FooterContactosPublicosComponent,
        FooterDashboardComponent,
        FooterLoginComponent,
        FooterRegisterEditComponent,
        HeaderContactosPublicoComponent,
        HeaderDashboardComponent,
        HeaderLoginComponent,
        HeaderRegisterEditComponent,
        NopagefoundComponent,
    ],
})
export class SharedModule { }
