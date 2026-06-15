import { deleteTask } from "../services/api";

export default function TaskCard({ task, refresh, onEdit }) {

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(task._id);
      refresh();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{task.title}</h3>
      <p>{task.description}</p>

      <span style={styles.status}>
        {task.status}
      </span>

      <div style={styles.actions}>
        <button style={styles.edit} onClick={() => onEdit(task)}>
          Edit
        </button>

        <button style={styles.delete} onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
    background: "#fff",
    border: "1px solid #ddd",
  },
  title: {
    margin: "0 0 5px 0",
  },
  status: {
    display: "inline-block",
    marginTop: "8px",
    padding: "3px 8px",
    background: "#eee",
    borderRadius: "5px",
    fontSize: "12px",
  },
  actions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  edit: {
    background: "blue",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
  },
  delete: {
    background: "red",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
  },
};