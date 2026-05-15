import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingComponent } from './booking/booking.component';
import { ContactsComponent } from './contacts/contacts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GraphicReportComponent } from './graphic-report/graphic-report.component';
import { PassengersComponent } from './passengers/passengers.component';
import { ReportComponent } from './report/report.component';
import { ReportExcelComponent } from './report-excel/report-excel.component';
import { ReportPDFComponent } from './report-pdf/report-pdf.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GraphicConstructorComponent } from './graphic-constructor/graphic-constructor.component';
import { PassengerComponent } from './passengers/passenger.component';
import { RegisterComponent } from './passengers/register.component';
import { TestComponent } from './test/test.component';
import { SharedModule } from '../shared/shared.module';
import { SuccessBookingComponent } from './success-booking/success-booking.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FusionChartsModule } from 'angular-fusioncharts';
import { NgProgressbar } from 'ngx-progressbar';
import { OrderService } from '../services/order.service';
import { LoginService } from '../services/login.service';
import { ContactService } from '../services/contact.service';
import { FindService } from '../services/find.service';
import { ArchivoService } from '../services/archivo.service';
import { GenericService } from '../shared/services/generic.service';
import { NgDropFilesDirective } from './directives/ng-drop-files.directive';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from '../material/material.module';
import { CoreModule } from '../core/core.module';
import {NgDropDocumentossDirective} from './directives/ng-drop-documentos.directive';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        RouterModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        FusionChartsModule,
        MaterialModule,
        NgProgressbar,
    ],
    declarations: [
        BookingComponent,
        ContactsComponent,
        DashboardComponent,
        GraphicConstructorComponent,
        GraphicReportComponent,
        HomeComponent,
        LoginComponent,
        PassengerComponent,
        PassengersComponent,
        RegisterComponent,
        ReportComponent,
        ReportExcelComponent,
        ReportPDFComponent,
        TestComponent,
        UserProfileComponent,
        SuccessBookingComponent,
        NgDropFilesDirective,
      NgDropDocumentossDirective,
    ],
    exports: [
        BookingComponent,
        ContactsComponent,
        DashboardComponent,
        GraphicConstructorComponent,
        GraphicReportComponent,
        HomeComponent,
        PassengerComponent,
        PassengersComponent,
        RegisterComponent,
        ReportComponent,
        ReportExcelComponent,
        ReportPDFComponent,
        TestComponent,
        UserProfileComponent,
        SuccessBookingComponent,
        NgDropFilesDirective,
        NgDropDocumentossDirective,
    ],
    providers: [
        OrderService,
        LoginService,
        ContactService,
        FindService,
        ArchivoService,
        GenericService
    ],
})
export class PagesModule { }
