import { useEffect, useState } from "react";
import { getTasks } from "../services/api";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Filters from "../components/Filters";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) => t.status === filter);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Management Dashboard</h1>

      <TaskForm refresh={fetchTasks} />
      <Filters setFilter={setFilter} />

      {filteredTasks.map((task) => (
        <TaskCard key={task._id} task={task} refresh={fetchTasks} />
      ))}
    </div>
  );
}