import { useState, useEffect } from "react";
import pb from "../../lib/pocketbase";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  const TaskItem = React.memo(({ task, onDelete }) => (
    <li className="p-2 border-b flex justify-between">
      <span>{task.title} - {task.status}</span>
      <button onClick={() => onDelete(task.id)} className="p-1 bg-red-500 text-white rounded">
        Delete
      </button>
    </li>
  ));

  useEffect(() => {
    const fetchTasks = async () => {
      const result = await pb.collection('tasks').getFullList({
        filter: `user_id = "${pb.authStore.model.id}"`,
      });
      setTasks(result);
    };
    fetchTasks();

    pb.collection('tasks').subscribe('*', (e) => {
      fetchTasks();
    });

    return () => pb.collection('tasks').unsubscribe('*');
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('tasks').create({
        title,
        user_id: pb.authStore.model.id,
        status: 'to-do',
        priority: 'low',
        category: 'Work',
      });
      setTitle('');
    } catch (error) {
      alert('Error creating task: ' + error.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await pb.collection('tasks').delete(id);
    } catch (error) {
      alert('Error deleting task: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Tasks</h2>
      <form onSubmit={handleCreateTask} className="mb-4">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <button type="submit" className="p-2 bg-green-500 text-white rounded">
          Add Task
        </button>
      </form>
      <ul>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onDelete={handleDeleteTask} />
        ))}
      </ul>
    </div>
  );
}

export default Tasks;