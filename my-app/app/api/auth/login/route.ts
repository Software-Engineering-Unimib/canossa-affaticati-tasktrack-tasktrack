import { NextResponse } from 'next/server'
import { UserModel } from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: 'Email and password are required'
            }, { status: 400 })
        }

        const { data: user, error } = await UserModel.findByEmail(email)

        if (error || !user) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password'
            }, { status: 401 })
        }

        // Verifica la password hashata
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
             return NextResponse.json({
                success: false,
                error: 'Invalid email or password'
            }, { status: 401 })
        }

        // Rimuovi la password dall'oggetto utente prima di inviarlo al client
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({
            success: true,
            user: userWithoutPassword
        })

    } catch (err) {
        console.error('Login error:', err)
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 })
    }
}
