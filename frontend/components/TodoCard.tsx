export default function TodoCard({
  todo,
  onDelete,
  onUpdate,
}: {
  todo: any;
  onDelete: (id: string) => void;
  onUpdate: (todo: any) => void;
}) {
  return (
    <div className="bg-white shadow rounded-xl p-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{todo.title}</h3>
        <p className="text-sm text-gray-500">{todo.description}</p>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
          {todo.frequency}
        </span>
      </div>

      <div className="flex gap-2">
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