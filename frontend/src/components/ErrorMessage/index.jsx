import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import styles from "./index.module.css";

export default function ErrorMessage({ message, isFullHeight = false }) {
  return (
    <div
      className={styles.container}
      style={{ height: isFullHeight ? "100%" : "auto" }}
    >
      <SentimentVeryDissatisfiedIcon className={styles.icon} />
      <span className={styles.message}>{message}</span>
    </div>
  );
}
