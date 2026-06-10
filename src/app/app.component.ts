import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { AppVersionService } from './services/app-version.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'GF-FrontEnd';

  private versionInterval: any;

  constructor(
    private primengConfig: PrimeNGConfig,
    private translateService: TranslateService,
    private appVersionService: AppVersionService
  ) {}

  ngOnInit(): void {
    this.primengConfig.setTranslation({
      firstDayOfWeek  : 1,
      dayNames        : ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
      dayNamesShort   : ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
      dayNamesMin     : ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
      monthNames      : ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
      monthNamesShort : ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      today           : 'Hoy',
      clear           : 'Limpiar',
      weekHeader      : 'Sm',
      dateFormat      : 'dd/mm/yy'
    });

    this.appVersionService.checkVersion();

    this.versionInterval = setInterval(() => {
      this.appVersionService.checkVersion();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.versionInterval) {
      clearInterval(this.versionInterval);
    }
  }
}
