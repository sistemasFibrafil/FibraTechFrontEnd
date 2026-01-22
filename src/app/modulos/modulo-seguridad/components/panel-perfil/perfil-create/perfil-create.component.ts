import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { PerfilModel } from '../../../models/pefil.model';
import { PerfilService } from '../../../services/perfil.service';

@Component({
  selector: 'app-seg-perfil-create',
  templateUrl: './perfil-create.component.html',
  styleUrls: ['./perfil-create.component.css']
})
export class PerfilCreateComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Perfil';

  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  maestroForm: FormGroup;

  modelo: PerfilModel = new PerfilModel();

  listItemPermiso: SelectItem[];

  subscription: Subscription;

  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private readonly swaCustomService: SwaCustomService) {}

  ngOnInit() {
    this.onBuildForm();
  }

  onBuildForm() {
    this.maestroForm = this.fb.group(
      {
        'descripcion' : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100), Validators.minLength(3)]))
      }
    );
  }

  onClickSave() {
    this.modelo.descripcionPerfil = this.maestroForm.controls['descripcion'].value;
    this.subscription = new Subscription();
    this.subscription = this.perfilService.setCreate(this.modelo)
    .subscribe(() =>  {
      this.swaCustomService.swaMsgExito(null);
      this.back(); },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    });
  }

  back() {
    this.router.navigate(['/main/modulo-seg/panel-perfil']);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
