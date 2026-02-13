'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getLead, Lead } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Building2, CheckCircle, Clock, TrendingUp, MessageSquare, Calendar, AlertCircle } from 'lucide-react'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  const leadId = params.id as string

  useEffect(() => {
    async function loadLead() {
      try {
        const found = await getLead(leadId)
        if (found) setLead(found)
      } catch (error) {
        console.error('Failed to load lead:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLead()
  }, [leadId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading lead details...</div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-muted-foreground">Lead not found</div>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  const formatStatusLabel = (status: string) =>
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase()
    if (['replied', 'responded'].includes(normalized)) {
      return 'bg-green-500/20 text-green-400'
    }
    if (['researched'].includes(normalized)) {
      return 'bg-purple-500/20 text-purple-400'
    }
    if (['pending_approval', 'pending'].includes(normalized)) {
      return 'bg-amber-500/20 text-amber-400'
    }
    if (['active'].includes(normalized)) {
      return 'bg-blue-500/20 text-blue-400'
    }
    if (['paused'].includes(normalized)) {
      return 'bg-yellow-500/20 text-yellow-400'
    }
    if (['inactive', 'suspended'].includes(normalized)) {
      return 'bg-muted text-muted-foreground'
    }
    if (['new'].includes(normalized)) {
      return 'bg-cyan-500/20 text-cyan-400'
    }
    return 'bg-muted text-muted-foreground'
  }

  const getStatusIcon = (status: string) => {
    const normalized = status.toLowerCase()
    if (['replied', 'responded'].includes(normalized)) {
      return <CheckCircle size={16} />
    }
    if (['active'].includes(normalized)) {
      return <Clock size={16} />
    }
    if (['pending_approval', 'pending'].includes(normalized)) {
      return <AlertCircle size={16} />
    }
    return <AlertCircle size={16} />
  }

  const metadata = lead.metadata
  const jobTitle = (() => {
    if (!metadata || typeof metadata !== 'object') return null
    const record = metadata as Record<string, unknown>
    const direct =
      record.job_title ??
      record.jobTitle ??
      record.title ??
      record.position ??
      record.role
    if (direct !== undefined && direct !== null && direct !== '') {
      return String(direct)
    }
    const apollo = record.apollo_raw as Record<string, unknown> | undefined
    const apolloTitle = apollo?.title
    if (apolloTitle !== undefined && apolloTitle !== null && apolloTitle !== '') {
      return String(apolloTitle)
    }
    const apolloPerson = apollo?.person as Record<string, unknown> | undefined
    const apolloPersonTitle = apolloPerson?.title
    return apolloPersonTitle ? String(apolloPersonTitle) : null
  })()
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

  const pickSection = (keys: string[]) => {
    if (!metadata || typeof metadata !== 'object') return null
    const record = metadata as Record<string, unknown>
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null) {
        return parseSectionValue(record[key])
      }
    }
    return null
  }

  const researchData = pickSection(['research', 'research_data', 'researchData'])
  const contentSequenceData = pickSection([
    'content_sequence',
    'contentSequence',
    'sequence',
    'sequence_data',
    'sequenceData',
    'email_sequence'
  ])

  const formatLabel = (value: string) =>
    value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  const renderPrimitive = (value: string | number | boolean | null) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">No data</span>
    }
    return <span className="text-foreground">{String(value)}</span>
  }

  const renderValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">No data</span>
    }
    if (typeof value === 'string') {
      return <p className="text-sm text-foreground whitespace-pre-wrap break-words">{value}</p>
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return renderPrimitive(value)
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
      'company_summary',
      'company_posts_text',
      'company_website_text',
      'linkedin_profile',
      'company_insights',
      'intent_signals',
      'apollo_raw'
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

  const renderContentSequence = () => {
    if (!contentSequenceData) {
      return renderSectionBlock('Content Sequence', contentSequenceData)
    }
    if (typeof contentSequenceData === 'object' && contentSequenceData !== null) {
      const record = contentSequenceData as Record<string, unknown>
      const emails = Array.isArray(record.emails) ? record.emails : null
      if (emails && emails.length > 0) {
        return (
          <div className="space-y-4">
            {emails.map((email, index) => {
              const emailRecord = email as Record<string, unknown>
              const subject = String(emailRecord.subject || 'No subject')
              const status = String(emailRecord.status || 'unknown')
              const step = String(emailRecord.sequence_position || emailRecord.sequence_position_label || emailRecord.type || `Step ${index + 1}`)
              const wordCount = emailRecord.word_count ?? emailRecord.wordCount
              const sendAfter = emailRecord.send_after_days ?? emailRecord.sendAfterDays
              const body = emailRecord.body || emailRecord.email_body || ''
              return (
                <div key={`${subject}-${index}`} className="rounded-md border border-border bg-background p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{subject}</div>
                    <div className="text-xs text-muted-foreground">{step}</div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div>Status: <span className="text-foreground">{status}</span></div>
                    {wordCount !== undefined && wordCount !== null && (
                      <div>Words: <span className="text-foreground">{String(wordCount)}</span></div>
                    )}
                    {sendAfter !== undefined && sendAfter !== null && (
                      <div>Send After: <span className="text-foreground">{String(sendAfter)} days</span></div>
                    )}
                  </div>
                  <div className="text-sm text-foreground whitespace-pre-wrap break-words">{String(body)}</div>
                </div>
              )
            })}
          </div>
        )
      }
      return renderSectionBlock('Content Sequence', contentSequenceData)
    }
    return renderSectionBlock('Content Sequence', contentSequenceData)
  }

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
            <h1 className="text-3xl font-bold text-foreground">{lead.name}</h1>
            <p className="text-muted-foreground mt-1">{lead.company}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(lead.status)}`}>
          {getStatusIcon(lead.status)}
          {formatStatusLabel(lead.status)}
        </div>
      </div>

      {/* Contact & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail size={16} />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a href={`mailto:${lead.email}`} className="text-accent hover:underline truncate">
              {lead.email}
            </a>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 size={16} />
              Company
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground font-medium">{lead.company}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} />
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{lead.responseRate}%</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail size={16} />
              Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lead.emailsSent}</div>
            <p className="text-xs text-muted-foreground mt-1">total emails</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare size={16} />
              Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground font-medium break-words">{lead.source || '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Name</p>
                  <p className="text-foreground font-medium">{lead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-accent hover:underline">
                    {lead.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Company</p>
                  <p className="text-foreground font-medium">{lead.company}</p>
                </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Job Title</p>
                <p className="text-foreground font-medium">{jobTitle || '—'}</p>
              </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-sm font-medium ${getStatusColor(lead.status)}`}>
                    {getStatusIcon(lead.status)}
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="text-sm font-bold text-accent">{lead.responseRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${lead.responseRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Mail size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Emails Sent</p>
                      <p className="text-lg font-bold text-foreground">{lead.emailsSent}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Clock size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Email</p>
                      <p className="text-lg font-bold text-foreground">{lead.lastEmail}</p>
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
                <DialogDescription>Detailed research context for this lead</DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                {renderResearchData()}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="bg-card border-border cursor-pointer transition-colors hover:bg-secondary/60">
                <CardHeader>
                  <CardTitle className="text-lg">Content Sequence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Click to view sequence details</div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-none sm:max-w-none w-[70vw] h-[70vh] min-w-[320px] min-h-[320px] overflow-auto resize-x">
              <DialogHeader>
                <DialogTitle>Content Sequence</DialogTitle>
                <DialogDescription>Generated outreach sequence for this lead</DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                {renderContentSequence()}
              </div>
            </DialogContent>
          </Dialog>

          {lead.notes && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{lead.notes}</p>
              </CardContent>
            </Card>
          )}
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
                <MessageSquare size={18} />
                View Replies
              </Button>
              <Button variant="outline" className="w-full border-border bg-transparent text-foreground hover:bg-muted">
                <Calendar size={18} />
                Schedule Call
              </Button>
              <Button variant="outline" className="w-full border-border bg-transparent text-foreground hover:bg-muted">
                Add Note
              </Button>
            </CardContent>
          </Card>

          {lead.nextAction && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Next Action</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="bg-primary/20 p-2 rounded-lg h-fit">
                    <TrendingUp size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recommended</p>
                    <p className="text-foreground font-medium">{lead.nextAction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent mt-1" />
                  <div>
                    <p className="text-foreground">Last Email</p>
                    <p className="text-xs text-muted-foreground">{lead.lastEmail}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
