const mongoose=require('mongoose');

const taskSchema=mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String},
    status:{type:String,enum:["pending","in-progress","completed"],default:"pending"},
    dueDate:{type:Date},
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

})
const Task=mongoose.model('Task',taskSchema)
module.exports=Task;