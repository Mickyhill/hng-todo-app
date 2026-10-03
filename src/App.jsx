import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ListTodo,
  Moon,
  Pencil,
  Plus,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import "./App.css";

const STORAGE_KEY = "mickyhill-todos-v1";
const THEME_KEY = "mickyhill-theme";
const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDue(dueDate) {
  if (dueDate === todayKey()) return "Today";
  const [y, m, d] = dueDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [theme, setTheme] = useState(loadTheme);
  const titleRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // storage blocked: list still works for this session
    }
  }, [todos]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  const activeCount = total - doneCount;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const today = todayKey();

  const visible = useMemo(() => {
    const filtered = todos.filter((t) =>
      filter === "active" ? !t.done : filter === "completed" ? t.done : true
    );
    return [...filtered].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
  }, [todos, filter]);

  function addTodo(e) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    setTodos((prev) => [
      {
        id: makeId(),
        title: clean,
        done: false,
        priority,
        dueDate: dueDate || null,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setTitle("");
    setDueDate("");
    setPriority("medium");
    titleRef.current?.focus();
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditText(todo.title);
  }

  function saveEdit() {
    const clean = editText.trim();
    if (editingId && clean) {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, title: clean } : t))
      );
    }
    setEditingId(null);
    setEditText("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  function onEditKey(e) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  const emptyMessage =
    total === 0
      ? { title: "Your list is empty", body: "Add your first task above to get started." }
      : filter === "active"
      ? { title: "All caught up", body: "Every task is done. Nice work." }
      : filter === "completed"
      ? { title: "Nothing completed yet", body: "Tick a task when you finish it." }
      : { title: "No tasks", body: "Add a task above." };

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const tabs = [
    { key: "all", label: "All", count: total },
    { key: "active", label: "Active", count: activeCount },
    { key: "completed", label: "Completed", count: doneCount },
  ];

  return (
    <div className="page">
      <main className="sheet">
        <header className="header">
          <div>
            <p className="date">{dateLabel}</p>
            <h1 className="title">My Todo List</h1>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <section className="progress-block" aria-label="Progress">
          <div className="progress-text">
            <span className="progress-count">
              {doneCount}
              <span className="progress-total"> / {total}</span>
            </span>
            <span className="progress-label">
              {total === 0 ? "No tasks yet" : `${percent}% complete`}
            </span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </section>

        <form className="composer" onSubmit={addTodo}>
          <input
            ref={titleRef}
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            aria-label="Task title"
            maxLength={140}
          />
          <div className="composer-row">
            <select
              className="field select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="Priority"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input
              type="date"
              className="field date-field"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Due date"
            />
            <button type="submit" className="btn-primary" disabled={!title.trim()}>
              <Plus size={16} />
              Add task
            </button>
          </div>
        </form>

        <div className="tabs" role="tablist" aria-label="Filter tasks">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              className={`tab ${filter === tab.key ? "tab-active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label} · {tab.count}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="empty">
            <ListTodo size={32} className="empty-icon" />
            <p className="empty-title">{emptyMessage.title}</p>
            <p className="empty-body">{emptyMessage.body}</p>
          </div>
        ) : (
          <ul className="list">
            {visible.map((todo) => {
              const overdue = !todo.done && todo.dueDate && todo.dueDate < today;
              const isEditing = editingId === todo.id;
              return (
                <li key={todo.id} className={`item ${todo.done ? "item-done" : ""}`}>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                    aria-label={`Mark "${todo.title}" as ${todo.done ? "not done" : "done"}`}
                  />

                  <div className="item-body">
                    {isEditing ? (
                      <input
                        autoFocus
                        className="field"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={onEditKey}
                        onBlur={saveEdit}
                        aria-label="Edit task title"
                        maxLength={140}
                      />
                    ) : (
                      <span className="item-title" onDoubleClick={() => startEdit(todo)}>
                        {todo.title}
                      </span>
                    )}
                    <div className="meta">
                      <span className={`priority priority-${todo.priority}`}>
                        <span className="dot" />
                        {PRIORITY_LABEL[todo.priority]}
                      </span>
                      {todo.dueDate && (
                        <span className={`due ${overdue ? "overdue" : ""}`}>
                          <CalendarDays size={13} />
                          {overdue
                            ? `Overdue · ${formatDue(todo.dueDate)}`
                            : formatDue(todo.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="icon-btn"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={saveEdit}
                          aria-label="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={cancelEdit}
                          aria-label="Cancel edit"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => startEdit(todo)}
                          aria-label={`Edit "${todo.title}"`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          onClick={() => deleteTodo(todo.id)}
                          aria-label={`Delete "${todo.title}"`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <footer className="footer">
          <span>
            {activeCount} {activeCount === 1 ? "task" : "tasks"} left
          </span>
          <button
            type="button"
            className="btn-ghost"
            onClick={clearCompleted}
            disabled={doneCount === 0}
          >
            Clear completed
          </button>
        </footer>
      </main>

      <p className="credit">
        Built by Michael Ndianaobong Churchill · HNG Internship 15
      </p>
    </div>
  );
}