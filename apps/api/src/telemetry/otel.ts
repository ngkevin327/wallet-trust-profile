import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

let initialized = false;

export async function initApiTelemetry(): Promise<void> {
  if (initialized || process.env.OTEL_ENABLED !== "true") {
    return;
  }

  const sampleRate =
    process.env.NODE_ENV === "production"
      ? Number(process.env.OTEL_TRACE_SAMPLE_RATIO ?? 0.1)
      : 1;

  try {
    const { NodeSDK } = await import("@opentelemetry/sdk-node");
    const { getNodeAutoInstrumentations } = await import(
      "@opentelemetry/auto-instrumentations-node"
    );
    const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-http");

    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

    const exporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318/v1/traces",
    });

    const sdk = new NodeSDK({
      serviceName: process.env.OTEL_SERVICE_NAME ?? "onchain-reputation-api",
      traceExporter: exporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    await sdk.start();
    initialized = true;
    console.log(
      JSON.stringify({
        event: "otel_initialized",
        service: "api",
        sampleRate,
        endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      }),
    );
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "otel_init_failed",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}
