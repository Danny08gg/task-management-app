import { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import pb from '../../lib/pocketbase';

function Dashboard() {
  const [stats, setStats] = useState({ todo: 0, inProgress: 0, done: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!pb.authStore.isValid) {
          console.log('User not authenticated');
          return;
        }
        console.log('Attempting to fetch stats from PocketBase...');
        const tasks = await pb.collection('task').getFullList({
          filter: `user_id = "${pb.authStore.model.id}"`,
        });
        console.log('Fetched tasks:', tasks);
        const newStats = {
          todo: tasks.filter(t => t.status === 'to-do').length,
          inProgress: tasks.filter(t => t.status === 'in-progress').length,
          done: tasks.filter(t => t.status === 'done').length,
        };
        setStats(newStats);
        console.log('Updated stats:', newStats);
      } catch (error) {
        console.error('Full error:', error);
        setStats({ todo: 0, inProgress: 0, done: 0 });
      }
    };
    fetchStats();

    pb.collection('task').subscribe('*', () => {
      fetchStats();
    });

    return () => pb.collection('task').unsubscribe('*');
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStats((prevStats) => ({
      ...prevStats,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pb.authStore.isValid) {
      alert('Please log in to update tasks');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8090/api/health');
      if (!response.ok) throw new Error('PocketBase server not reachable');

      const collections = await pb.collection('task').getFullList({ limit: 1 });
      if (!collections) {
        throw new Error('Collection task not found');
      }

      for (let i = 0; i < stats.todo; i++) {
        await pb.collection('task').create({
          name: `Task ${i + 1} (To-Do)`, // Ganti title dengan name
          user_id: pb.authStore.model.id,
          status: 'to-do',
          priority: 'low',
          category: 'Work',
          description: 'Task description',
          due_date: new Date().toISOString().split('T')[0],
        });
      }
      for (let i = 0; i < stats.inProgress; i++) {
        await pb.collection('task').create({
          name: `Task ${i + 1} (In-Progress)`, // Ganti title dengan name
          user_id: pb.authStore.model.id,
          status: 'in-progress',
          priority: 'low',
          category: 'Work',
          description: 'Task description',
          due_date: new Date().toISOString().split('T')[0],
        });
      }
      for (let i = 0; i < stats.done; i++) {
        await pb.collection('task').create({
          name: `Task ${i + 1} (Done)`, // Ganti title dengan name
          user_id: pb.authStore.model.id,
          status: 'done',
          priority: 'low',
          category: 'Work',
          description: 'Task description',
          due_date: new Date().toISOString().split('T')[0],
        });
      }
      alert('Tasks updated successfully!');
      const updatedTasks = await pb.collection('task').getFullList({
        filter: `user_id = "${pb.authStore.model.id}"`,
      });
      const newStats = {
        todo: updatedTasks.filter(t => t.status === 'to-do').length,
        inProgress: updatedTasks.filter(t => t.status === 'in-progress').length,
        done: updatedTasks.filter(t => t.status === 'done').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error updating tasks:', error);
      alert('Error updating tasks: ' + error.message);
    }
  };

  const chartData = {
    labels: ['To-Do', 'In-Progress', 'Done'],
    datasets: [
      {
        label: 'Task Status',
        data: [stats.todo, stats.inProgress, stats.done],
        backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Dashboard</h2>
      <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded mb-4">
        Logout
      </button>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">To-Do</label>
            <input
              type="number"
              name="todo"
              value={stats.todo}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              min="0"
            />
          </div>
          <div>
            <label className="block mb-1">In-Progress</label>
            <input
              type="number"
              name="inProgress"
              value={stats.inProgress}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              min="0"
            />
          </div>
          <div>
            <label className="block mb-1">Done</label>
            <input
              type="number"
              name="done"
              value={stats.done}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              min="0"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 p-2 bg-green-500 text-white rounded"
        >
          Update Tasks and Graph
        </button>
      </form>

      <div className="w-64">
        <Chart type="pie" data={chartData} />
      </div>
    </div>
  );
}

export default Dashboard;