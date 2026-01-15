import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    createdAt: { type: Date, default: Date.now },
    initialsName: { type: String, required: true },
}, {
    collection: 'Users' // <--- AGGIUNGI QUESTO (metti il nome esatto che vedi su Atlas)
});

// Evita di ricompilare il modello se esiste già (Next.js hot reload)
const User = models.User || model('User', UserSchema);

export default User;