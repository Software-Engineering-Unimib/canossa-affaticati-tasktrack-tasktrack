import { NextResponse } from 'next/server'
import { UserModel } from '@/models/User'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')

        console.log('Fetching users...')

        let data, error

        // Se c'è un parametro di ricerca, usa la funzione search
        if (search) {
            ({ data, error } = await UserModel.search(search))
        } else {
            ({ data, error } = await UserModel.findAll())
        }

        if (error) {
            console.error('Error fetching users:', error)
            return NextResponse.json({
                error: error.message,
                code: error.code,
                details: error.details
            }, { status: 500 })
        }

        console.log(`Found ${data?.length || 0} users`)
        return NextResponse.json({
            success: true,
            count: data?.length || 0,
            users: data
        })
    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch users',
            message: err instanceof Error ? err.message : String(err)
        }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Creating user:', { ...body, password: '***' }) // Nascondi la password nei log

        // Validazione campi obbligatori
        if (!body.name || !body.surname || !body.email || !body.password) {
            return NextResponse.json({
                success: false,
                error: 'Name, surname, email and password are required'
            }, { status: 400 })
        }

        // Validazione formato email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email format'
            }, { status: 400 })
        }

        // Controlla se l'email esiste già
        const { data: existingUser } = await UserModel.findByEmail(body.email)
        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: 'Email already exists'
            }, { status: 409 })
        }

        // NOTA: In produzione, dovresti hashare la password prima di salvarla!
        // Esempio: const hashedPassword = await bcrypt.hash(body.password, 10)

        const { data, error } = await UserModel.create({
            name: body.name,
            surname: body.surname,
            email: body.email,
            password: body.password // In produzione usa hashedPassword
        })

        if (error) {
            console.error('Error creating user:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                code: error.code
            }, { status: 500 })
        }

        console.log('User created successfully')
        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: data
        }, { status: 201 })
    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({
            success: false,
            error: 'Failed to create user',
            message: err instanceof Error ? err.message : String(err)
        }, { status: 500 })
    }
}