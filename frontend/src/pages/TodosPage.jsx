import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import TodoItem from '../components/TodoItem';

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadTodos() {
    setError('');
    try {
      const data = await apiRequest('/todos');
      setTodos(data.todos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function handleAddTodo(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a task title.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const data = await apiRequest('/todos', {
        method: 'POST',
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim(),
        }),
      });
      setTodos((prev) => [data.todo, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateTodo(id, patch) {
    const data = await apiRequest(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
  }

  async function handleDeleteTodo(id) {
    await apiRequest(`/todos/${id}`, { method: 'DELETE' });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const ongoingCount = todos.filter((t) => t.status === 'ongoing').length;
  const doneCount = todos.filter((t) => t.status === 'done').length;

  const visibleTodos =
    filter === 'all' ? todos : todos.filter((t) => t.status === filter);

  return (
    <section className="todos-page">
      <div className="page-header">
        <div>
          <h1>My To-Do List</h1>
          <p className="subtitle">Add, update, track, and complete your daily tasks.</p>
        </div>
        <div className="stats-bar" aria-label="Task summary">
          <div className="stat-pill">
            <span className="stat-value">{todos.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-pill stat-ongoing">
            <span className="stat-value">{ongoingCount}</span>
            <span className="stat-label">Ongoing</span>
          </div>
          <div className="stat-pill stat-done">
            <span className="stat-value">{doneCount}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>
      </div>

      <div className="card add-todo-card">
        <h2>Add a New Task</h2>
        <form onSubmit={handleAddTodo} className="stack-form">
          <div className="form-group">
            <label htmlFor="todo-title">Task Title</label>
            <input
              id="todo-title"
              type="text"
              placeholder="e.g., Containerize Express backend"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="todo-description">Description (optional)</label>
            <textarea
              id="todo-description"
              rows={2}
              placeholder="Add any helpful notes or steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="error-banner" role="alert">{error}</p>}

          <div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>

      <div className="filter-row" role="tablist" aria-label="Filter tasks by status">
        <button
          type="button"
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({todos.length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'ongoing' ? 'active' : ''}`}
          onClick={() => setFilter('ongoing')}
        >
          Ongoing ({ongoingCount})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'done' ? 'active' : ''}`}
          onClick={() => setFilter('done')}
        >
          Done ({doneCount})
        </button>
      </div>

      {loading ? (
        <div className="card empty-state">Loading your tasks...</div>
      ) : visibleTodos.length === 0 ? (
        <div className="card empty-state">
          {todos.length === 0
            ? 'No tasks yet. Add your first task above!'
            : `No ${filter} tasks right now.`}
        </div>
      ) : (
        <div className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
            />
          ))}
        </div>
      )}
    </section>
  );
}
