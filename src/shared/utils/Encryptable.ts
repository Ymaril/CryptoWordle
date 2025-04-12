import { BehaviorSubject, Observable } from "rxjs";
import { heavyHash$ } from "@/shared/utils";

export type Encrypted = string;

export interface EncryptProgress {
  progress: number;
  result?: Encrypted;
}

export default abstract class Encryptable {
  protected progress$ = new BehaviorSubject<EncryptProgress>({ progress: 0 });
  private started = false;

  getEncrypted$(): Observable<EncryptProgress> {
    return this.progress$.asObservable();
  }

  encrypt(): void {
    if (this.started || this.progress$.getValue().progress === 1) return;
    this.started = true;

    heavyHash$(this.getHashInput(), Math.random() * 10000).subscribe(data => {
      this.progress$.next(data);
    });
  }

  protected abstract getHashInput(): string;
}