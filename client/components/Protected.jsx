import Login from './Login';
import { Navigate } from 'react-router-dom';

const Protected=({children})=>{
    const token=localStorage.getItem('token');
    return token?children: <Navigate to='/login' />

}
export default Protected