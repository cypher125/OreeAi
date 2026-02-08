'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { addLead, getLeads, Lead } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Search, Filter, Plus, Mail, TrendingUp, Clock } from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [perPage] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    companyDomain: '',
    jobTitle: '',
    source: 'manual'
  })

  useEffect(() => {
    async function loadLeads() {
      try {
        const data = await getLeads({
          status: statusFilter,
          search,
          page,
          perPage
        })
        setLeads(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error('Failed to load leads:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLeads()
  }, [statusFilter, search, page, perPage])

  const formatStatusLabel = (status: string) =>
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  const getInitials = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '—'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase()
    if (['replied', 'responded'].includes(normalized)) {
      return 'bg-green-500/10 text-green-400 border border-green-500/30'
    }
    if (['researched'].includes(normalized)) {
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
    }
    if (['pending_approval', 'pending'].includes(normalized)) {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
    }
    if (['active'].includes(normalized)) {
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
    }
    if (['paused'].includes(normalized)) {
      return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
    }
    if (['inactive', 'suspended'].includes(normalized)) {
      return 'bg-muted text-muted-foreground border border-border'
    }
    if (['new'].includes(normalized)) {
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
    }
    return 'bg-muted text-muted-foreground border border-border'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.email) {
      setFormError('Email is required')
      return
    }
    setSaving(true)
    try {
      await addLead({
        email: form.email,
        source: form.source,
        first_name: form.firstName || undefined,
        last_name: form.lastName || undefined,
        company_name: form.companyName || undefined,
        company_domain: form.companyDomain || undefined,
        job_title: form.jobTitle || undefined
      })
      setIsAddOpen(false)
      setForm({
        email: '',
        firstName: '',
        lastName: '',
        companyName: '',
        companyDomain: '',
        jobTitle: '',
        source: 'manual'
      })
      setPage(1)
    } catch (error) {
      setFormError('Failed to add lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads</h1>
          <p className="text-muted-foreground">Manage and track your sales leads</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={18} />
              <span>Add Lead</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Lead</DialogTitle>
              <DialogDescription>Enter lead details to add them to your pipeline.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Source"
                  value={form.source}
                  onChange={(e) => setForm(prev => ({ ...prev, source: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Company name"
                  value={form.companyName}
                  onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Company domain"
                  value={form.companyDomain}
                  onChange={(e) => setForm(prev => ({ ...prev, companyDomain: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Job title"
                  value={form.jobTitle}
                  onChange={(e) => setForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
              </div>
              {formError && (
                <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-md">
                  {formError}
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Lead'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10 bg-secondary text-foreground border-border"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'researched', 'pending_approval', 'active', 'replied', 'paused', 'inactive', 'suspended'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  className={statusFilter === status ? 'bg-primary text-primary-foreground' : 'border-border text-foreground'}
                  onClick={() => {
                    setStatusFilter(status)
                    setPage(1)
                  }}
                >
                  <Filter size={16} />
                  <span>{formatStatusLabel(status)}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>All Leads ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No leads found</div>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-[minmax(240px,2fr)_minmax(140px,1fr)_minmax(110px,0.7fr)_minmax(120px,0.8fr)_minmax(140px,1fr)_minmax(160px,1fr)_auto] gap-4 px-4 text-xs text-muted-foreground">
                <div>Lead</div>
                <div>Status</div>
                <div>Sent</div>
                <div>Response</div>
                <div>Last Email</div>
                <div>Next Action</div>
                <div></div>
              </div>
              {leads.map((lead) => (
                <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,2fr)_minmax(140px,1fr)_minmax(110px,0.7fr)_minmax(120px,0.8fr)_minmax(140px,1fr)_minmax(160px,1fr)_auto] gap-4 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{lead.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                      </div>
                    </div>
                    <div className="flex items-start md:items-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(lead.status)}`}>
                        {formatStatusLabel(lead.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                      <Mail size={16} />
                      {lead.emailsSent}
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                      <TrendingUp size={16} />
                      {lead.responseRate}%
                    </div>
                    <div className="text-foreground text-sm font-semibold">{lead.lastEmail}</div>
                    <div className="text-sm text-muted-foreground">
                      {lead.nextAction || '—'}
                    </div>
                    <Button variant="outline" size="sm" className="border-border">
                      View
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
