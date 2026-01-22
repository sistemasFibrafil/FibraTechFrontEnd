import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'GF-FrontEnd';

  constructor
  (
    private primengConfig: PrimeNGConfig,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
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
  }
}
