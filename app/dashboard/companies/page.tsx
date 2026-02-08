'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { addCompany, getCompanies, Company } from '@/lib/data'
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
import { Search, Plus, Globe, Users, TrendingUp } from 'lucide-react'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [sizeMin, setSizeMin] = useState('')
  const [sizeMax, setSizeMax] = useState('')
  const [researchStatus, setResearchStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    domain: '',
    industry: '',
    sizeMin: '',
    sizeMax: '',
    location: ''
  })

  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await getCompanies()
        setCompanies(data)
        setFilteredCompanies(data)
      } catch (error) {
        console.error('Failed to load companies:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [])

  useEffect(() => {
    const searchLower = search.toLowerCase()
    const minValue = sizeMin ? Number(sizeMin) : null
    const maxValue = sizeMax ? Number(sizeMax) : null
    const statusFilter = researchStatus.toLowerCase()
    const filtered = companies.filter(company => {
      const matchesSearch =
        !searchLower ||
        company.name.toLowerCase().includes(searchLower) ||
        company.industry.toLowerCase().includes(searchLower)
      const matchesMin = minValue === null || company.size >= minValue
      const matchesMax = maxValue === null || company.size <= maxValue
      const companyResearch = company.reasearch_status
      const matchesResearch =
        statusFilter === 'all' ||
        (statusFilter === 'true' && companyResearch) ||
        (statusFilter === 'false' && !companyResearch)
      return matchesSearch && matchesMin && matchesMax && matchesResearch
    })
    setFilteredCompanies(filtered)
  }, [search, sizeMin, sizeMax, researchStatus, companies])

  const formatResearchStatus = (value: boolean) => (value ? 'Researched' : 'Not Researched')

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return 'text-accent'
    if (engagement >= 60) return 'text-blue-400'
    if (engagement >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getEngagementBg = (engagement: number) => {
    if (engagement >= 80) return 'bg-accent/10'
    if (engagement >= 60) return 'bg-blue-500/10'
    if (engagement >= 40) return 'bg-yellow-500/10'
    return 'bg-red-500/10'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.name) {
      setFormError('Company name is required')
      return
    }
    setSaving(true)
    try {
      await addCompany({
        name: form.name,
        domain: form.domain || undefined,
        industry: form.industry || undefined,
        size_min: form.sizeMin ? Number(form.sizeMin) : undefined,
        size_max: form.sizeMax ? Number(form.sizeMax) : undefined,
        location: form.location || undefined
      })
      setIsAddOpen(false)
      setForm({
        name: '',
        domain: '',
        industry: '',
        sizeMin: '',
        sizeMax: '',
        location: ''
      })
      const data = await getCompanies()
      setCompanies(data)
      setFilteredCompanies(data)
    } catch (error) {
      setFormError('Failed to add company')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Companies</h1>
          <p className="text-muted-foreground">Track and manage company accounts</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={18} />
              <span>Add Company</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Company</DialogTitle>
              <DialogDescription>Enter company details to add them to your accounts.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Company name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Domain"
                  value={form.domain}
                  onChange={(e) => setForm(prev => ({ ...prev, domain: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Industry"
                  value={form.industry}
                  onChange={(e) => setForm(prev => ({ ...prev, industry: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Size min"
                  type="number"
                  value={form.sizeMin}
                  onChange={(e) => setForm(prev => ({ ...prev, sizeMin: e.target.value }))}
                  className="bg-secondary text-foreground border-border"
                />
                <Input
                  placeholder="Size max"
                  type="number"
                  value={form.sizeMax}
                  onChange={(e) => setForm(prev => ({ ...prev, sizeMax: e.target.value }))}
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
                  {saving ? 'Saving...' : 'Add Company'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by company name or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary text-foreground border-border"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Size min"
                type="number"
                value={sizeMin}
                onChange={(e) => setSizeMin(e.target.value)}
                className="bg-secondary text-foreground border-border"
              />
              <Input
                placeholder="Size max"
                type="number"
                value={sizeMax}
                onChange={(e) => setSizeMax(e.target.value)}
                className="bg-secondary text-foreground border-border"
              />
              <select
                value={researchStatus}
                onChange={(e) => setResearchStatus(e.target.value)}
                className="h-10 rounded-md border border-border bg-secondary text-foreground px-3"
              >
                <option value="all">All Research Status</option>
                <option value="true">Researched</option>
                <option value="false">Not Researched</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading companies...</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No companies found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <Link key={company.id} href={`/dashboard/companies/${company.id}`}>
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {company.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{company.industry}</p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                    company.status === 'active'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    company.reasearch_status
                      ? 'bg-green-500/15 text-green-500'
                      : 'bg-red-500/15 text-red-500'
                  }`}>
                    {formatResearchStatus(company.reasearch_status)}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={16} className="text-muted-foreground" />
                    <span className="truncate text-primary">
                      {company.website || 'No website'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/60 bg-secondary/50 p-3 space-y-1 text-center">
                    <p className="text-xs text-muted-foreground">Size</p>
                    <div className="flex items-center justify-center gap-1 text-blue-400 font-semibold text-sm">
                      <Users size={16} />
                      {company.size}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-secondary/50 p-3 space-y-1 text-center">
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <div className="flex items-center justify-center gap-1 text-accent font-semibold text-sm">
                      <Users size={16} />
                      {company.leads}
                    </div>
                  </div>
                  <div className={`rounded-lg border border-border/60 bg-secondary/50 p-3 space-y-1 text-center ${getEngagementBg(company.engagement)}`}>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                    <div className={`flex items-center justify-center gap-1 font-semibold text-sm ${getEngagementColor(company.engagement)}`}>
                      <TrendingUp size={16} />
                      {company.engagement}%
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30">
                  View Details
                </Button>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
