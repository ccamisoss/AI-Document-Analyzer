import { Outlet, Link } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import styles from "./index.module.css";

import LogoutIcon from "@mui/icons-material/Logout";

function DashboardLayout() {
  const { user, logout } = useSession();

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarFirstContainer}>
          <Link to={"/"} className={styles.button}>
            Dashboard
          </Link>
          <Link to={"/analyze"} className={styles.button}>
            Analyze
          </Link>
        </div>

        <div className={styles.sidebarSecondContainer}>
          <span className={styles.email}>{user?.email}</span>

          <button
            onClick={logout}
            className={styles.button}
            style={{ borderTop: "1px solid black", borderRadius: 0 }}
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
