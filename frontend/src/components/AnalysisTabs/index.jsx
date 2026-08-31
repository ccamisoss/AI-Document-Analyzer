import { useRef, useMemo } from "react";
import { sortAnalysesOldestFirst } from "../../utils";
import styles from "./index.module.css";

import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

export default function AnalysisTabs({
  analyses,
  selectedAnalysisId,
  onSelect,
}) {
  const scrollRef = useRef(null);

  const sortedAnalyses = useMemo(
    () => sortAnalysesOldestFirst(analyses),
    [analyses, sortAnalysesOldestFirst],
  );

  const scrollTabs = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 140, behavior: "smooth" });
  };

  return (
    <div className={styles.analysisTabsBar}>
      <button
        type="button"
        className={styles.analysisTabsArrow}
        onClick={() => scrollTabs(-1)}
        disabled={
          selectedAnalysisId === sortedAnalyses[0].id ||
          sortedAnalyses.length === 1
        }
        aria-label="Scroll tabs left"
      >
        <ChevronLeftOutlinedIcon fontSize="small" />
      </button>
      <div className={styles.analysisTabsScroll} ref={scrollRef}>
        {sortedAnalyses.map((analysis, idx) => {
          const isActive = selectedAnalysisId === analysis.id;
          const label = `Analysis ${analysis.id}`;

          return (
            <button
              key={analysis.id}
              type="button"
              className={
                isActive ? styles.analysisTabActive : styles.analysisTab
              }
              onClick={() => onSelect(analysis.id)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.analysisTabsArrow}
        onClick={() => scrollTabs(1)}
        disabled={
          selectedAnalysisId === sortedAnalyses[sortedAnalyses.length - 1].id ||
          sortedAnalyses.length === 1
        }
        aria-label="Scroll tabs right"
      >
        <ChevronRightOutlinedIcon fontSize="small" />
      </button>
    </div>
  );
}
