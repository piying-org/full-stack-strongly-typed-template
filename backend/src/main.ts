import { createRootInjector } from 'static-injector';
import { AppService } from './app.service';
process.env.TZ = 'utc';
const injector = createRootInjector({
  providers: [AppService],
});
const instance = injector.get(AppService);
instance.bootstrap().catch((rej) => {
  console.error(rej);
});
