export default function TodoCard({
  todo,
  onDelete,
  onUpdate,
  onComplete,
}: {
  todo: any;
  onDelete: (id: string) => void;
  onUpdate: (todo: any) => void;
  onComplete: (id: string) => void;
}) {
  return (
    <div className={`bg-white shadow rounded-xl p-4 flex justify-between items-center border ${todo.is_done ? "border-emerald-200" : "border-transparent"}`}>
      <div>
        <h3 className={`font-semibold ${todo.is_done ? "text-emerald-700 line-through" : "text-slate-900"}`}>
          {todo.title}
        </h3>
        <p className="text-sm text-gray-500">{todo.description}</p>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded mr-2">
          {todo.frequency}
        </span>
        {todo.is_done && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
            Done for this period
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="px-3 py-1 bg-emerald-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onComplete(todo.id)}
          disabled={todo.is_done}
        >
          {todo.is_done ? "Done" : "Mark Done"}
        </button>

        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => onUpdate(todo)}
        >
          Edit
        </button>

        <button
          className="px-3 py-1 bg-red-500 text-white rounded"
          onClick={() => onDelete(todo.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}