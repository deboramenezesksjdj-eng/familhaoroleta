'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Eye, User, CreditCard, Calendar, Filter, Pencil, Phone } from 'lucide-react'

export default function AdminPanel() {
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showDetails, setShowDetails] = useState<any>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  // Fetch data from API instead of mock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/submit-redemption')
        if (!response.ok) {
          throw new Error('Erro ao buscar dados')
        }
        const data = await response.json()
        setRedemptions(data)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        // Se falhar, usamos dados mockados como fallback
        const mockData = [
          {
            id: 1,
            nome: 'Maria Silva',
            cpf: '123.456.789-00',
            whatsapp: '(11) 99999-9999',
            endereco: 'Rua Exemplo, 123 - Centro - São Paulo/SP',
            banco: 'Banco Exemplo',
            agencia: '1234',
            conta: '56789-0',
            premio: 'R$ 50.000',
            data: '2026-10-30',
            status: 'pendente'
          },
          {
            id: 2,
            nome: 'João Oliveira',
            cpf: '987.654.321-00',
            whatsapp: '(21) 98888-8888',
            endereco: 'Av. Principal, 456 - Jardim - Rio de Janeiro/RJ',
            banco: 'Banco Teste',
            agencia: '5678',
            conta: '12345-6',
            premio: 'R$ 50.000',
            data: '2026-10-29',
            status: 'processando'
          }
        ]
        
        setRedemptions(mockData)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRedemptions = redemptions.filter(redemption => {
    const term = searchTerm.toLowerCase()
    const nome = String(redemption.nome ?? '').toLowerCase()
    const cpf = String(redemption.cpf ?? '')
    const whatsapp = String(redemption.whatsapp ?? '')

    const matchesSearch =
      nome.includes(term) ||
      cpf.includes(searchTerm) ||
      whatsapp.includes(searchTerm)

    const matchesStatus = selectedStatus === 'all' || redemption.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    const headers = ['id', 'nome', 'cpf', 'whatsapp', 'endereco', 'banco', 'agencia', 'conta', 'premio', 'data', 'hora', 'status']
    const rows = filteredRedemptions.map(redemption =>
      [
        redemption.id,
        redemption.nome,
        redemption.cpf,
        redemption.whatsapp,
        redemption.endereco,
        redemption.banco,
        redemption.agencia,
        redemption.conta,
        redemption.premio,
        redemption.data,
        redemption.hora,
        redemption.status
      ].map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';')
    )
    const csv = [headers.join(';'), ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resgates-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'processando': return 'bg-blue-100 text-blue-800'
      case 'concluido': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditClick = (id: number, currentValue: string) => {
    setEditingId(id)
    setEditValue(currentValue)
  }

  const handleSaveEdit = async (id: number) => {
    try {
      const response = await fetch(`/api/submit-redemption`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          whatsapp: editValue
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar dados')
      }

      // Atualiza o estado local com os novos dados
      const updatedRedemptions = redemptions.map(redemption => 
        redemption.id === id ? { ...redemption, whatsapp: editValue } : redemption
      )
      
      setRedemptions(updatedRedemptions)
      setEditingId(null)
      setEditValue('')
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
      alert('Erro ao atualizar número de WhatsApp')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/submit-redemption', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      setRedemptions(redemptions.map(redemption =>
        redemption.id === id ? { ...redemption, status } : redemption
      ))
      if (showDetails?.id === id) {
        setShowDetails({ ...showDetails, status })
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta solicitação? Essa ação não pode ser desfeita.')) {
      return
    }
    try {
      const response = await fetch(`/api/submit-redemption?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir')
      }

      setRedemptions(redemptions.filter(redemption => redemption.id !== id))
      if (showDetails?.id === id) {
        setShowDetails(null)
      }
    } catch (error) {
      console.error('Erro ao excluir solicitação:', error)
      alert('Erro ao excluir solicitação')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-card">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-card/70">Carregando painel de administração...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-primary">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary/50">Administração</p>
              <h1 className="font-sans text-2xl font-black text-primary">Painel de Resgates</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExport}
                className="flex items-center rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-black text-primary shadow-[0_4px_0_var(--color-primary)] transition-transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-card rounded-2xl shadow-sm p-6 mb-6 border border-primary/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary/40" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou WhatsApp..."
                className="block w-full rounded-xl border-2 border-primary/15 bg-background/5 pl-10 pr-3 py-2.5 text-sm text-primary outline-none transition-colors placeholder:text-primary/35 focus:border-primary/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-primary/50" />
                <select
                  className="rounded-xl border-2 border-primary/15 bg-background/5 px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-primary/60"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="processando">Processando</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl border border-primary/10 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-secondary/40 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-primary/55">Total Solicitações</h3>
                <p className="font-sans text-2xl font-black text-primary">{redemptions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-primary/10 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-primary/55">Pendentes</h3>
                <p className="font-sans text-2xl font-black text-primary">{redemptions.filter(r => r.status === 'pendente').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-primary/10 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent/30 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-primary/55">Valor Total</h3>
                <p className="font-sans text-2xl font-black text-primary">R$ 100.000</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-primary/10 shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-primary/55">Concluídas</h3>
                <p className="font-sans text-2xl font-black text-primary">{redemptions.filter(r => r.status === 'concluido').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Redemption Table */}
        <div className="bg-card rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary/10">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary/60 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary/60 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary/60 uppercase tracking-wider">Banco</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary/60 uppercase tracking-wider">Prêmio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary/60 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary/60 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary/60 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-primary/10">
                {filteredRedemptions.map((redemption) => (
                  <tr key={redemption.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary">{redemption.nome}</div>
                      <div className="text-sm text-primary/55">{redemption.cpf}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === redemption.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="rounded-lg border-2 border-primary/20 rounded px-2 py-1 text-sm w-full text-primary"
                        />
                      ) : (
                        <div>
                          <div className="text-sm text-primary">{redemption.whatsapp}</div>
                          <div className="text-sm text-primary/55 truncate max-w-xs">{redemption.endereco}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">{redemption.banco}</div>
                      <div className="text-sm text-primary/55">Ag: {redemption.agencia} - Conta: {redemption.conta}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-primary">
                      {redemption.premio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary/55">
                      {redemption.data || (redemption.timestamp ? new Date(redemption.timestamp).toLocaleString('pt-BR') : '-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={redemption.status ?? 'pendente'}
                        onChange={(e) => handleStatusChange(redemption.id, e.target.value)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none ${getStatusColor(redemption.status)}`}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="processando">Processando</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setShowDetails(redemption)}
                        className="font-bold text-primary/70 underline-offset-2 hover:text-primary hover:underline mr-3"
                      >
                        Ver
                      </button>
                      {editingId === redemption.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(redemption.id)}
                            className="font-bold text-green-600 hover:text-green-800 mr-3"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="font-bold text-primary/60 hover:text-primary"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditClick(redemption.id, redemption.whatsapp)}
                          className="font-bold text-green-600 hover:text-green-800 mr-3"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(redemption.id)}
                        className="font-bold text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRedemptions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-primary/55">Nenhuma solicitação encontrada</p>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-[1.75rem] border-4 border-accent shadow-xl max-w-md w-full text-primary">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-sans text-lg font-black text-primary">Detalhes da Solicitação</h3>
                <button
                  onClick={() => setShowDetails(null)}
                  className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                  aria-label="Fechar detalhes"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-primary/5 p-3">
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary/60">Informações Pessoais</h4>
                  <p className="mt-1 text-sm font-bold text-primary">{showDetails.nome}</p>
                  <p className="text-sm text-primary/70">{showDetails.cpf}</p>
                  <p className="text-sm text-primary/70">{showDetails.whatsapp}</p>
                </div>

                <div className="rounded-xl bg-primary/5 p-3">
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary/60">Endereço</h4>
                  <p className="mt-1 text-sm text-primary/70">{showDetails.endereco}</p>
                </div>

                <div className="rounded-xl bg-primary/5 p-3">
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary/60">Dados Bancários</h4>
                  <p className="mt-1 text-sm text-primary/70">Banco: {showDetails.banco}</p>
                  <p className="text-sm text-primary/70">Agência: {showDetails.agencia} - Conta: {showDetails.conta}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-primary/5 p-3">
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary/60">Prêmio</h4>
                    <p className="mt-1 text-sm font-black text-primary">{showDetails.premio}</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 p-3">
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary/60">Data</h4>
                    <p className="mt-1 text-sm text-primary/70">{showDetails.data || (showDetails.timestamp ? new Date(showDetails.timestamp).toLocaleString('pt-BR') : '-')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end items-center space-x-3">
                <select
                  value={showDetails.status ?? 'pendente'}
                  onChange={(e) => handleStatusChange(showDetails.id, e.target.value)}
                  className={`px-3 py-2 rounded-full text-sm font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-primary/40 focus:outline-none ${getStatusColor(showDetails.status)}`}
                >
                  <option value="pendente">Pendente</option>
                  <option value="processando">Processando</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <button
                  onClick={() => setShowDetails(null)}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-black text-accent transition-colors hover:bg-primary/90"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}