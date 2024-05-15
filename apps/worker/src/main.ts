import { WorkerModule } from "./worker.module";

async function bootstrap() {
  const worker = new WorkerModule();
  await worker.start();
}

bootstrap().catch((err) => {
  console.error("Worker failed to start", err);
  process.exit(1);
});
