import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2>🎬 Film Campaign</h2>

      <nav>
        <ul style={styles.ul}>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/tasks">Tasks</Link></li>
        </ul>
      </nav>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "200px",
    height: "100vh",
    background: "#111",
    color: "white",
    padding: "20px",
    position: "fixed",
  },
  ul: {
    listStyle: "none",
    padding: 0,
    lineHeight: "2rem",
  },
};