import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalsConstantsForm } from '../../../../constants/globals-constants-form';

@Component({
  selector: 'app-btn-salir',
  templateUrl: './btn-salir.component.html',
  styleUrls: ['./btn-salir.component.css']
})
export class BtnSalirComponent implements OnInit {
  @Input() isMargenTop: boolean;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm;

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
  }

  goSalir() {
    this.router.navigate(['/main/bienvenido/bienvenido']);
  }

}
