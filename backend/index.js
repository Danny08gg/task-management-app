const express = require('express');
const PocketBase = require('pocketbase/cjs');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:5175' })); // Match frontend port
app.use(express.json());

const pb = new PocketBase('http://127.0.0.1:8090');

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/task-stats', async (req, res) => {
  try {
    const tasks = await pb.collection('tasks').getFullList();
    const stats = {
      todo: tasks.filter(t => t.status === 'to-do').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));