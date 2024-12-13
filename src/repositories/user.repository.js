import bcrypt from 'bcrypt'
import User from '../models/user.model'


// Capa lógica de nuestra app para comunicar con la DB
class UserRepository {
    
    /**
     * Creates a new user
     * @param {Object} user_data - new user data to be stored in the DB
     * @returns {Promise<User>} - a Promise that resolves to the newly created user
     */
    static async createUser(user_data) {
        const new_user = new User(user_data)
        return await new_user.save()
    }
    
    /**
     * Updates a User's password with the given email
     * @param {string} email - email of the User to update
     * @param {string} new_password - new password to be updated in the User
     * @returns {Promise<User>} - a Promise that resolves to the updated User
     */
    static async updatePassword(email, new_password) {
        const passwordHash = await bcrypt.hash(new_password, 10)
        return User.findOneAndUpdate({ email: email }, { password: passwordHash }, { new: true })
    }

    /**
     * Retrieves all active users from the database
     * @returns {Promise<Array<User>>} - A promise that resolves to an array of active Users
     */
    static async getAllUsers() {
        return User.find({ active: true })
    }

    /**
     * Retrieves a user by its email
     * @param {string} email - email of the user to retrieve
     * @returns {Promise<User>} - a Promise that resolves to the user with the given email
     */
    static async getUserByEmail(email) {
        return User.findOne({ email: email })
    }

    /**
     * Deletes a user with the given email
     * @param {string} email - email of the user to delete
     * @returns {Promise<User>} - a Promise that resolves to the deleted user
     */
    static async deleteUser(email) {
        return User.findOneAndUpdate({ email: email }, { active: false }, { new: true })
    }
}

export default UserRepository
