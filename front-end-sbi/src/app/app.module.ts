import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FusionChartsModule} from 'angular-fusioncharts';
FusionChartsModule.fcRoot(FusionCharts, Column3d, Pie3d, FusionTheme);
import { MaterialModule } from './material/material.module';
import { NgProgressbar } from 'ngx-progressbar';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { PagesModule } from './pages/pages.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { BookingComponent, RemoveFilesDialogComponent, RemoveFileDialogComponent, DialogInsuranceInfoComponent, DialogPassportInfoComponent, DialogSegurityInfoComponent } from './pages/booking/booking.component';
import { EditBookingComponent, DialogRemoveFilesComponent, DialogRemoveFileComponent, DialogInsuranceInfoEditComponent, DialogPassportInfoEditComponent } from './pages/booking/edit-booking.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { OrderService } from './services/order.service';
import { LoginService } from './services/login.service';
import { ContactService } from './services/contact.service';
import { FindService } from './services/find.service';
import { ArchivoService } from './services/archivo.service';
import { GenericService } from './shared/services/generic.service';
import FusionCharts from 'fusioncharts/core';
import Column3d from 'fusioncharts/viz/column3d';
import Pie3d from 'fusioncharts/viz/pie3d';
import FusionTheme from 'fusioncharts/themes/es/fusioncharts.theme.fusion';
import { ImagenPipe } from './pipes/imagen.pipe';
import {DocumentsComponent} from './pages/documents/documents.component';
import {DocumentoService} from './services/documento.service';


@NgModule({
  declarations: [
    AppComponent,
    RemoveFilesDialogComponent,
    RemoveFileDialogComponent,
    DialogInsuranceInfoComponent,
    DialogPassportInfoComponent,
    DialogSegurityInfoComponent,
    EditBookingComponent,
    DialogRemoveFilesComponent,
    DialogRemoveFileComponent,
    DialogInsuranceInfoEditComponent,
    DialogPassportInfoEditComponent,
    ImagenPipe,
    SidenavComponent,
    DocumentsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FusionChartsModule,
    MaterialModule,
    NgProgressbar,
    AppRoutingModule,
    CoreModule,
    PagesModule,
    SharedModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    OrderService,
    LoginService,
    ContactService,
    FindService,
    ArchivoService,
    GenericService,
    DocumentoService
  ],
  bootstrap: [
    AppComponent,
  ],
})

export class AppModule {}

