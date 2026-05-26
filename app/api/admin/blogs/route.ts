import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET all blogs
export async function GET() {
  try {
    const { data: blogs, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Handle the case where the table doesn't exist yet
      if (error.code === 'PGRST205' || error.message.includes('relation "blogs" does not exist')) {
        return NextResponse.json({ 
          error: 'table_missing',
          message: 'The "blogs" table does not exist in the database. Please run the SQL migration.'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ blogs })
  } catch (error: any) {
    console.error('Fetch blogs error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch blogs' }, { status: 500 })
  }
}

// POST create a blog
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, excerpt, content, category, read_time, image_url, status } = body

    if (!title || !slug || !excerpt || !content || !category || !read_time || !image_url) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .insert({
        title,
        slug: slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, ''),
        excerpt,
        content,
        category,
        read_time,
        image_url,
        status: status || 'Published',
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, blog })
  } catch (error: any) {
    console.error('Create blog error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 500 })
  }
}

// PUT update a blog
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, slug, excerpt, content, category, read_time, image_url, status } = body

    if (!id || !title || !slug || !excerpt || !content || !category || !read_time || !image_url) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .update({
        title,
        slug: slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, ''),
        excerpt,
        content,
        category,
        read_time,
        image_url,
        status: status || 'Published',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, blog })
  } catch (error: any) {
    console.error('Update blog error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update blog' }, { status: 500 })
  }
}

// DELETE a blog
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete blog error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete blog' }, { status: 500 })
  }
}
