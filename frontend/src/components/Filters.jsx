export default function Filters({ setFilter }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={() => setFilter("all")}>All</button>
      <button onClick={() => setFilter("pending")}>Pending</button>
      <button onClick={() => setFilter("in progress")}>In Progress</button>
      <button onClick={() => setFilter("completed")}>Completed</button>
    </div>
  );
}