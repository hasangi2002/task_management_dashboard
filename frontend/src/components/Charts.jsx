import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Charts({ tasks }) {
  const statusCount = {
    pending: tasks.filter(t => t.status === "pending").length,
    "in progress": tasks.filter(t => t.status === "in progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  const data = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        data: [
          statusCount.pending,
          statusCount["in progress"],
          statusCount.completed,
        ],
        backgroundColor: ["orange", "blue", "green"],
      },
    ],
  };

  return <Pie data={data} />;
}