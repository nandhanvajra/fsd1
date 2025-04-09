import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {Routes,Route} from 'react-router-dom'
import Home from '../components/Home'
import Login from '../components/Login'
import Signin from '../components/Signin'
import Protected from '../components/Protected'

function App() {

  return(

  <Routes>


      <Route path='/' element={
        <Protected>
          <Home />
        </Protected>
        } />



      <Route path='/login' element={<Login />} />
      <Route path='/signin' element={<Signin />} />


  </Routes>
  )
  
}

export default App
