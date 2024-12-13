import Message from "../models/message.model.js"

export const getMessagesByContactId = async (req, res) => {
    try {
        const messages = await Message.find({ contactId: req.params.contactId })
        res.json(messages)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mensajes!', error })
    }
}

export const addMessage = async (req, res) => {
    try {
        const { text } = req.body
        const newMessage = new Message({
            author: 'yo',
            text: text,
            estado: 'recibido',
            day: 'hoy',
            hour: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            contactId: req.params.contactId
        })

        await newMessage.save()
        res.json(newMessage)
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar mensaje', error })
    }
}


export const getLastMessageByContactId = async (req, res) => {
    try {
        const ultimoMensaje = await Message.findOne({ contactId: req.params.contactId })
            .sort({ createdAt: -1 }) // Ordenar por fecha descendiente!

        if (!ultimoMensaje) {
            return res.status(200).json({ text: 'Sin mensajes, inicia una conversacion!', hour: '' })
        }

        res.json(ultimoMensaje)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el ultimo mensaje!', error })
    }
}

