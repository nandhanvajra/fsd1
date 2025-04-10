const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/userSchema');
const Task = require('./models/taskSchema');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const PORT = 3000;
const secret = 'secretkey';

mongoose.connect('mongodb://localhost:27017/todo-app')
    .then(() => console.log("connected to db"))
    .catch(err => console.error(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5002',
    credentials: true
}));

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, secret, (err, user) => {
            if (err) return res.status(401).send({ message: "invalid token" });
            req.user = user;
            next();
        });
    } else {
        res.status(401).send({ message: "no token provided" });
    }
};

app.get('/', authenticate, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id }).populate('assignedTo');
        res.status(200).send({ user: req.user, tasks });
    } catch (err) {
        res.status(500).send({ message: "internal error" });
    }
});

app.post('/', authenticate, async (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body;
        const task = await Task.create({ title, description, status, dueDate, assignedTo: req.user.id });
        res.status(201).send({ message: "task created", task });
    } catch (err) {
        res.status(400).send({ message: "creation failed", error: err.message });
    }
});

app.put('/:id', authenticate, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body, assignedTo: req.user.id },
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).send({ message: "task not found" });
        res.status(200).send({ message: "task updated", task });
    } catch (err) {
        res.status(400).send({ message: "update failed", error: err.message });
    }
});

app.delete('/:id', authenticate, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).send({ message: "task not found" });
        res.status(200).send({ message: "task deleted" });
    } catch (err) {
        res.status(400).send({ message: "deletion failed", error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(409).send({ message: "no user exists" });
    } else if (password !== user.password) {
        return res.status(409).send({ message: "wrong password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, secret, { expiresIn: '1h' });
    res.status(200).send({ token, user: { id: user._id, name: user.name, email: user.email } });
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });

    if (existing) {
        return res.status(409).send({ message: "user already exists" });
    }

    const newUser = await User.create({ name, email, password });
    const token = jwt.sign({ id: newUser._id, email: newUser.email, name: newUser.name }, secret, { expiresIn: '1h' });
    res.status(201).send({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
