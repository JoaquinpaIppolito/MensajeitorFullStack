import ENVIROMENT from "../config/enviroment.js"
import ResponseBuilder from "../helpers/builders/responseBuilder.js"
import trasporterEmail from "../helpers/emailTransporter.helpers.js"
import { verifyEmail, verifyMinLength, verifyString } from "../helpers/validations.helpers.js"
import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'


//Creacion Usuario

export const registerController = async (req, res) => {
    try {
        const { name, password, email } = req.body

        // Verificar si ya existe un usuario con ese email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setCode('EMAIL_ALREADY_REGISTERED')
                .setMessage('El correo electrónico ya está registrado')
                .setData({
                    detail: 'El correo electrónico ya está en uso. Por favor, usa otro.'
                })
                .build();
            return res.json(response);
        }


        const registerConfig = {
            name: {
                value: name,
                errors: [],
                validation: [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 4)
                ]
            },
            password: {
                value: password,
                errors: [],
                validation: [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 8)
                ]
            },
            email: {
                value: email,
                errors: [],
                validation: [
                    verifyEmail,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            }
        }
        let hayErrores = false
        for (let field_name in registerConfig) {
            for (let validation of registerConfig[field_name].validation) {
                let result = validation(field_name, registerConfig[field_name].value)
                if (result) {
                    hayErrores = true
                    registerConfig[field_name].errors.push(result)
                }
            }
        }


        if (hayErrores) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setCode('VALIDATION_ERROR')
                .setData(
                    {
                        registerState: registerConfig
                    }
                )
                .build()
            return res.json(response)
        }

        const hashedPassword = await bcrypt.hash(registerConfig.password.value, 10)

        const validationToken = jwt.sign(
            {
                email: registerConfig.email.value
            },
            ENVIROMENT.SECRET_KEY,
            {
                expiresIn: '1d'
            }
        )

        const redirectUrl = `${ENVIROMENT.BACKEND_URL}/api/auth/verify-email/` + validationToken

        const result = await trasporterEmail.sendMail({
            subject: 'Valida tu email',
            to: registerConfig.email.value,
            html: `
                <h1>Valida tu mail por favor!</h1>
                <br></br>
                <p>Para validar tu mail da click <a href='${redirectUrl}'>ACA!</a></p>
                <br></br>
                <p>Muchas Gracias! ... Team Mensajeitor</p>
            `
        })


        const userCreated = new User({
            name: registerConfig.name.value,
            email: registerConfig.email.value,
            password: hashedPassword,
            verficationToken: ''
        })
        await userCreated.save() //Esto lo guardara en mongoDB




        const response = new ResponseBuilder()
            .setCode('SUCCESS')
            .setOk(true)
            .setStatus(200)
            .setData(
                { registerResult: registerConfig,
                    user: userCreated._id
                 }
            )
            .build()
        return res.json(response)
    }
    catch (error) {

        if (error.code === 11000) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setCode(400)
                .setMessage('Email already registered')
                .setData({
                    detail: 'El email ya esta registrado'
                })
                .build()
            return res.json(response)
        }


    }
}


export const verifyEmailController = async (req, res) => {
    try {
        const { validation_token } = req.params

        const payload = jwt.verify(validation_token, ENVIROMENT.SECRET_KEY)
        const email_to_verify = payload.email
        const user_to_verify = await User.findOne({ email: email_to_verify })
        user_to_verify.emailVerified = true
        await user_to_verify.save()
        res.redirect(`${ENVIROMENT.FRONTEND_URL}/validation-email`)
    }
    catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}


//Logueo

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email: email })
        
        if(!user){
            return res.status(404).json({ ok: false, message: 'El email no esta registrado!' })
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password)
        if (!isCorrectPassword) {
            return res.status(401).json({ ok: false, message: 'Contraseña incorrecta!' })
        }

        if (!user.emailVerified) {
            return res.status(403).json({ ok: false, message: 'El email no ha sido verificado aun!' })
        }

        const access_token = jwt.sign(
            {
                user_id: user._id,
                name: user.name,
                email: user.email, 
                role: user.role
            },
            ENVIROMENT.SECRET_KEY,
            {
                expiresIn: '1d'
            }
        )

        const response = new ResponseBuilder()
        .setOk(true)
        .setCode('LOGGED_SUCCESS')
        .setMessage('Logged success!')
        .setStatus(200)
        .setData({
            access_token: access_token,
            user_info: {
                user_id: user._id,
                name: user.name,
                email: user.email
            }
        })
        .build()

        res.status(200).json(response)

    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ ok: false, message: 'Hubo un error en el servidor!' })
    }
}


//Reestablecimiento de contrasena:

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email })

        if (!user) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado' })
        }

        const reset_token = jwt.sign(
            { email: user.email },
            ENVIROMENT.SECRET_KEY,
            { expiresIn: '1d' }
        )

        const resetUrl = `${ENVIROMENT.FRONTEND_URL}/reset-password/${reset_token}`

        await trasporterEmail.sendMail({
            subject: 'Recuperar password',
            to: user.email,
            html: `
            <h1>Solicitud de Reestablecimiento de contraseña!</h1>
            <p>Presione en el siguiente enlace para ir a la pagina de reestablecimiento de contraseña:<p/>
            <br></br>
            <a href="${resetUrl}">Recuperar Contraseña!!</a>
            <br></br>
            <p>Muchas Gracias! ... Team Mensajeitor<p/>
            `
            
        })

        res.status(200).json({ ok: true })
    } catch (error) {
        console.error(error)
        res.status(500).json({ ok: false, message: 'Error al procesar la solicitud' })
    }
}


export const recoveryPasswordPageController = async (req, res) => {
    try {
        const { token } = req.params
        const payload = jwt.verify(token, ENVIROMENT.SECRET_KEY)
        const email_to_verify = payload.email

        // Redirigir al frontend en lugar de devolver un formulario HTML
        const resetUrl = `${ENVIROMENT.FRONTEND_URL}/reset-password/${token}`
        res.redirect(resetUrl)
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al procesar la solicitud.')
    }
}



// Controlador para restablecer la contraseña
export const recoveryPasswordController = async (req, res) => {
    try {
        const { new_password, reset_token } = req.body

        const { email } = jwt.verify(reset_token, ENVIROMENT.SECRET_KEY)
        const usuarioEncontrado = await User.findOne({ email: email })

        if (!usuarioEncontrado) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado' })
        }

        const passwordHash = await bcrypt.hash(new_password, 10)
        usuarioEncontrado.password = passwordHash
        await usuarioEncontrado.save()

        res.status(200).json({ ok: true, message: 'El password fue renovado correctamente!!' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}



// Subir avatar de usuario en basee64
export const uploadProfileImageController = async (req, res) => {
    try {
        const { image, userId } = req.body

        if (!image || !userId) {
            return res.status(400).json({ success: false, message: 'Faltan datos requeridos!' })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado con ese ID!' })
        }


        user.thumbnail = image
        await user.save()

        console.log('Imagen guardada correctamente en el usuario')

        const response = new ResponseBuilder()
            .setOk(true)
            .setCode('IMAGE_UPLOAD_SUCCESS')
            .setMessage('Avatar subido con éxito!')
            .setStatus(200)
            .setData({ user })
            .build()

        console.log('Respuesta del servidor:', response)
        return res.status(200).json(response)

    } catch (error) {
        console.error('Error al subir la imagen de perfil:', error)
        return res.status(500).json({ success: false, message: 'Error al subir la imagen de perfil!' })
    }
}


// Obtener datos del usuario
export const getUserDetailsController = async (req, res) => {
    try {
        const { userId } = req.body
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado con ese ID!' })
        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setCode('USER_DETAILS_SUCCESS')
            .setMessage('Datos del usuario obtenidos con éxito!')
            .setStatus(200)
            .setData({ user })
            .build()

        return res.status(200).json(response)
        console.log('usuario data enviada' + res)
    } catch (error) {
        console.error('Error al obtener los detalles del usuario!:', error)
        return res.status(500).json({ success: false, message: 'Error al obtener los detalles del usuario!' })
    }
}





