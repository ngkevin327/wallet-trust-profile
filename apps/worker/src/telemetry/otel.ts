import { context, SpanStatusCode, trace, type Span } from "@opentelemetry/api";

let initialized = false;

export async function initWorkerTelemetry(): Promise<void> {
  if (initialized || process.env.OTEL_ENABLED !== "true") {
    return;
  }

  try {
    const { NodeSDK } = await import("@opentelemetry/sdk-node");
    const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-http");

    const sdk = new NodeSDK({
      serviceName: process.env.OTEL_SERVICE_NAME ?? "onchain-reputation-worker",
      traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318/v1/traces",
      }),
    });

    await sdk.start();
    initialized = true;
    console.log(JSON.stringify({ event: "otel_initialized", service: "worker" }));
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "otel_init_failed",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

export function getWorkerTracer() {
  return trace.getTracer("onchain-reputation-worker");
}

export async function withSpan<T>(
  name: string,
  attributes: Record<string, string | number>,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  const tracer = getWorkerTracer();
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    const start = Date.now();
    try {
      const result = await fn(span);
      span.setAttribute("duration_ms", Date.now() - start);
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

export { context, trace };
