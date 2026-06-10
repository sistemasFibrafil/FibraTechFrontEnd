import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwaCustomService } from './swa-custom.service';

interface AppVersion {
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppVersionService {
  private currentVersion: string | null = null;
  private alreadyNotified = false;

  constructor(
    private http: HttpClient,
    private swaCustomService: SwaCustomService
  ) {}

  checkVersion(): void {
    const url = `assets/version.json?t=${new Date().getTime()}`;

    this.http.get<AppVersion>(url).subscribe({
      next: (data) => {

        if (!data?.version) {
          return;
        }

        if (!this.currentVersion) {
          this.currentVersion = data.version;
          return;
        }

        if (this.currentVersion !== data.version && !this.alreadyNotified) {
          this.alreadyNotified = true;
          this.currentVersion = data.version;

          this.swaCustomService.swaMsgInfo(
            'Existe una nueva versión de FibraTech. Por favor actualice la página.'
          );
        }
      },
      error: () => {
        // No bloquear la aplicación si falla version.json
      }
    });
  }
}
