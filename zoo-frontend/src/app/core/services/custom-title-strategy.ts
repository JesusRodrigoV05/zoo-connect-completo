import { inject, Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";
import { environment } from "@env";

@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  envTitle = environment.marca;
  updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot) || this.title.getTitle();
    if (pageTitle) {
      this.title.setTitle(`${pageTitle} - ${this.envTitle}`);
    } else {
      this.title.setTitle(`${this.envTitle}`);
    }
  }
}
