import { useEffect, useState } from "react";
import { getTasks } from "../services/api";
import Charts from "../components/Charts";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getTasks();
      setTasks(res.data);
    };
    fetch();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎬 Campaign Overview</h1>
      <Charts tasks={tasks} />
    </div>
  );
}