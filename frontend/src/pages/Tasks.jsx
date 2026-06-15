import { useEffect, useState } from "react";
import { getTasks } from "../services/api";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Management Dashboard</h1>

      <TaskForm refresh={fetchTasks} />

      <div>
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} refresh={fetchTasks} />
        ))}
      </div>
    </div>
  );
}