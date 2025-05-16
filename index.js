require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


const app = express();
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Method override for PUT and DELETE
app.use(methodOverride('_method'));

// MongoDB URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todoDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose model
const todoSchema = new mongoose.Schema({
  task: String,
  priority: String
});
const Todo = mongoose.model('Todo', todoSchema);

// Routes
app.get('/', async (req, res) => {
  try {
    const filter = req.query.priority;
    const todos = filter ? await Todo.find({ priority: filter }) : await Todo.find();
    res.render('list', { todos, filter });
  } catch (error) {
    res.status(500).send('Error fetching todos');
  }
});

app.post('/add', async (req, res) => {
  try {
    const { task, priority } = req.body;
    if (task.trim() !== '') {
      await Todo.create({ task, priority });
    }
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error adding todo');
  }
});

app.put('/edit/:id', async (req, res) => {
  try {
    const { updatedTask, updatedPriority } = req.body;
    await Todo.findByIdAndUpdate(req.params.id, {
      task: updatedTask,
      priority: updatedPriority
    });
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error updating todo');
  }
});

app.delete('/delete/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error deleting todo');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
