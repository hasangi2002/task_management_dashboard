import { useEffect, useState } from "react";
import { getTasks } from "../services/api";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎬 Film Campaign Task Dashboard</h1>

      <TaskForm
        refresh={fetchTasks}
        editTask={editTask}
        setEditTask={setEditTask}
      />

      <div>
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            refresh={fetchTasks}
            onEdit={setEditTask}
          />
        ))}
      </div>
    </div>
  );
}