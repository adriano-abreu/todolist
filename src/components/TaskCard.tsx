import { useSortable } from "@dnd-kit/sortable"
import { CSS } from '@dnd-kit/utilities'
import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { Id, Task } from "../type"


interface Props {
  task: Task
  deleteTask: (id: Id) => void
  updateTask: (id: Id, content: string) => void
}
export function TaskCard({task, deleteTask, updateTask}: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const {
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition,
    isDragging
  } 
    = useSortable({
id: task.id,
data: {
  type: 'Task',
  task
},
disabled: editMode
})

const style = {
  transition,
  transform: CSS.Transform.toString(transform)
}

  const toggleEditMode = () =>{
    setEditMode((prev) => !prev)
    setMouseIsOver(false)
  }

  if(isDragging) {
    return (
    <div 
    ref={setNodeRef}
    style={style}
    className="opacity-30 bg-main p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-rose-500 border-2 cursor-grab relative"
    />
    )
  }

  if(editMode){
    return (
      <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-main p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
      >
       
        <textarea 
        className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none" 
        defaultValue={task.content} 
        autoFocus 
        placeholder="Conteúdo da tarefa aqui"
        onBlur={toggleEditMode}
        onKeyDown={e => {
          if( e.key === 'Enter' && e.shiftKey) {toggleEditMode()}
        }}
        onChange={(e) => updateTask(task.id, e.target.value)}
        >
        </textarea>
      </div>
    )
  }

  return (
    <div 
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    className="bg-main p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
    onMouseEnter={() => {setMouseIsOver(true)}}
    onMouseLeave={() => {setMouseIsOver(false)}}
    onClick={toggleEditMode}
    >
      <p className="my-auto h-[90%] w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap">{task.content}</p>
      {
        mouseIsOver && (
        <button 
        className="absolute stroke-white right-4 top-1/2 -translate-y-1/2 bg-col p-2 rounded opacity-60 hover:opacity-100"
        onClick={() => {deleteTask(task.id)}}
        >
          <Trash2Icon className="h-4 w-4"/>
        </button>
        )
      }
    </div>
  )
}