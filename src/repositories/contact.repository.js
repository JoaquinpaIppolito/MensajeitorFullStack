import Contact from '../models/contact.model.js'

// Capa lógica de nuestra app para comunicar con la DB
class ContactRepository {

    /**
     * Creates a new contact
     * @param {Object} contact_data - new contact data to be stored in the DB
     * @returns {Promise<Contact>} - a Promise that resolves to the newly created contact
     */
    static async createContact(contact_data) {
        const new_contact = new Contact(contact_data)
        return await new_contact.save()
    }

    /**
     * Retrieves all contacts from the database
     * @returns {Promise<Array<Contact>>} - A promise that resolves to an array of contacts
     */
    static async getAllContacts() {
        return Contact.find()
    }

    /**
     * Retrieves a contact by its ID
     * @param {string} id - ID of the contact to retrieve
     * @returns {Promise<Contact>} - a Promise that resolves to the contact with the given ID
     */
    static async getContactById(id) {
        return Contact.findById(id)
    }

    /**
     * Adds a message to a contact
     * @param {string} id - ID of the contact to update
     * @param {Object} message - message to be added to the contact
     * @returns {Promise<Contact>} - a Promise that resolves to the updated contact
     */
    static async addMessageToContact(id, message) {
        const contact = await Contact.findById(id)
        contact.mensajes.push(message)
        return contact.save()
    }

    /**
     * Updates a contact's data
     * @param {string} id - ID of the contact to update
     * @param {Object} contact_data - new data to update in the contact
     * @returns {Promise<Contact>} - a Promise that resolves to the updated contact
     */
    static async updateContact(id, contact_data) {
        return Contact.findByIdAndUpdate(id, contact_data, { new: true })
    }

    /**
     * Deletes a contact
     * @param {string} id - ID of the contact to delete
     * @returns {Promise<Contact>} - a Promise that resolves to the deleted contact
     */
    static async deleteContact(id) {
        return Contact.findByIdAndDelete(id)
    }
}

export default ContactRepository
