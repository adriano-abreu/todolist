import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { PlusCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Column, Id, Task } from '../type'
import { ColumnContainer } from './ColumnContainer'
import { TaskCard } from './TaskCard'
 
export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([])
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  const columnsId = useMemo(() => columns.map((column) => column.id),[columns])
  
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3 // 3px
    }
  }))
  
  function createNewColumn(){
    const columnToAdd: Column = {
      id: crypto.randomUUID(),
      title: `Coluna ${columns.length + 1}`
    } 

    setColumns([...columns, columnToAdd])
  }

  function deleteColumn(id: Id){
    const filteredColumns = columns.filter(col => col.id !== id)
    setColumns(filteredColumns)

    const newTasks = tasks.filter(t => t.columnId !== id)
    setTasks(newTasks)
  }

  function onDragStart({active}: DragStartEvent){
    if(active.data.current?.type === 'Column'){
      setActiveColumn(active.data.current.column)
      return
    }

    if(active.data.current?.type === 'Task'){
      setActiveTask(active.data.current.task)
      return
    }
  }

  function onDragEnd({active, over}: DragEndEvent){
    setActiveColumn(null)
    setActiveTask(null)
    if(!over) return
    const activeId = active.id
    const overId = over.id

    if(activeId === overId) return
    
    setColumns(columns => {
      const activeColumnIndex = columns.findIndex((column) => column.id === activeId)

      const overColumnIndex = columns.findIndex((column) => column.id === overId)

      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  } 

  function onDragOver({active, over}: DragOverEvent){
    if(!over) return
    const activeId = active.id
    const overId = over.id

    if(activeId === overId) return

    const isActiveTask = active.data.current?.type === "Task"
    const isOverTask = over.data.current?.type === "Task"

    if(!isActiveTask) return

    if(isActiveTask && isOverTask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId)
        const overIndex = tasks.findIndex(t => t.id === overId)

        tasks[activeIndex].columnId = tasks[overIndex].columnId
      
        return arrayMove(tasks, activeIndex, overIndex)
      }) 
    }
    const isOverAColumn = over.data.current?.type === "Column"

    if(isActiveTask && isOverAColumn){
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId)

        tasks[activeIndex].columnId = overId
      
        return arrayMove(tasks, activeIndex, activeIndex)
      }) 
    }
  }

  function updateColumn(id: Id, title: string){
    const newColumns = columns.map((column) =>{
      if(column.id !== id) return column
      return {...column, title}
    })

    setColumns(newColumns)
  }

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      columnId,
      content: `Tarefa ${tasks.length + 1}`
    }

    setTasks([...tasks, newTask])
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter(task => task.id !== id)
    setTasks(newTasks)
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map(task => {
      if(task.id !== id) return task

      return {...task, content}
    })

    setTasks(newTasks)
  }

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-10">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="m-auto flex gap-4">
          <SortableContext items={columnsId}>
        {columns.map(column => 
          <ColumnContainer 
          key={column.id}  
          column={column} 
          deleteColumn={deleteColumn} 
          updateColumn={updateColumn} 
          createTask={createTask} 
          deleteTask={deleteTask}
          tasks={tasks.filter(task => task.columnId === column.id)}
          updateTask={updateTask}
          />
        )}
        </SortableContext>
        <button
        onClick={createNewColumn}
        className="flex gap-2 h-14 w-[350px] min-w[350px] cursor-pointer rounded-lg bg-main border-2 border-col p-4 ring-rose-500 hover:ring-2"
        >
          <PlusCircle className='h-6 w-6'/>
          Adicionar nova coluna
        </button>
        </div>
        {createPortal(
                <DragOverlay>
                  {activeColumn && (
                  <ColumnContainer 
                  key={activeColumn.id}
                  column={activeColumn} 
                  deleteColumn={deleteColumn} 
                  updateColumn={updateColumn} 
                  createTask={createTask} 
                  tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  />
                  )}
                  {
                    activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask}/>
                  }
                </DragOverlay>, document.body
        )}
      </DndContext>
    </div>
  )
}