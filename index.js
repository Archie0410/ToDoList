const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/todoDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Mongoose model
const todoSchema = new mongoose.Schema({
  task: String,
  priority: String
});
const Todo = mongoose.model('Todo', todoSchema);

// Routes
app.get('/', async (req, res) => {
  const filter = req.query.priority;
  const todos = filter ? await Todo.find({ priority: filter }) : await Todo.find();
  res.render('list', { todos, filter });
});

app.post('/add', async (req, res) => {
  const { task, priority } = req.body;
  if (task.trim() !== '') {
    await Todo.create({ task, priority });
  }
  res.redirect('/');
});

app.post('/edit/:id', async (req, res) => {
  const { updatedTask, updatedPriority } = req.body;
  await Todo.findByIdAndUpdate(req.params.id, {
    task: updatedTask,
    priority: updatedPriority
  });
  res.redirect('/');
});

app.post('/delete/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Start server
app.listen(3000, () => console.log('Server started on http://localhost:3000'));
