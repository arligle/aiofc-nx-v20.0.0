// import { bootstrapFastifyApp } from "@aiokit/bootstrap";
// import { bootstrapBaseApp } from "@aiokit/bootstrap";
import { bootstrapBaseWebApp } from "@aiokit/bootstrap";
import { AppModule } from "./app.module";

import { initializeTransactionalContext } from 'typeorm-transactional';
initializeTransactionalContext();
bootstrapBaseWebApp(AppModule);

// bootstrapBaseApp(AppModule);
// bootstrapFastifyApp(AppModule);
