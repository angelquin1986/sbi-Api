import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  window.console.log = () => {};
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error('Bootstrap error:', err);
    document.body.innerHTML = `<pre style="color:red;padding:20px;font-size:14px">
BOOTSTRAP ERROR:\n${err?.message || JSON.stringify(err, null, 2)}\n\nStack:\n${err?.stack || ''}
    </pre>`;
  });
