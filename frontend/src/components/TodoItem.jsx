import { useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDone = todo.status === 'done';

  async function handleToggleStatus() {
    setSaving(true);
    setError('');
    try {
      await onUpdate(todo.id, { status: isDone ? 'ongoing' : 'done' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setError('Task title cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onUpdate(todo.id, {
        title: trimmedTitle,
        description: editDescription.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setError('');
    setIsEditing(false);
  }

  async function handleDelete() {
    setSaving(true);
    setError('');
    try {
      await onDelete(todo.id);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <article className={`todo-card ${isDone ? 'todo-done' : ''}`}>
      {isEditing ? (
        <form className="todo-edit-form" onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label htmlFor={`edit-title-${todo.id}`}>Title</label>
            <input
              id={`edit-title-${todo.id}`}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor={`edit-desc-${todo.id}`}>Description</label>
            <textarea
              id={`edit-desc-${todo.id}`}
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="todo-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="todo-main">
            <div className="todo-header-row">
              <h3 className="todo-title">{todo.title}</h3>
              <span className={`status-badge ${isDone ? 'badge-done' : 'badge-ongoing'}`}>
                {isDone ? 'Done' : 'Ongoing'}
              </span>
            </div>
            {todo.description && <p className="todo-description">{todo.description}</p>}
            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="todo-actions">
            <button
              type="button"
              className={`btn btn-sm ${isDone ? 'btn-outline' : 'btn-success'}`}
              onClick={handleToggleStatus}
              disabled={saving}
            >
              {isDone ? 'Mark Ongoing' : 'Mark Done'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setEditTitle(todo.title);
                setEditDescription(todo.description || '');
                setIsEditing(true);
              }}
              disabled={saving}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}
