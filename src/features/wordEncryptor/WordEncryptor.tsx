import { useEffect, useState } from "react";
import { WordInput, Word } from "@/entities/word";
import { EncryptedWord } from "@/entities/word";
import styles from "./WordEncryptor.module.css";

export default function WordEncryptor() {
  const [word, setWord] = useState<Word | null>(null);
  const [progress, setProgress] = useState(0);
  const [letterProgresses, setLetterProgresses] = useState<number[]>([]);
  const [encoded, setEncoded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

    const progressSub = word.encrypt$().subscribe(({ progress, letters }) => {
      setProgress(progress);
      setLetterProgresses(letters.map((l) => l.progress));
    });

    const resultSub = word
      .toEncryptedWord$()
      .subscribe((encrypted: EncryptedWord) => {
        const hash = encrypted.toBase64Url();
        setEncoded(hash);
        window.location.hash = hash;
      });

    return () => {
      progressSub.unsubscribe();
      resultSub.unsubscribe();
    };
  }, [word]);

  const link = encoded ? `${window.location.origin}/#${encoded}` : "";

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
                Ссылка:
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
                  {copied ? "Скопировано!" : "Копировать"}
                </button>
              </div>
            </div>
          )}

          {letterProgresses.length > 0 && (
            <div className={styles.letterProgress}>
              <div>Прогресс по буквам:</div>
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
            Прогресс шифрования:{" "}
            <span className={styles.progressValue}>
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      )}
      <WordInput onSubmit={handleSubmit} clearOnSubmit={false} />
    </div>
  );
}
