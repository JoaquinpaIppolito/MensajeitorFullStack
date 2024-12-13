import Contact from "../models/contact.model.js"
import Message from "../models/message.model.js"


export const getContactsByUserId = async (req, res) => {
    try {
        const contacts = await Contact.find({ userId: req.params.userId })
        res.json(contacts)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener contactos!', error })
    }
}



export const getContactById = async (req, res) => {
    try {
        const { _id } = req.params
        console.log(`Buscando contacto con ID: ${_id}`);

        const contact = await Contact.findById(_id)
        console.log(`Resultado de la búsqueda: ${contact}`);

        if (!contact) {
            return res.status(404).json({ message: 'Contacto no encontrado!' })
        }
        res.json(contact)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el contacto!', error })
    }
}


export const addMessageToContact = async (req, res) => {
    try {
        const { text } = req.body
        const newMessage = new Message({
            author: 'yo',
            text: text,
            estado: 'recibido',
            day: 'hoy',
            hour: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            contactId: req.params.id
        })

        await newMessage.save()
        res.json(newMessage)
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar mensaje', error })
    }
}

export const getMessagesByContactId = async (req, res) => {
    try {
        const messages = await Message.find({ contactId: req.params.id })
        res.json(messages)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mensajes!', error })
    }
}

export const createContact = async (req, res) => {
    try {
        const { name, telefono, userId } = req.body

        if (!userId) {
            return res.status(400).json({ message: 'Es necesario el ID para crear contacto!' })
        }

        const newContact = new Contact({ name, telefono, userId })
        await newContact.save()

        res.status(201).json(newContact)
    } catch (error) {
        res.status(500).json({ message: 'Error al crear contacto!', error })
    }
}



export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params
        console.log(`Contacto a eliminar: ${id}`)

        const contact = await Contact.findByIdAndUpdate(
            id,
            { active: false },
            { new: true }
        )

        if (!contact) {
            return res.status(404).json({ message: 'Contacto no encontrado con ese ID!' })
        }

        res.json({ message: 'Contacto eliminado!', contact })
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el contacto!', error })
    }
}

