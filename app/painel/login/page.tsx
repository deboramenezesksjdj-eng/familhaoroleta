'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'nookies'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await response.json()

      if (result.success) {
        setCookie(null, 'adminLoggedIn', 'true', {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          sameSite: true,
          path: '/',
        })
        router.push('/painel')
      } else {
        setError('Senha incorreta!')
      }
    } catch {
      setError('Erro ao validar senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[1.75rem] border-4 border-accent bg-card p-8 text-primary shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <Lock size={26} />
          </div>
          <h1 className="font-sans text-3xl font-black text-primary">Painel Administrativo</h1>
          <p className="mt-2 text-sm text-primary/60">Entre com sua senha para acessar</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-center text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary/60">
              Senha de Acesso
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-primary/15 bg-background/5 px-3 py-2.5 font-sans text-sm text-primary outline-none transition-colors placeholder:text-primary/35 focus:border-primary/60"
              placeholder="Digite a senha de acesso"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent px-6 py-3.5 font-sans text-sm font-black uppercase tracking-wide text-primary shadow-[0_5px_0_var(--color-primary)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? 'Validando...' : 'Acessar painel'}
          </button>
        </form>
      </div>
    </div>
  )
}
