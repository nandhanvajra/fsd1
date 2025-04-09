
import {useState,useEffect} from 'react'

import { useNavigate } from 'react-router-dom'

const Login=()=>{
    const navigate=useNavigate()
    
    const [form,setForm]=useState({email:'',password:''})
    const [token,setToken]=useState(null)
    const changeForm=((e)=>{
        setForm({...form,[e.target.name]:e.target.value})
    })

    const sendReq=(e)=>{
        e.preventDefault()
        fetch('http://localhost:3000/login',{
            method:'POST',
            body:JSON.stringify({
                email:form.email,
                password:form.password
            }),
            headers:{
                'Content-Type':'application/json'
            }

            
        }).then((res)=>{
            if(res.status!==201){
                console.log('bad request')
                navigate('/login')
            }
            return res.json()
        }).then((res)=>{
            setToken(res.token)
            console.log(res.message)
            console.log(res.user)
            localStorage.setItem('token',res.token)
            navigate('/')
        })
        .catch(err=>console.log(err))
    }

    return(
        <form onSubmit={sendReq}>
            <label htmlFor="email">email:</label>
            <input type="email" 
            placeholder="email"
            name='email'
            value={form.email}
            onChange={changeForm}
            />
            

            <label htmlFor="password">password:</label>
                <input type="password" 
                    name='password'
                    placeholder="password"
                    value={form.password}
                    onChange={changeForm}
                
                
                />
            
        
            <button type='submit'>submit</button>
        
        </form>
    )

}

export default Login