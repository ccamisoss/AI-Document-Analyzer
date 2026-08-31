import styles from "./index.module.css";

export default function ViewportNotice() {
  return (
    <div className={styles.overlay} role="alert">
      <div className={styles.card}>
        <h1 className={styles.title}>This app is for tablets or computers only</h1>
        <p className={styles.message}>
          Please switch to a larger screen to continue.
        </p>
      </div>
    </div>
  );
}
