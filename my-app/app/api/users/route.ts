import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        console.log('Attempting to fetch from Supabase...')

        const { data, error } = await supabase
            .from('Users')
            .select('*')

        console.log('Supabase response:', { data, error })

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({
                error: error.message,
                code: error.code,
                details: error.details
            }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error('Caught error:', err)
        return NextResponse.json({
            error: 'Fetch failed',
            message: err instanceof Error ? err.message : String(err)
        }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Inserting data:', body)

        const { data, error } = await supabase
            .from('Users')
            .insert(body)
            .select()

        console.log('Insert response:', { data, error })

        if (error) {
            return NextResponse.json({
                error: error.message,
                code: error.code
            }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error('POST error:', err)
        return NextResponse.json({
            error: err instanceof Error ? err.message : String(err)
        }, { status: 500 })
    }
}