import { Observable } from "rxjs";

export interface HeavyHashProgress {
  progress: number;
  iteration: number;
  result: string;
}

export default function heavyHash$(
  data: string,
  iterations: number,
): Observable<HeavyHashProgress> {
  return new Observable<HeavyHashProgress>((subscriber) => {
    const encoder = new TextEncoder();
    let inputBuffer = encoder.encode(data);
    let resultBuffer = inputBuffer;
    const chunkSize = 1000;
    let currentIteration = 0;
    let cancelled = false;

    function bufferToHex(buffer: Uint8Array): string {
      return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    function processChunk(): void {
      if (cancelled) {
        subscriber.complete();
        return;
      }
      if (currentIteration >= iterations) {
        const finalHash = bufferToHex(resultBuffer);
        subscriber.next({
          progress: 1,
          iteration: currentIteration,
          result: finalHash,
        });
        subscriber.complete();
        return;
      }
      const chunkIterations = Math.min(
        chunkSize,
        iterations - currentIteration,
      );

      (async () => {
        for (let i = 0; i < chunkIterations; i++) {
          if (cancelled) return;
          const digest = await crypto.subtle.digest("SHA-256", resultBuffer);
          resultBuffer = new Uint8Array(digest);
          currentIteration++;
          subscriber.next({
            progress: currentIteration / iterations,
            iteration: currentIteration,
            result: bufferToHex(resultBuffer),
          });
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
        processChunk();
      })().catch((err) => subscriber.error(err));
    }

    processChunk();

    return () => {
      cancelled = true;
    };
  });
}
