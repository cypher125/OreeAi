'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getCompany, getLeads, Company, Lead } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Globe, Users, TrendingUp, Mail, Calendar, CheckCircle, AlertCircle } from 'lucide-react'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [companyLeads, setCompanyLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)

  const companyId = params.id as string

  useEffect(() => {
    async function loadCompany() {
      try {
        const found = await getCompany(companyId)
        if (found) setCompany(found)
      } catch (error) {
        console.error('Failed to load company:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [companyId])

  useEffect(() => {
    if (!company) return
    async function loadLeads() {
      setLeadsLoading(true)
      try {
        const data = await getLeads({ perPage: 500, page: 1 })
        const normalize = (value: string) =>
          value
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .trim()
        const companyName = normalize(company.name)
        const companyDomain = company.website ? normalize(company.website) : ''
        const leads = data.items.filter((lead) => {
          const leadCompany = normalize(lead.company || '')
          return (
            (companyName && leadCompany.includes(companyName)) ||
            (companyDomain && leadCompany.includes(companyDomain))
          )
        })
        setCompanyLeads(leads)
      } catch (error) {
        console.error('Failed to load leads:', error)
      } finally {
        setLeadsLoading(false)
      }
    }

    loadLeads()
  }, [company])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading company details...</div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-muted-foreground">Company not found</div>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  const parseSectionValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return parsed
      } catch {
        return value
      }
    }
    return value
  }

  const metadata = parseSectionValue(company.metadata)
  const researchData = (() => {
    if (!metadata || typeof metadata !== 'object') return null
    const record = metadata as Record<string, unknown>
    const raw =
      record.research_data ||
      record.researchData ||
      record.research ||
      record.research_summary ||
      record.company_research ||
      record.companyResearch ||
      null
    return parseSectionValue(raw)
  })()

  const formatLabel = (value: string) =>
    value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  const renderValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">No data</span>
    }
    if (typeof value === 'string') {
      return <p className="text-sm text-foreground whitespace-pre-wrap break-words">{value}</p>
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return <span className="text-foreground">{String(value)}</span>
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">No data</span>
      }
      if (value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))) {
        return (
          <ul className="space-y-2">
            {value.map((item, index) => (
              <li key={`${item}-${index}`} className="text-sm text-foreground">
                {String(item)}
              </li>
            ))}
          </ul>
        )
      }
      return (
        <div className="space-y-3">
          {value.map((item, index) => (
            <div key={index} className="rounded-md border border-border bg-background p-3">
              {renderValue(item)}
            </div>
          ))}
        </div>
      )
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
      if (entries.length === 0) {
        return <span className="text-muted-foreground">No data</span>
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map(([key, entryValue]) => (
            <div key={key} className="space-y-1">
              <div className="text-xs text-muted-foreground">{formatLabel(key)}</div>
              <div>{renderValue(entryValue)}</div>
            </div>
          ))}
        </div>
      )
    }
    return <span className="text-muted-foreground">No data</span>
  }

  const renderSectionBlock = (label: string, value: unknown, blockKey?: string) => (
    <div key={blockKey} className="rounded-md border border-border bg-background p-4 space-y-2">
      <div className="text-sm font-medium text-foreground">{label}</div>
      {renderValue(value)}
    </div>
  )

  const renderResearchData = () => {
    if (!researchData || typeof researchData !== 'object') {
      return renderSectionBlock('Research', researchData)
    }
    const data = researchData as Record<string, unknown>
    const hiddenKeys = new Set(['lead_id', 'client_id'])
    const orderedKeys = [
      'company_name',
      'job_title',
      'lead_name',
      'lead_email',
      'researched_at',
      'full_context',
      'company_insights',
      'research_summary',
      'data_sources_used',
      'research_completeness',
      'lead_linkedin_activity',
      'company_linkedin_activity'
    ]
    const used = new Set<string>()
    const sections = orderedKeys
      .filter((key) => data[key] !== undefined && data[key] !== null && !hiddenKeys.has(key))
      .map((key) => {
        used.add(key)
        return renderSectionBlock(formatLabel(key), data[key], `research-${key}`)
      })
    const remaining = Object.keys(data)
      .filter((key) => !used.has(key) && !hiddenKeys.has(key))
      .map((key) => renderSectionBlock(formatLabel(key), data[key], `research-${key}`))
    return <div className="space-y-4">{sections}{remaining}</div>
  }

  const formatResearchStatus = (value: boolean) => (value ? 'Researched' : 'Not Researched')

  const formatLeadStatus = (status: string) =>
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="icon"
            className="border-border bg-transparent text-foreground hover:bg-muted"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground mt-1">{company.industry}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            company.reasearch_status
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {formatResearchStatus(company.reasearch_status)}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            company.status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-muted text-muted-foreground'
          }`}>
            {company.status === 'active' ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users size={16} />
              Company Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{company.size}</div>
            <p className="text-xs text-muted-foreground mt-1">employees</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail size={16} />
              Active Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{company.leads}</div>
            <p className="text-xs text-muted-foreground mt-1">in pipeline</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{company.engagement}%</div>
            <p className="text-xs text-muted-foreground mt-1">overall score</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe size={16} />
              Website
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.website ? (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline truncate text-sm"
              >
                Visit
              </a>
            ) : (
              <span className="text-muted-foreground text-sm">Not available</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Company Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Industry</p>
                  <p className="text-foreground font-medium">{company.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Size</p>
                  <p className="text-foreground font-medium">{company.size} employees</p>
                </div>
              </div>
              {company.website && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Website</p>
                  <a 
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Overall Engagement</span>
                    <span className="text-sm font-bold text-accent">{company.engagement}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${company.engagement}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Mail size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Leads</p>
                      <p className="text-lg font-bold text-foreground">{company.leads}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <TrendingUp size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Growth</p>
                      <p className="text-lg font-bold text-foreground">+12%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="bg-card border-border cursor-pointer transition-colors hover:bg-secondary/60">
                <CardHeader>
                  <CardTitle className="text-lg">Research Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Click to view research details</div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-none sm:max-w-none w-[70vw] h-[70vh] min-w-[320px] min-h-[320px] overflow-auto resize-x">
              <DialogHeader>
                <DialogTitle>Research Data</DialogTitle>
                <DialogDescription>Detailed research context for this company</DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                {renderResearchData()}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Mail size={18} />
                Send Email
              </Button>
              <Button variant="outline" className="w-full border-border bg-transparent text-foreground hover:bg-muted">
                <Calendar size={18} />
                Schedule Call
              </Button>
              <Button variant="outline" className="w-full border-border bg-transparent text-foreground hover:bg-muted">
                Add Lead
              </Button>
              <Button variant="outline" className="w-full border-border bg-transparent text-foreground hover:bg-muted">
                View Activity
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {company.status === 'active' ? (
                  <>
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="text-foreground">Currently Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} className="text-yellow-500" />
                    <span className="text-foreground">Inactive</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Last updated today</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Company Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="text-sm text-muted-foreground">Loading leads...</div>
              ) : companyLeads.length === 0 ? (
                <div className="text-sm text-muted-foreground">No leads linked to this company</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-[1.2fr_1.4fr_0.8fr] gap-3 text-xs text-muted-foreground px-2">
                    <div>Lead</div>
                    <div>Email</div>
                    <div>Status</div>
                  </div>
                  <div className="max-h-[360px] overflow-auto space-y-2 pr-2">
                    {companyLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/dashboard/leads/${lead.id}`}
                        className="grid grid-cols-[1.2fr_1.4fr_0.8fr] gap-3 items-center rounded-lg border border-border/70 bg-secondary/40 px-3 py-2 hover:bg-secondary/70"
                      >
                        <span className="text-sm font-medium text-foreground truncate">{lead.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{lead.email}</span>
                        <span className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground justify-self-start">
                          {formatLeadStatus(lead.status)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
