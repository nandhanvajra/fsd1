
import {useState,useEffect} from 'react'


const [form,setForm]=useState({username:'',password:''})

const changeForm=(()=>{
    
})

const Login=()=>{

    return(
        <form >
            <input type="text" 
            placeholder="username"
            value={form.username}
            onChange={changeForm}
            />


        </form>
    )

}

export default Login