import { NextResponse } from 'next/server'
import { UserModel } from '@/models/User'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // IMPORTANTE: await params prima di usarlo
        const { id: idString } = await params
        console.log('ID from params:', idString)

        const id = parseInt(idString)
        console.log('Parsed ID:', id)

        if (isNaN(id)) {
            console.error('ID is NaN')
            return NextResponse.json({
                success: false,
                error: 'Invalid user ID'
            }, { status: 400 })
        }

        console.log('Fetching user with ID:', id)
        const { data, error } = await UserModel.findById(id)
        console.log('Supabase response:', { data, error })

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            }, { status: 500 })
        }

        if (!data) {
            console.log('No user found with ID:', id)
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 })
        }

        console.log('User found:', data)
        return NextResponse.json({
            success: true,
            user: data
        })
    } catch (err) {
        console.error('Caught error:', err)
        return NextResponse.json({
            success: false,
            error: err instanceof Error ? err.message : String(err)
        }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await params
        const id = parseInt(idString)
        const body = await request.json()

        if (isNaN(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid user ID'
            }, { status: 400 })
        }

        if (body.email) {
            const { data: existingUser } = await UserModel.findByEmail(body.email)
            if (existingUser && existingUser.id !== id) {
                return NextResponse.json({
                    success: false,
                    error: 'Email already exists'
                }, { status: 409 })
            }
        }

        const { data, error } = await UserModel.update(id, body)

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'User updated successfully',
            user: data
        })
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: err instanceof Error ? err.message : String(err)
        }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await params
        const id = parseInt(idString)

        if (isNaN(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid user ID'
            }, { status: 400 })
        }

        const { error } = await UserModel.delete(id)

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: err instanceof Error ? err.message : String(err)
        }, { status: 500 })
    }
}