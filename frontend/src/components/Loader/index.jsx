import styles from "./index.module.css";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className={styles.container}>
      <div className={styles.loader} />
      <span className={styles.text}>{text}</span>
    </div>
  );
}
