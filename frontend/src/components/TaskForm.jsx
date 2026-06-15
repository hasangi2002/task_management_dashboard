import { useEffect, useState } from "react";
import { createTask, updateTask } from "../services/api";

export default function TaskForm({ refresh, editTask, setEditTask }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
  });

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || "",
        description: editTask.description || "",
        status: editTask.status || "pending",
      });
    }
  }, [editTask]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editTask) {
        await updateTask(editTask._id, form);
        setEditTask(null);
      } else {
        await createTask(form);
      }

      setForm({ title: "", description: "", status: "pending" });
      refresh();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        name="title"
        placeholder="Task Title"
        value={form.title}
        onChange={handleChange}
      />

      <input
        name="description"
        placeholder="Task Description"
        value={form.description}
        onChange={handleChange}
      />

      <select name="status" value={form.status} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="in progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <button type="submit" style={styles.button}>
        {editTask ? "Update Task" : "Add Task"}
      </button>

      {editTask && (
        <button
          type="button"
          style={styles.cancel}
          onClick={() => setEditTask(null)}
        >
          Cancel
        </button>
      )}
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  button: {
    background: "green",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },
  cancel: {
    background: "gray",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },
};