import React, { useEffect, useState } from 'react'
import { Check , Pencil , Trash,Save} from 'lucide-react';
import { ENDPOINTS, instance } from './api';
import { toast } from 'react-toastify';

const Task = () => {
    const [tasks,setTasks]=useState([])
    const [editable,setEditable]=useState(null)
    const [inputTask,setInputTask]=useState("")

    const editTask=(e,id)=>{
        setTasks(items => items.map(item=>item.id === id ? {...item,title:e.target.value}: item))
    }
    const saveTask=async(id)=>{
        const task=tasks.filter(task=>task.id==id)[0]
        console.log(task)
        await instance.put(ENDPOINTS.UPDATE_TASK(id),task)
        .then(res=>{
            toast.success("Task updated successfully")
            getAllTasks()
            setEditable(null)
        })
        .catch(err=>console.log(err))
        
    }
    const completeTask=async(id)=>{
        const task=tasks.filter(task=>task.id==id)[0]
        task.completed = !task.completed
        await instance.put(ENDPOINTS.UPDATE_TASK(id),task)
        .then(res=>{
            toast.success("Task updated successfully")
            getAllTasks()
        })
        .catch(err=>console.log(err))
    }

    const addTask=async()=>{
        await instance.post(ENDPOINTS.CREATE_TASK(),{title:inputTask,completed:false})
                        .then(res=>{
                            toast.success("Task created successfully")
                            getAllTasks()
                            setInputTask("")
                        })
                        .catch(err=>console.log(err))
    }

    const getAllTasks=async()=>{
        await instance.get(ENDPOINTS.GET_TASK())
        .then(res=>setTasks(res.data))
        .catch(error=>console.log(error))
    }

    const deleteTask=async(id)=>{
        await instance.delete(ENDPOINTS.DELETE_TASK(id))
        .then(res=>{
            toast.success("Task deleted successfully")
            getAllTasks()
        }).catch(err=>console.log(err))
    }

    useEffect(()=>{
        getAllTasks()
    },[])

  return (
    <>
        <div className='container'>
            <div className='input-box'>
                <input type="text" value={inputTask} onChange={(e)=>setInputTask(e.target.value)}></input>
                <span className='add' onClick={addTask}>Add</span>
            </div>
            <div className='task-container'>
                {
                    tasks.map((item,index)=>{
                        return (
                            <div key={item.id} className='task-items' style={{backgroundColor: item.completed ? "#98FF98" : "white"}}>
                                <div className='task-title'>
                                    <div className=''>
                                        <label className='title'>Title : </label>
                                        <input type="text" 
                                        value={item.title}
                                        disabled={editable !== item.id}
                                         onChange={(e)=>editTask(e,item.id)}></input>
                                    </div>
                                    <Check size={20} onClick={()=>completeTask(item.id)}/>
                                </div>
                                <div className='icon-group'>
                                        {(editable !== item.id) ? <Pencil size={20} onClick={()=>setEditable(item.id)}/>
                                         : <Save size={20} onClick={()=>saveTask(item.id)}/>}
                                        <Trash size={20} onClick={()=>deleteTask(item.id)}/>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    </>
  )
}

export default Task