import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlusCircle, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Column, Id, Task } from "../type"
import { TaskCard } from './TaskCard'

interface Props {
  column: Column
  deleteColumn: (id: Id)=> void
  updateColumn: (id: Id, title: string) => void

  createTask: (columnId: Id) => void
  deleteTask: (id: Id) => void
  updateTask: (id: Id, content: string) => void
  tasks: Task[]
}
export function ColumnContainer({
  column, 
  deleteColumn, 
  updateColumn, 
  createTask, 
  tasks, 
  deleteTask,
  updateTask
}: Props) {
  const [editMode, setEditMode] = useState(false)
  const tasksIds = useMemo(() =>{
    return tasks.map((task) => task.id)
  },[tasks])

  const {
        setNodeRef, 
        attributes, 
        listeners, 
        transform, 
        transition,
        isDragging
      } 
        = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    },
    disabled: editMode
  })
  
  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if(isDragging){
    return <div ref={setNodeRef} style={style} className='flex flex-col bg-col w-[350px] h-[500px] max-h-[500px] rounded-md opacity-60 border-2 border-rose-500'></div>
  }

  return (
    <div 
    key={column.id}
    style={style}
    ref={setNodeRef}
    className='flex flex-col bg-col w-[350px] h-[500px] max-h-[500px] rounded-md'
    >
      <div 
      {...attributes}
      {...listeners}
      onClick={()=> {
        setEditMode(true)
      }}
      className='flex items-center justify-between bg-main text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-col border-4'
      >
        <div className='flex gap-2 items-center'>
          <div className='flex justify-center items-center bg-col px-2 py-1 text-sm rounded-full'>0</div>
          {!editMode && column.title}
          {editMode && 
          <input 
          className='bg-black focus:border-rose-500 border rounded outline-none px-2'
          defaultValue={column.title}
          onChange={e => updateColumn(column.id, e.target.value)} 
          autoFocus onBlur={()=> { setEditMode(false)}} 
          onKeyDown={e => { if(e.key !== 'Enter') { return }  setEditMode(false)}}
          />
          }
        </div>
      <button onClick={() =>{deleteColumn(column.id)}} className='group hover:bg-col rounded px-1 py-2'> <Trash2 className='h-6 w-6 stroke-gray-500 group-hover:stroke-white'/> </button>
      </div>
      <div 
      className='flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto'
      >
        <SortableContext items={tasksIds}>
        {tasks.map(task => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask}/>
            
            ))}
        </SortableContext>
      </div>
      <button 
      className='flex gap-2 items-center border-col border-2 rounded-md p-4 border-x-col hover:bg-main hover:text-rose-500 active:bg-back'
      onClick={() => {createTask(column.id)}}
      >
        <PlusCircle className='h-4 w-4'/>
        Adicionar Tarefa
      </button>
    </div>
  )
}