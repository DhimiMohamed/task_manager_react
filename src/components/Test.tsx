// Test.tsx
import { useState, useEffect } from 'react';
import { TasksApi } from "../api/apis/tasks-api";
import customAxios from "../lib/customAxios";

const tasksApi = new TasksApi(undefined, undefined, customAxios);

export default function Test() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await tasksApi.tasksList();
      setTasks(response.data);
    };
    fetchTasks();
  }, []);

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description || 'No description'}</p>
            <p>Status: {task.completed ? '✅ Done' : '❌ Pending'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}