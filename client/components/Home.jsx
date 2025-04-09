

import { useEffect,useState } from "react"
import {useNavigate} from 'react-router-dom'


const Home=()=>{


    const [tasks,setTasks]=useState([])
    const [user,setUser]=useState({})
    const navigate=useNavigate()

    const token=localStorage.getItem('token')
    useEffect(()=>{
        fetch('http://localhost:3000/',{
            method:'GET',
            headers:{
                authorization:`Bearer ${token}`

            }
        }).then((res)=>{
            if (res.status==='401'){
                navigate('/login')
            }
            return res.json()
        })
        .then(res=>{
            if(res){
                setTasks(res.tasks || [])
                setUser(res.user || {})
            }
        })
        .catch((err)=>{
            console.log(err)
            navigate('/login')
        })




    },[])

    return(
        <div>
           {tasks.map((task,index)=>(
            <div key={index}>{task}</div>
           ))}
        </div>
    )
}
export default Home