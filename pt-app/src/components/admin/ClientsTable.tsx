import type { ReactNode } from 'react'

type Client = {
  id: string
  name: string | null
  surname: string | null
  phone: string | null
  email: string | null
  plan_description: string | null
  is_recurring: boolean | null
  sub_status: string | null
}

function fullName(c: Client): string {
  return [c.name, c.surname].filter(Boolean).join(' ') || '—'
}

function planLabel(c: Client): ReactNode {
  if (c.sub_status !== 'active' || !c.plan_description) return <span className="text-gray-500">Nessuno</span>
  return (
    <span className="text-gray-200">
      {c.plan_description}{' '}
      <span className={`ml-1 text-xs ${c.is_recurring ? 'text-[#ff8c42]' : 'text-gray-400'}`}>
        ({c.is_recurring ? 'ricorrente' : 'singolo'})
      </span>
    </span>
  )
}

export default function ClientsTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return <p className="text-gray-500 italic">Nessun cliente registrato.</p>

  return (
    <div>
      {/* Mobile: schede */}
      <div className="grid gap-3 md:hidden">
        {clients.map((c) => (
          <div key={c.id} className="bg-[#222] border border-gray-800 rounded-lg p-4">
            <p className="text-white font-semibold">{fullName(c)}</p>
            <p className="text-sm text-gray-400 break-all">{c.email ?? '—'}</p>
            <p className="text-sm text-gray-400">{c.phone ?? '—'}</p>
            <p className="text-sm mt-1">{planLabel(c)}</p>
          </div>
        ))}
      </div>

      {/* Desktop: tabella */}
      <div className="hidden md:block bg-[#222] rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/30 border-b border-gray-800 text-gray-400">
              <th className="text-left py-3 px-5 font-semibold">Cliente</th>
              <th className="text-left py-3 px-5 font-semibold">Email</th>
              <th className="text-left py-3 px-5 font-semibold">Telefono</th>
              <th className="text-left py-3 px-5 font-semibold">Abbonamento</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-gray-800/50 text-gray-300">
                <td className="py-3 px-5 text-white font-medium">{fullName(c)}</td>
                <td className="py-3 px-5">{c.email ?? '—'}</td>
                <td className="py-3 px-5">{c.phone ?? '—'}</td>
                <td className="py-3 px-5">{planLabel(c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
