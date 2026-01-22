import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { OpcionModel } from '../../../models/opcion.model';
import { SeguridadService } from '../../../services/seguridad.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';
import { SwaCustomService } from '../../../../../services/swa-custom.service';

@Component({
  selector: 'app-seg-opcion-create',
  templateUrl: './opcion-create.component.html',
  styleUrls: ['./opcion-create.component.css']
})
export class OpcionCreateComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Opcion';

  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  maestroForm: FormGroup;

  modelo: OpcionModel = new OpcionModel();

  // Id del menu seleccionado
  idMenu: number;

  subscription: Subscription;

  constructor(private fb: FormBuilder,
              private seguridadService: SeguridadService,
              private readonly swaCustomService: SwaCustomService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {

    this.route.params.subscribe((params: Params) => {
      this.idMenu = params['id'];
    });

    this.maestroForm = this.fb.group(
      {
        'descripcion' : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(100), Validators.minLength(4)])),
        'keyOpcion' : new FormControl(''),
      }
    );
  }

  onClickSave() {
    this.modelo.idMenu = Number(this.idMenu);
    this.modelo.descripcionOpcion = this.maestroForm.controls['descripcion'].value;
    this.modelo.keyOpcion = this.maestroForm.controls['keyOpcion'].value;
    this.subscription = new Subscription();
    this.subscription = this.seguridadService.setInsertOpcion(this.modelo)
    .subscribe(() =>  {
      this.swaCustomService.swaMsgExito(null);
      this.back(); },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    });
  }

  back() {
    this.router.navigate(['/main/modulo-seg/panel-opcion']);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
