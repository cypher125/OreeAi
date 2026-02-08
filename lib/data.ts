// OreeAI Mock Data Layer
// This layer provides mock data when API is not configured
// and will use real API calls when environment variables are set

export interface Lead {
  id: string
  email: string
  name: string
  company: string
  status: string
  emailsSent: number
  lastEmail: string
  responseRate: number
  source?: string
  metadata?: unknown
  nextAction?: string
  notes?: string
}

export interface Company {
  id: string
  name: string
  industry: string
  size: number
  leads: number
  engagement: number
  status: 'active' | 'inactive'
  website?: string
  metadata?: unknown
  reasearch_status: boolean
}

export interface Reply {
  id: string
  leadId: string
  leadEmail: string
  leadName: string
  timestamp: string
  subject: string
  preview: string
  sentiment: 'positive' | 'neutral' | 'negative'
  status: 'unread' | 'read' | 'archived'
}

export interface ReplyStats {
  total: number
  unread: number
  positive: number
}

export interface RepliesResult extends PagedResult<Reply> {
  stats?: ReplyStats
}

export interface DashboardStats {
  totalLeads: number
  activeLeads: number
  companies: number
  responseRate: number
  totalEmails: number
  pendingReplies: number
  avgEngagement: number
  activeCampaigns: number
  last7DaysPerformance: number
}

export interface PagedResult<T> {
  items: T[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface IcpSettings {
  person_titles: string[]
  include_similar_titles: boolean
  q_keywords?: string
  person_locations: string[]
  person_seniorities: string[]
  organization_locations: string[]
  q_organization_domains_list: string[]
  contact_email_status: string[]
  organization_ids: string[]
  organization_num_employees_ranges: string[]
  q_organization_keyword_tags: string[]
  revenue_range_min?: number
  revenue_range_max?: number
  currently_using_all_of_technology_uids: string[]
  currently_using_any_of_technology_uids: string[]
  currently_not_using_any_of_technology_uids: string[]
  q_organization_job_titles: string[]
  organization_job_locations: string[]
  organization_num_jobs_range_min?: number
  organization_num_jobs_range_max?: number
  organization_job_posted_at_range_min?: string
  organization_job_posted_at_range_max?: string
  page?: number
  per_page?: number
}

async function apiFetch(path: string, init?: RequestInit) {
  const url = `/api${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(init?.headers || {})
  headers.set('Content-Type', 'application/json')
  if (!headers.has('Authorization') && typeof window !== 'undefined') {
    const token = localStorage.getItem('oree_token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }
  const res = await fetch(url, {
    ...init,
    headers
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}

async function safeApiFetch(path: string, init?: RequestInit) {
  const url = `/api${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(init?.headers || {})
  headers.set('Content-Type', 'application/json')
  if (!headers.has('Authorization') && typeof window !== 'undefined') {
    const token = localStorage.getItem('oree_token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }
  const res = await fetch(url, {
    ...init,
    headers
  })
  if (res.status === 404) {
    return null
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  if (res.status === 204) {
    return null
  }
  return res.json()
}

function parseJsonValue(value: unknown) {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function mapLead(raw: any): Lead {
  const emailsSent = raw.emails_sent ?? raw.emailsSent ?? 0
  const emailsReplied = raw.emails_replied ?? 0
  const responseRate = emailsSent > 0 ? Math.round((emailsReplied / emailsSent) * 100) : 0
  const fullName =
    raw.full_name ||
    [raw.first_name, raw.last_name].filter(Boolean).join(' ') ||
    raw.name ||
    raw.email ||
    'Unknown'
  const company = raw.company_name || raw.company_domain || raw.company || 'Unknown'
  const lastEmail = raw.last_email_sent_at
    ? new Date(raw.last_email_sent_at).toLocaleString()
    : raw.lastEmail || '—'
  const status = (raw.status || raw.sequence_status || '').toString().toLowerCase() || 'unknown'
  return {
    id: String(raw.id),
    email: raw.email || '',
    name: fullName,
    company,
    status,
    emailsSent,
    lastEmail,
    responseRate,
    source: raw.source || raw.external_id || '',
    metadata: parseJsonValue(raw.metadata),
    nextAction: raw.next_action || raw.nextAction,
    notes: raw.notes
  }
}

function getCompanyResearch(raw: any) {
  const metadata = parseJsonValue(raw.metadata)
  const apollo = (metadata as any)?.apollo_raw
  const organization = apollo?.organization || apollo?.company || apollo?.account
  return {
    apollo,
    organization
  }
}

function normalizeBool(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return false
  if (['true', '1', 'yes', 'y', 't'].includes(s)) return true
  if (['false', '0', 'no', 'n', 'f'].includes(s)) return false
  return false
}

function mapCompany(raw: any): Company {
  const statusValue = String(raw.status || '').toLowerCase()
  const status = statusValue.includes('inactive') ? 'inactive' : 'active'
  const { apollo, organization } = getCompanyResearch(raw)
  const size =
    raw.size_max ??
    raw.size_min ??
    raw.size ??
    raw.employee_count ??
    raw.employees ??
    raw.headcount ??
    organization?.estimated_num_employees ??
    organization?.employee_count ??
    organization?.size ??
    apollo?.organization?.estimated_num_employees ??
    0
  const rawDomain =
    raw.domain ||
    raw.website ||
    organization?.website_url ||
    organization?.website ||
    apollo?.organization?.website_url
  const website = rawDomain
    ? String(rawDomain).startsWith('http')
      ? rawDomain
      : `https://${rawDomain}`
    : undefined
  return {
    id: String(raw.id),
    name: raw.name || organization?.name || apollo?.organization?.name || 'Unknown',
    industry: raw.industry || organization?.industry || apollo?.organization?.industry || 'Unknown',
    size,
    leads: raw.leads ?? 0,
    engagement: raw.engagement ?? 0,
    status,
    website,
    metadata: parseJsonValue(raw.metadata),
    reasearch_status: normalizeBool(
      raw.reasearch_status ?? raw.research_status ?? raw.researchStatus
    )
  }
}

function normalizeKey(value?: unknown) {
  if (!value) return ''
  return String(value).trim().toLowerCase()
}

function getLeadResponseRate(raw: any) {
  const emailsSent = Number(raw.emails_sent ?? raw.emailsSent ?? 0)
  const emailsReplied = Number(raw.emails_replied ?? raw.emailsReplied ?? 0)
  if (!emailsSent) return 0
  return Math.round((emailsReplied / emailsSent) * 100)
}

function buildLeadIndex(leads: any[]) {
  const byId = new Map<string, any[]>()
  const byName = new Map<string, any[]>()
  const byDomain = new Map<string, any[]>()

  leads.forEach((lead) => {
    const companyId = normalizeKey(lead.company_id || lead.companyId || lead.company?.id)
    const companyName = normalizeKey(lead.company_name || lead.companyName || lead.company)
    const companyDomain = normalizeKey(lead.company_domain || lead.companyDomain || lead.domain)

    if (companyId) {
      const list = byId.get(companyId) || []
      list.push(lead)
      byId.set(companyId, list)
    }
    if (companyName) {
      const list = byName.get(companyName) || []
      list.push(lead)
      byName.set(companyName, list)
    }
    if (companyDomain) {
      const list = byDomain.get(companyDomain) || []
      list.push(lead)
      byDomain.set(companyDomain, list)
    }
  })

  return { byId, byName, byDomain }
}

function mapReply(raw: any): Reply {
  const leadId = String(raw.lead_id || raw.leadId || '')
  const firstName = raw.lead_first_name || ''
  const lastName = raw.lead_last_name || ''
  const leadName = [firstName, lastName].filter(Boolean).join(' ') || raw.lead_name || raw.leadName || (leadId ? `Lead ${leadId.slice(0, 8)}` : 'Unknown')
  
  return {
    id: String(raw.id),
    leadId,
    leadEmail: raw.lead_email || raw.leadEmail || '',
    leadName,
    timestamp: raw.created_at || raw.timestamp || '',
    subject: raw.email_subject || raw.subject || 'Reply',
    preview: raw.reply_snippet || raw.preview || raw.reply_content || '',
    sentiment: (raw.sentiment || 'neutral').toLowerCase(),
    status: (raw.status || 'unread').toLowerCase()
  }
}

// Mock Data
const mockLeads: Lead[] = [
  {
    id: '1',
    email: 'john@techcorp.com',
    name: 'John Smith',
    company: 'TechCorp',
    status: 'responded',
    emailsSent: 3,
    lastEmail: '2 hours ago',
    responseRate: 100,
    nextAction: 'Schedule meeting',
    notes: 'Interested in demo'
  },
  {
    id: '2',
    email: 'sarah@innovate.io',
    name: 'Sarah Johnson',
    company: 'Innovate Inc',
    status: 'active',
    emailsSent: 2,
    lastEmail: '1 day ago',
    responseRate: 0,
    nextAction: 'Follow-up email',
    notes: 'Viewed email twice'
  },
  {
    id: '3',
    email: 'mike@growth.com',
    name: 'Mike Chen',
    company: 'Growth Labs',
    status: 'active',
    emailsSent: 1,
    lastEmail: '3 days ago',
    responseRate: 0,
    nextAction: 'Send cold email'
  },
  {
    id: '4',
    email: 'emma@digital.co',
    name: 'Emma Wilson',
    company: 'Digital Solutions',
    status: 'responded',
    emailsSent: 4,
    lastEmail: '5 hours ago',
    responseRate: 75,
    nextAction: 'Close deal'
  },
  {
    id: '5',
    email: 'alex@future.ai',
    name: 'Alex Rodriguez',
    company: 'Future Systems',
    status: 'inactive',
    emailsSent: 5,
    lastEmail: '2 weeks ago',
    responseRate: 20,
    nextAction: 'Re-engage'
  },
  {
    id: '6',
    email: 'lisa@venture.io',
    name: 'Lisa Park',
    company: 'Venture Partners',
    status: 'active',
    emailsSent: 1,
    lastEmail: '4 hours ago',
    responseRate: 0,
    nextAction: 'Wait for response'
  },
  {
    id: '7',
    email: 'david@enterprise.com',
    name: 'David Kumar',
    company: 'Enterprise Corp',
    status: 'responded',
    emailsSent: 2,
    lastEmail: '30 mins ago',
    responseRate: 100,
    nextAction: 'Set meeting'
  },
  {
    id: '8',
    email: 'sophia@startup.co',
    name: 'Sophia Martinez',
    company: 'StartupHub',
    status: 'active',
    emailsSent: 3,
    lastEmail: '1 day ago',
    responseRate: 33,
    nextAction: 'Follow-up'
  }
]

const mockCompanies: Company[] = [
  { id: '1', name: 'TechCorp', industry: 'Software', size: 500, leads: 12, engagement: 78, status: 'active', website: 'techcorp.com' },
  { id: '2', name: 'Innovate Inc', industry: 'AI/ML', size: 150, leads: 8, engagement: 65, status: 'active' },
  { id: '3', name: 'Growth Labs', industry: 'Marketing', size: 75, leads: 5, engagement: 45, status: 'active' },
  { id: '4', name: 'Digital Solutions', industry: 'Consulting', size: 200, leads: 10, engagement: 82, status: 'active' },
  { id: '5', name: 'Future Systems', industry: 'Blockchain', size: 100, leads: 4, engagement: 30, status: 'inactive' },
  { id: '6', name: 'Venture Partners', industry: 'Finance', size: 250, leads: 15, engagement: 88, status: 'active' },
  { id: '7', name: 'Enterprise Corp', industry: 'Enterprise', size: 1000, leads: 20, engagement: 92, status: 'active' },
  { id: '8', name: 'StartupHub', industry: 'Startup Support', size: 50, leads: 6, engagement: 55, status: 'active' }
]

const mockReplies: Reply[] = [
  {
    id: '1',
    leadId: '1',
    leadEmail: 'john@techcorp.com',
    leadName: 'John Smith',
    timestamp: '2 hours ago',
    subject: 'Re: OreeAI Demo',
    preview: 'Looks interesting! I\'d like to schedule a demo for next week.',
    sentiment: 'positive',
    status: 'unread'
  },
  {
    id: '2',
    leadId: '4',
    leadEmail: 'emma@digital.co',
    leadName: 'Emma Wilson',
    timestamp: '5 hours ago',
    subject: 'Re: Partnership Opportunity',
    preview: 'Our team is very interested in exploring this further...',
    sentiment: 'positive',
    status: 'unread'
  },
  {
    id: '3',
    leadId: '7',
    leadEmail: 'david@enterprise.com',
    leadName: 'David Kumar',
    timestamp: '30 mins ago',
    subject: 'Re: OreeAI Integration',
    preview: 'When are you available for a call this week?',
    sentiment: 'positive',
    status: 'unread'
  },
  {
    id: '4',
    leadId: '2',
    leadEmail: 'sarah@innovate.io',
    leadName: 'Sarah Johnson',
    timestamp: '1 day ago',
    subject: 'Re: Email Outreach Tool',
    preview: 'Thanks for reaching out, but we\'re not interested at this time.',
    sentiment: 'neutral',
    status: 'read'
  },
  {
    id: '5',
    leadId: '8',
    leadEmail: 'sophia@startup.co',
    leadName: 'Sophia Martinez',
    timestamp: '2 days ago',
    subject: 'Re: Pricing Question',
    preview: 'Can you send over your pricing details?',
    sentiment: 'neutral',
    status: 'read'
  }
]

// Data fetching functions
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const data = await apiFetch('/client/stats')
    const allTime = data?.all_time || data?.allTime || {}
    const totalEmails = Number(data?.totalEmails ?? data?.total_emails ?? allTime.emails_sent ?? allTime.emailsSent ?? 0)
    const responseRate = Number(data?.responseRate ?? data?.response_rate ?? allTime.reply_rate ?? allTime.replyRate ?? 0)
    const avgEngagement = Number(data?.avgEngagement ?? data?.avg_engagement ?? allTime.open_rate ?? allTime.openRate ?? 0)
    const last7Days = data?.last_7_days ?? data?.last7Days ?? {}
    const last7DaysPerformance = Number(
      last7Days.reply_rate ?? last7Days.replyRate ?? last7Days.open_rate ?? last7Days.openRate ?? 0
    )
    const pendingReplies = Number(data?.pendingReplies ?? data?.pending_replies ?? allTime.replies ?? allTime.repliesCount ?? 0)
    const activeCampaigns = Number(data?.activeCampaigns ?? data?.active_campaigns ?? 0)
    const totalLeads = Number(data?.totalLeads ?? data?.total_leads ?? 0)
    const activeLeads = Number(data?.activeLeads ?? data?.active_leads ?? 0)
    const companies = Number(data?.companies ?? data?.totalCompanies ?? data?.total_companies ?? 0)
    if (totalLeads > 0 && companies > 0 && activeLeads >= 0) {
      return {
        totalLeads,
        activeLeads: activeLeads || totalLeads,
        companies,
        responseRate,
        totalEmails,
        pendingReplies,
        avgEngagement,
        activeCampaigns,
        last7DaysPerformance
      }
    }
    const [leadsData, companiesData] = await Promise.all([
      apiFetch('/leads?per_page=1'),
      apiFetch('/companies?per_page=1')
    ])
    const resolvedTotalLeads = Number(leadsData?.total ?? leadsData?.count ?? leadsData?.items?.length ?? 0)
    const resolvedCompanies = Number(companiesData?.total ?? companiesData?.count ?? companiesData?.items?.length ?? 0)
    return {
      totalLeads: totalLeads || resolvedTotalLeads,
      activeLeads: activeLeads || resolvedTotalLeads,
      companies: companies || resolvedCompanies,
      responseRate,
      totalEmails,
      pendingReplies,
      avgEngagement,
      activeCampaigns,
      last7DaysPerformance
    }
  } catch (error) {
    console.error('Failed to fetch from API, using mock data:', error)
  }

  // Fallback to mock data
  return {
    totalLeads: mockLeads.length,
    activeLeads: mockLeads.filter(l => l.status === 'active').length,
    companies: mockCompanies.length,
    responseRate: 58,
    totalEmails: mockLeads.reduce((sum, l) => sum + l.emailsSent, 0),
    pendingReplies: mockReplies.filter(r => r.status === 'unread').length,
    avgEngagement: 62,
    activeCampaigns: 0,
    last7DaysPerformance: 0
  }
}

export async function getLeads(filters?: { status?: string; search?: string; page?: number; perPage?: number }): Promise<PagedResult<Lead>> {
  const params = new URLSearchParams()
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status.toUpperCase())
  if (filters?.search) params.append('q', filters.search)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.perPage) params.append('per_page', String(filters.perPage))
  try {
    const data = await apiFetch(`/leads?${params.toString()}`)
    if (Array.isArray(data)) {
      const items = data.map(mapLead)
      return { items, page: 1, perPage: items.length, total: items.length, totalPages: 1 }
    }
    const items = (data.items || []).map(mapLead)
    return {
      items,
      page: data.page ?? 1,
      perPage: data.per_page ?? data.perPage ?? items.length,
      total: data.total ?? items.length,
      totalPages: data.total_pages ?? data.totalPages ?? 1
    }
  } catch (error) {
    console.error('Failed to fetch from API, using mock data:', error)
  }

  let filtered = mockLeads
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(l => l.status === filters.status)
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      l => l.email.toLowerCase().includes(search) ||
        l.name.toLowerCase().includes(search) ||
        l.company.toLowerCase().includes(search)
    )
  }
  if (filters?.page && filters?.perPage) {
    const start = (filters.page - 1) * filters.perPage
    const items = filtered.slice(start, start + filters.perPage)
    return {
      items,
      page: filters.page,
      perPage: filters.perPage,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / filters.perPage))
    }
  }
  return {
    items: filtered,
    page: 1,
    perPage: filtered.length,
    total: filtered.length,
    totalPages: 1
  }
}

export async function getCompanies(): Promise<Company[]> {
  try {
    const [companiesData, leadsData] = await Promise.all([
      apiFetch('/companies'),
      apiFetch('/leads?per_page=1000')
    ])
    const rawCompanies = Array.isArray(companiesData) ? companiesData : (companiesData.items || [])
    const rawLeads = Array.isArray(leadsData) ? leadsData : (leadsData.items || [])
    const leadIndex = buildLeadIndex(rawLeads)
    return rawCompanies.map((rawCompany) => {
      const mapped = mapCompany(rawCompany)
      const companyId = normalizeKey(rawCompany.id)
      const companyName = normalizeKey(rawCompany.name)
      const companyDomain = normalizeKey(rawCompany.domain || rawCompany.website)
      const matchedLeads =
        leadIndex.byId.get(companyId) ||
        leadIndex.byName.get(companyName) ||
        leadIndex.byDomain.get(companyDomain) ||
        []
      const leadsCount = matchedLeads.length
      const engagement =
        leadsCount > 0
          ? Math.round(matchedLeads.reduce((sum, lead) => sum + getLeadResponseRate(lead), 0) / leadsCount)
          : mapped.engagement
      return {
        ...mapped,
        leads: leadsCount || mapped.leads,
        engagement
      }
    })
  } catch (error) {
    console.error('Failed to fetch from API, using mock data:', error)
  }
  return mockCompanies
}

export async function getReplies(filters?: { status?: string; search?: string; page?: number; perPage?: number }): Promise<RepliesResult> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.perPage) params.append('limit', String(filters.perPage))
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
  if (filters?.search) params.append('search', filters.search)

  try {
    const data = await apiFetch(`/replies?${params.toString()}`)
    const items = (data.items || []).map(mapReply)
    
    return {
      items,
      page: data.currentPage ?? filters?.page ?? 1,
      perPage: filters?.perPage ?? 50,
      total: data.total ?? items.length,
      totalPages: data.totalPages ?? 1,
      stats: data.stats
    }
  } catch (error) {
    console.error('Failed to fetch from API, using mock data:', error)
  }

  let filtered = mockReplies
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(r => r.status === filters.status)
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      r =>
        r.leadName.toLowerCase().includes(search) ||
        r.leadEmail.toLowerCase().includes(search) ||
        r.preview.toLowerCase().includes(search)
    )
  }
  const fallbackPage = requestedPage
  const fallbackPerPage = requestedPerPage
  const start = (fallbackPage - 1) * fallbackPerPage
  const items = filtered.slice(start, start + fallbackPerPage)
  return {
    items,
    page: fallbackPage,
    perPage: fallbackPerPage,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / fallbackPerPage))
  }
}

export async function updateReplyStatus(id: string, updates: { status?: string; sentiment?: string }) {
  try {
    await apiFetch(`/replies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    return true
  } catch (error) {
    console.error('Failed to update reply status:', error)
    return false
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  try {
    const data = await apiFetch(`/leads/${id}`)
    return mapLead(data)
  } catch (error) {
    console.error('Failed to fetch from API, using mock data:', error)
  }
  return mockLeads.find(l => l.id === id) || null
}

export async function getCompany(id: string): Promise<Company | null> {
  try {
    const [companyData, leadsData] = await Promise.all([
      apiFetch(`/companies/${id}`),
      apiFetch('/leads?per_page=1000')
    ])
    const rawLeads = Array.isArray(leadsData) ? leadsData : (leadsData.items || [])
    const leadIndex = buildLeadIndex(rawLeads)
    const mapped = mapCompany(companyData)
    const companyId = normalizeKey(companyData.id)
    const companyName = normalizeKey(companyData.name)
    const companyDomain = normalizeKey(companyData.domain || companyData.website)
    const matchedLeads =
      leadIndex.byId.get(companyId) ||
      leadIndex.byName.get(companyName) ||
      leadIndex.byDomain.get(companyDomain) ||
      []
    const leadsCount = matchedLeads.length
    const engagement =
      leadsCount > 0
        ? Math.round(matchedLeads.reduce((sum, lead) => sum + getLeadResponseRate(lead), 0) / leadsCount)
        : mapped.engagement
    return {
      ...mapped,
      leads: leadsCount || mapped.leads,
      engagement
    }
  } catch (error) {
    console.error('Failed to fetch from API, using mock data:', error)
  }
  return mockCompanies.find(c => c.id === id) || null
}

export async function getIcpSettings(): Promise<IcpSettings | null> {
  try {
    const data = await safeApiFetch('/client/icp')
    return data
  } catch (error) {
    console.error('Failed to fetch ICP settings:', error)
  }
  return null
}

export async function updateIcpSettings(payload: IcpSettings): Promise<IcpSettings | null> {
  try {
    const data = await apiFetch('/client/icp', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    return data
  } catch (error) {
    console.error('Failed to update ICP settings:', error)
  }
  return null
}

export interface TenantProfile {
  id?: string
  name?: string
  email?: string
  company_name?: string
  industry?: string
  website?: string
  phone?: string
}

async function fetchTenantProfile() {
  const primary = await safeApiFetch('/client/profile')
  if (primary) return primary
  return await safeApiFetch('/client')
}

export async function getTenantProfile(): Promise<TenantProfile | null> {
  try {
    const data = await fetchTenantProfile()
    const record = data || {}
    return {
      id: record.id,
      name: record.name || record.company_name || record.company || record.companyName || record.organization_name,
      email: record.email,
      company_name: record.company_name || record.company || record.companyName || record.organization_name || record.name,
      industry: record.industry || record.company_industry || record.organization_industry,
      website: record.website || record.company_website || record.domain,
      phone: record.phone || record.phone_number || record.company_phone
    }
  } catch (error) {
    console.error('Failed to fetch tenant profile:', error)
  }
  return null
}

export async function updateTenantProfile(payload: TenantProfile): Promise<TenantProfile | null> {
  try {
    const body = {
      ...payload,
      name: payload.company_name || payload.name,
      company_name: payload.company_name || payload.name
    }
    const data = await apiFetch('/client', {
      method: 'PUT',
      body: JSON.stringify(body)
    })
    return data
  } catch (error) {
    console.error('Failed to update tenant profile:', error)
  }
  return null
}

export interface LeadCreatePayload {
  email: string
  source: string
  first_name?: string
  last_name?: string
  company_name?: string
  company_domain?: string
  job_title?: string
}

export interface CompanyCreatePayload {
  name: string
  domain?: string
  industry?: string
  size_min?: number
  size_max?: number
  location?: string
}

export async function addLead(payload: LeadCreatePayload) {
  const data = await apiFetch(`/leads`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return mapLead(data)
}

export async function addCompany(payload: CompanyCreatePayload) {
  const data = await apiFetch(`/companies`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return mapCompany(data)
}
