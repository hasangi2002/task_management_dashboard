import { deleteTask } from "../services/api";

export default function TaskCard({ task, refresh }) {
  const handleDelete = async () => {
    try {
      await deleteTask(task._id);
      refresh(); // reload tasks after delete
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.card}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p><b>Status:</b> {task.status}</p>

      <button onClick={handleDelete} style={styles.btn}>
        Delete
      </button>
    </div>
  );
}

const styles = {
  card: {
    padding: "15px",
    margin: "10px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },
  btn: {
    background: "red",
    color: "white",
    padding: "5px 10px",
    border: "none",
    cursor: "pointer",
  },
};