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

mongoose.connect('mongodb://localhost:27017/todo-app').then(() => {
    console.log("connected to db");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5001',
    credentials: true
}));

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const auth = authHeader && authHeader.split(' ')[1];

    if (auth) {
        jwt.verify(auth, secret, (err, user) => {
            if (err) {
                return res.status(401).send({ message: "wrong token" });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).send({ message: "no token" });
    }
};

app.get('/', authenticate, async (req, res) => {
    const tasks = await Task.find({ assignedTo: req.user.id }).populate('assignedTo');
    res.status(200).send({ message: "this is home page", user: req.user, tasks });
});

app.get('/:id', authenticate, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo');
        if (task) {
            res.status(200).send({ message: "task fetched", task });
        } else {
            res.status(404).send({ message: "task not fetched" });
        }
    } catch (err) {
        res.status(500).send({ message: "internal server error" });
    }
});

app.post('/', authenticate, async (req, res) => {
    const { title, description, status, dueDate } = req.body;
    const assignedTo = req.user.id; // ✅ Default to logged-in user

    try {
        const task = await Task.create({ title, description, status, dueDate, assignedTo });
        res.status(201).send({ message: "task created" });
    } catch (err) {
        res.status(401).send({ message: "error occurred" });
    }
});

app.put('/:id', authenticate, async (req, res) => {
    const { title, description, status, dueDate } = req.body;
    const assignedTo = req.user.id; // ✅ Default to logged-in user on update too

    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, status, dueDate, assignedTo },
            { new: true, runValidators: true }
        );

        if (!task) {
            res.status(404).send({ message: "task is not present" });
        } else {
            res.status(201).send({ message: "task updated" });
        }
    } catch (err) {
        res.status(401).send({ message: "error occurred" });
    }
});

app.delete('/:id', authenticate, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            res.status(404).send({ message: "task is not present" });
        } else {
            res.status(201).send({ message: "task deleted" });
        }
    } catch (err) {
        res.status(401).send({ message: "error occurred" });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(409).send({ message: "no user exists" });
    } else if (password !== user.password) {
        res.status(409).send({ message: "wrong pass" });
    } else {
        const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1hr' });
        res.status(201).send({ message: "authenticated correctly", token, user: { id: user._id, name: user.name, email: user.email } });
    }
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(409).send({ message: 'This user already exists' });
        }

        const newUser = await User.create({ name, email, password });
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, secret, { expiresIn: '1hr' });

        res.status(201).send({ message: 'new user created successfully', token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
    } catch (err) {
        res.status(500).send({ message: err });
    }
});

app.listen(PORT, () => {
    console.log("This is connected to port 3000");
});
