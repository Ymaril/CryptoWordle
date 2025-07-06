import { useEffect, useState } from "react";
import styles from "./WordEncryptor.module.css";
import { heavyHash$ } from "@/shared/utils";
import { Word } from "@/entities/word";
import EncryptedWord, {
  WordEncryptionProgress,
} from "@/entities/encryptedWord";

export default function WordEncryptor() {
  const [word, setWord] = useState<Word | null>(null);
  const [inputText, setInputText] = useState("");
  const [progress, setProgress] = useState<WordEncryptionProgress | null>(null);
  const [encoded, setEncoded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [iterations, setIterations] = useState(5000);
  const [hashLength, setHashLength] = useState(8);

  const handleEncrypt = () => {
    const clean = inputText.toUpperCase().replace(/[^A-Z]/g, "");
    if (!clean) return;
    const newWord = new Word(clean);
    setWord(newWord);
    setProgress(null);
    setEncoded(null);
    setCopied(false);
  };

  useEffect(() => {
    if (!word) return;

    const plainText = word.letters.map((l) => l.char).join("");

    const saltSub = heavyHash$(plainText, 1).subscribe(({ result: salt }) => {
      if (!salt) return;

      const shortSalt = salt.substring(0, 8);

      const sub = EncryptedWord.fromWord$(
        word,
        shortSalt,
        iterations,
      ).subscribe((progress) => {
        setProgress(progress);

        if (progress.result) {
          const hash = progress.result.toBase64Url(hashLength);
          setEncoded(hash);
          window.location.hash = hash;
        }
      });

      return () => sub.unsubscribe();
    });

    return () => saltSub.unsubscribe();
  }, [word, iterations, hashLength]);

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const link = encoded ? `${baseUrl}#${encoded}` : "";

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      {word && (
        <div className={styles.progressRow}>
          {encoded && (
            <div className={styles.linkWrapper}>
              <label htmlFor="link" className={styles.linkLabel}>
                The url:
              </label>
              <div className={styles.linkRow}>
                <input
                  id="link"
                  type="text"
                  readOnly
                  value={link}
                  className={styles.linkInput}
                  onFocus={(e) => e.target.select()}
                />
                <button onClick={handleCopy} className={styles.copyButton}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {(progress?.letterProgresses || []).length > 0 && (
            <div className={styles.letterProgress}>
              <div>Progress per letter:</div>
              <div className={styles.letterList}>
                {progress?.letterProgresses.map(
                  (p: { green: number; yellow: number }, i: number) => (
                    <div key={i} className={styles.letterBox}>
                      {Math.round(((p.green + p.yellow) / 2) * 100)}%
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          <div>
            Encrypting progress:{" "}
            <span className={styles.progressValue}>
              {Math.round((progress?.progress || 0) * 100)}%
            </span>
          </div>
        </div>
      )}

      <div className={styles.sliderWrapper}>
        <label htmlFor="iterations">Iterations: {iterations}</label>
        <input
          type="range"
          id="iterations"
          min={500}
          max={20000}
          step={5000}
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.sliderWrapper}>
        <label htmlFor="hashLength">
          Hash Length: {hashLength === 64 ? "Full" : hashLength}
        </label>
        <input
          type="range"
          id="hashLength"
          min={8}
          max={64}
          step={8}
          value={hashLength}
          onChange={(e) => setHashLength(Number(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.inputRow}>
        <input
          type="text"
          placeholder="Enter any word"
          value={inputText}
          onChange={(e) => {
            const cleaned = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
            setInputText(cleaned);
          }}
          className={styles.textInput}
        />
        <button onClick={handleEncrypt} className={styles.encryptButton}>
          Encrypt
        </button>
      </div>
    </div>
  );
}
