import { Component } from '@angular/core';
import { NavigationEnd, Router, ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

interface Breadcrumb {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-header-breadcrumb',
  templateUrl: './header-breadcrumb.component.html',
  styleUrls: ['./header-breadcrumb.component.css']
})
export class HeaderBreadcrumbComponent{

  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router) {
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(event => {
          const root = this.router.routerState.snapshot.root;
          const breadcrumbs: Breadcrumb[] = [];
          this.addBreadcrumb(root, [], breadcrumbs);

          this._breadcrumbs$.next(breadcrumbs);
      });
  }

  private addBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: Breadcrumb[]) {
      const routeUrl = parentUrl.concat(route.url.map(url => url.path));
      const breadcrumb = route.data['breadcrumb'];
      const parentBreadcrumb = route.parent && route.parent.data ? route.parent.data['breadcrumb'] : null;

      if (breadcrumb && breadcrumb !== parentBreadcrumb) {
          breadcrumbs.push({
              label: route.data['breadcrumb'],
              url: '/' + routeUrl.join('/')
          });
      }

      if (route.firstChild) {
          this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
      }
  }
}
