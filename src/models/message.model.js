import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    author: String,
    text: String,
    estado: String,
    day: String,
    hour: String,
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: true
    }
}, { timestamps: true }) 

const Message = mongoose.model('Message', messageSchema)

export default Message
