import { NgModule } from '@angular/core';

// Module PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { TreeModule } from 'primeng/tree';
import { PickListModule } from 'primeng/picklist';
import { FileUploadModule } from 'primeng/fileupload';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';

@NgModule({
    declarations: [],
    exports: [ InputTextModule,
            InputNumberModule,
            ButtonModule,
            ToastModule,
            TableModule,
            ConfirmDialogModule,
            PanelModule,
            InputTextareaModule,
            InputSwitchModule,
            CheckboxModule,
            FieldsetModule,
            PasswordModule,
            DropdownModule,
            TreeModule,
            PickListModule,
            FileUploadModule,
            ToggleButtonModule,
            MessageModule,
            RadioButtonModule,
            CalendarModule,
            ProgressBarModule,
            DialogModule],
    providers: [],
})
export class FacturacionElectronicaPrimeNgModule {}
