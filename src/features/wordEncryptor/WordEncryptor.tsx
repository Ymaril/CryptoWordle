import { useEffect, useState } from "react";
import styles from "./WordEncryptor.module.css";
import { heavyHash$ } from "@/shared/utils";
import { Word } from "@/entities/word";

export default function WordEncryptor() {
  const [word, setWord] = useState<Word | null>(null);
  const [inputText, setInputText] = useState("");
  const [progress, setProgress] = useState(0);
  const [letterProgresses, setLetterProgresses] = useState<number[]>([]);
  const [encoded, setEncoded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [iterations, setIterations] = useState(5000);

  const handleEncrypt = () => {
    const clean = inputText.toUpperCase().replace(/[^A-Z]/g, "");
    if (!clean) return;
    const newWord = new Word(clean);
    setWord(newWord);
    setProgress(0);
    setLetterProgresses(Array(clean.length).fill(0));
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

      <div className={styles.inputRow}>
        <input
          type="text"
          placeholder="Enter any word"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className={styles.textInput}
        />
        <button onClick={handleEncrypt} className={styles.encryptButton}>
          Encrypt
        </button>
      </div>
    </div>
  );
}
