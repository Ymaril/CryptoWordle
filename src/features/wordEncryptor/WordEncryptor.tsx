import { useEffect, useState } from "react";
import { WordInput, Word } from "@/entities/word";
import styles from "./WordEncryptor.module.css";
import { heavyHash$ } from "@/shared/utils";

export default function WordEncryptor() {
  const [word, setWord] = useState<Word | null>(null);
  const [progress, setProgress] = useState(0);
  const [letterProgresses, setLetterProgresses] = useState<number[]>([]);
  const [encoded, setEncoded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [iterations, setIterations] = useState(5000);

  const handleSubmit = (text: string) => {
    const newWord = new Word(text);
    setWord(newWord);
    setProgress(0);
    setLetterProgresses(Array(text.length).fill(0));
    setEncoded(null);
    setCopied(false);
  };

  useEffect(() => {
    if (!word) return;

    const plainText = word.letters.map((l) => l.char).join("");

    const saltSub = heavyHash$(plainText, 1).subscribe(({ result: salt }) => {
      if (!salt) return;

      const sub = word.toEncryptedWord$(salt, iterations).subscribe(
        ({ progress, letters, result }) => {
          setProgress(progress);
          setLetterProgresses(letters.map((l) => l.progress));

          if (result) {
            const hash = result.toBase64Url();
            setEncoded(hash);
            window.location.hash = hash;
          }
        }
      );

      return () => sub.unsubscribe();
    });

    return () => saltSub.unsubscribe();
  }, [word, iterations]);

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

          {letterProgresses.length > 0 && (
            <div className={styles.letterProgress}>
              <div>Progress per letter:</div>
              <div className={styles.letterList}>
                {letterProgresses.map((p, i) => (
                  <div key={i} className={styles.letterBox}>
                    {Math.round(p * 100)}%
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            Encrypting progress:{" "}
            <span className={styles.progressValue}>
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      )}

      <div className={styles.sliderWrapper}>
        <input
          type="range"
          id="iterations"
          min={500}
          max={20000}
          step={500}
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
          className={styles.slider}
        />
      </div>
      <WordInput onSubmit={handleSubmit} clearOnSubmit={false} />
    </div>
  );
}
