import { initWorkerTelemetry } from "./telemetry/otel";
import { WorkerModule } from "./worker.module";

async function bootstrap() {
  await initWorkerTelemetry();
  const worker = new WorkerModule();
  await worker.start();
}

bootstrap().catch((err) => {
  console.error("Worker failed to start", err);
  process.exit(1);
});
