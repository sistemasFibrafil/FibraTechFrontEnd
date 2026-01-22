import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigComponent } from './layout/config/config.component';
import { HeaderBreadcrumbComponent } from './layout/header-breadcrumb/header-breadcrumb.component';
import { MenuComponent } from './layout/menu/menu.component';
import { LayoutComponent } from './layout/layout.component';
import { MenuitemComponent } from './layout/menu/menuitem/menuitem.component';
import { DialogModule } from 'primeng/dialog';
// PrimeNG
import { ProgressBarModule } from 'primeng/progressbar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SidebarModule } from 'primeng/sidebar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';

import localePy from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { LoginModule } from './modulos/modulo-login/module-login.module';
import { HeaderInterceptorService } from './interceptor/header-interceptor.service';
import { DomSeguroImagenBase64Pipe } from './pipes/dom-seguro-imagen-base64.pipe';
import { SeguridadModule } from './modulos/modulo-seguridad/modulo-seguridad.module';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { ProfilesidebarComponent } from './layout/profilesidebar/profilesidebar.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

registerLocaleData(localePy, 'es');

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    HeaderBreadcrumbComponent,
    MenuComponent,
    LayoutComponent,
    MenuitemComponent,
    DomSeguroImagenBase64Pipe,
    TopbarComponent,
    SidebarComponent,
    ProfilesidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ProgressBarModule,
    InputSwitchModule,
    TabViewModule,
    LoginModule,
    SeguridadModule,
    DialogModule,
    NgxDocViewerModule,
    ToastModule,
    AutoCompleteModule,
    SidebarModule,
    RadioButtonModule,
    ButtonModule,
    BadgeModule,
    InputTextModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    })
  ],
  providers: [ DatePipe,
              { provide: LOCALE_ID, useValue: 'es' },
              {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptorService, multi: true}],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
