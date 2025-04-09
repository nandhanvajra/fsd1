import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [user, setUser] = useState({});
    const [currtask, setCurrtask] = useState({ title: '', description: '', status: '' });
    const [editTask, setEditTask] = useState(false);
    const [Index, setIndex] = useState(-1);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:3000/', {
            method: 'GET',
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            if (res.status === 401) {
                navigate('/login');
            }
            return res.json();
        })
        .then(res => {
            if (res) {
                setTasks(res.tasks || []);
                setUser(res.user || {});
            }
        })
        .catch((err) => {
            console.log(err);
            navigate('/login');
        });
    }, []);

    const updateTask = (index) => {
        setEditTask(true);
        setIndex(index);
        const taskToEdit = tasks[index];
        setCurrtask({
            title: taskToEdit.title,
            description: taskToEdit.description,
            status: taskToEdit.status
        });
    };

    const putTask = (e) => {
        e.preventDefault();
        const id = tasks[Index]._id;
        fetch(`http://localhost:3000/${id}`, {
            method: 'PUT',
            body: JSON.stringify(currtask),
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then((res) => {
            console.log(res);
            const temp = [...tasks];
            temp[Index] = { ...temp[Index], ...currtask };
            setTasks(temp);
            setEditTask(false);
        });
    };

    const deleteTask = (index) => {
        const id = tasks[index]._id;
        fetch(`http://localhost:3000/${id}`, {
            method: 'DELETE',
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then((res) => {
            console.log(res);
            const updatedTasks = tasks.filter((_, i) => i !== index);
            setTasks(updatedTasks);
        })
        .catch((err) => {
            console.log(err);
        });
    };

    const changeVal = (e) => {
        setCurrtask({ ...currtask, [e.target.name]: e.target.value });
    };

    const addTask = () => {
        setEditTask(true);
        setCurrtask({ title: '', description: '', status: 'pending' });
        setIndex(-1);
    };

    const postTask = (e) => {
        e.preventDefault();
        fetch('http://localhost:3000/', {
            method: 'POST',
            body: JSON.stringify(currtask),
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then((res) => {
            console.log(res);
            const newTask = {
                ...currtask,
                _id: res.task?._id, 
                assignedTo: { name: user.name }
            };
            const temp = [...tasks];
            temp.push(newTask);
            setTasks(temp);
            setEditTask(false);
        });
    };

    return (
        <div>
            <div className="hero">
                Todo application
                <button onClick={addTask}>➕</button>
            </div>
            <div className="tasks">
                <table border="1">
                    <thead>
                        <tr>
                            <th>S.no</th>
                            <th>Task Title</th>
                            <th>Task description</th>
                            <th>Task status</th>
                            
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, index) => (
                            <tr key={task._id}>
                                <td>{index + 1}</td>
                                <td>{task.title}</td>
                                <td>{task.description}</td>
                                <td>{task.status}</td>
                                
                                <td>
                                    <button onClick={() => updateTask(index)}>update</button>
                                    <button onClick={() => deleteTask(index)}>delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {editTask && (
                    <form onSubmit={Index === -1 ? postTask : putTask}>
                        <label htmlFor="title">Title:</label>
                        <input type="text" name="title" placeholder="title" value={currtask.title} onChange={changeVal} />
                        <label htmlFor="description">Description:</label>
                        <input type="text" name="description" placeholder="description" value={currtask.description} onChange={changeVal} />
                        <label htmlFor="status">Status:</label>
                        <select name="status" value={currtask.status} onChange={changeVal}>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <button type="submit">Submit</button>
                        <button type="button" onClick={() => setEditTask(false)}>Close</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Home;
