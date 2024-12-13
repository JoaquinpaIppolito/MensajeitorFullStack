import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    imagen: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const Contact = mongoose.model('Contact', contactSchema)

export default Contact
