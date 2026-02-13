'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { getIcpSettings, updateIcpSettings, getTenantProfile, updateTenantProfile } from '@/lib/data'
import { Settings as SettingsIcon, Bell, Key, Zap, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  const [saved, setSaved] = useState(false)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companySaving, setCompanySaving] = useState(false)
  const [companySaved, setCompanySaved] = useState(false)
  const [companyError, setCompanyError] = useState('')
  const [companyLoaded, setCompanyLoaded] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: '',
    website: '',
    phone: ''
  })
  const [icpLoading, setIcpLoading] = useState(false)
  const [icpSaving, setIcpSaving] = useState(false)
  const [icpSaved, setIcpSaved] = useState(false)
  const [icpError, setIcpError] = useState('')
  const [icpLoaded, setIcpLoaded] = useState(false)
  const [icpForm, setIcpForm] = useState({
    personTitles: '',
    includeSimilarTitles: true,
    qKeywords: '',
    personLocations: '',
    personSeniorities: '',
    organizationLocations: '',
    organizationDomains: '',
    contactEmailStatus: '',
    organizationIds: '',
    organizationEmployeeRanges: '',
    organizationKeywordTags: '',
    revenueMin: '',
    revenueMax: '',
    technologiesAll: '',
    technologiesAny: '',
    technologiesNotAny: '',
    organizationJobTitles: '',
    organizationJobLocations: '',
    organizationJobsMin: '',
    organizationJobsMax: '',
    jobPostedMin: '',
    jobPostedMax: '',
    perPage: '',
    page: ''
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  useEffect(() => {
    if (activeTab !== 'account' || companyLoaded) return
    async function loadCompanyProfile() {
      setCompanyLoading(true)
      setCompanyError('')
      try {
        const data = await getTenantProfile()
        if (data) {
          setCompanyForm({
            name: data.company_name || '',
            industry: data.industry || '',
            website: data.website || '',
            phone: data.phone || ''
          })
        }
        setCompanyLoaded(true)
      } catch (error) {
        setCompanyError('Failed to load company information')
      } finally {
        setCompanyLoading(false)
      }
    }

    loadCompanyProfile()
  }, [activeTab, companyLoaded])

  const handleCompanySave = async () => {
    setCompanySaving(true)
    setCompanyError('')
    try {
      await updateTenantProfile({
        company_name: companyForm.name || undefined,
        industry: companyForm.industry || undefined,
        website: companyForm.website || undefined,
        phone: companyForm.phone || undefined
      })
      setCompanySaved(true)
      setTimeout(() => setCompanySaved(false), 2000)
    } catch (error) {
      setCompanyError('Failed to save company information')
    } finally {
      setCompanySaving(false)
    }
  }

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const parseEmployeeRanges = (value: string) => {
    const matches = value.match(/\d+\s*,\s*\d+/g)
    if (matches && matches.length) {
      return matches.map((item) => item.replace(/\s+/g, ''))
    }
    return parseList(value)
  }

  const formatEmployeeRanges = (value?: string[]) =>
    value && value.length ? value.join(' | ') : ''

  const listToText = (value?: string[]) => (value && value.length ? value.join(', ') : '')

  useEffect(() => {
    if (activeTab !== 'icp' || icpLoaded) return
    async function loadIcp() {
      setIcpLoading(true)
      setIcpError('')
      try {
        const data = await getIcpSettings()
        if (data) {
          setIcpForm({
            personTitles: listToText(data.person_titles),
            includeSimilarTitles: data.include_similar_titles ?? true,
            qKeywords: data.q_keywords ?? '',
            personLocations: listToText(data.person_locations),
            personSeniorities: listToText(data.person_seniorities),
            organizationLocations: listToText(data.organization_locations),
            organizationDomains: listToText(data.q_organization_domains_list),
            contactEmailStatus: listToText(data.contact_email_status),
            organizationIds: listToText(data.organization_ids),
            organizationEmployeeRanges: formatEmployeeRanges(data.organization_num_employees_ranges),
            organizationKeywordTags: listToText(data.q_organization_keyword_tags),
            revenueMin: data.revenue_range_min?.toString() ?? '',
            revenueMax: data.revenue_range_max?.toString() ?? '',
            technologiesAll: listToText(data.currently_using_all_of_technology_uids),
            technologiesAny: listToText(data.currently_using_any_of_technology_uids),
            technologiesNotAny: listToText(data.currently_not_using_any_of_technology_uids),
            organizationJobTitles: listToText(data.q_organization_job_titles),
            organizationJobLocations: listToText(data.organization_job_locations),
            organizationJobsMin: data.organization_num_jobs_range_min?.toString() ?? '',
            organizationJobsMax: data.organization_num_jobs_range_max?.toString() ?? '',
            jobPostedMin: data.organization_job_posted_at_range_min ?? '',
            jobPostedMax: data.organization_job_posted_at_range_max ?? '',
            perPage: data.per_page?.toString() ?? '',
            page: data.page?.toString() ?? ''
          })
        }
        setIcpLoaded(true)
      } catch (error) {
        setIcpError('Failed to load ICP settings')
      } finally {
        setIcpLoading(false)
      }
    }

    loadIcp()
  }, [activeTab, icpLoaded])

  const handleIcpSave = async () => {
    setIcpSaving(true)
    setIcpError('')
    const payload = {
      person_titles: parseList(icpForm.personTitles),
      include_similar_titles: icpForm.includeSimilarTitles,
      q_keywords: icpForm.qKeywords.trim() || undefined,
      person_locations: parseList(icpForm.personLocations),
      person_seniorities: parseList(icpForm.personSeniorities),
      organization_locations: parseList(icpForm.organizationLocations),
      q_organization_domains_list: parseList(icpForm.organizationDomains),
      contact_email_status: parseList(icpForm.contactEmailStatus),
      organization_ids: parseList(icpForm.organizationIds),
      organization_num_employees_ranges: parseEmployeeRanges(icpForm.organizationEmployeeRanges),
      q_organization_keyword_tags: parseList(icpForm.organizationKeywordTags),
      revenue_range_min: icpForm.revenueMin ? Number(icpForm.revenueMin) : undefined,
      revenue_range_max: icpForm.revenueMax ? Number(icpForm.revenueMax) : undefined,
      currently_using_all_of_technology_uids: parseList(icpForm.technologiesAll),
      currently_using_any_of_technology_uids: parseList(icpForm.technologiesAny),
      currently_not_using_any_of_technology_uids: parseList(icpForm.technologiesNotAny),
      q_organization_job_titles: parseList(icpForm.organizationJobTitles),
      organization_job_locations: parseList(icpForm.organizationJobLocations),
      organization_num_jobs_range_min: icpForm.organizationJobsMin ? Number(icpForm.organizationJobsMin) : undefined,
      organization_num_jobs_range_max: icpForm.organizationJobsMax ? Number(icpForm.organizationJobsMax) : undefined,
      organization_job_posted_at_range_min: icpForm.jobPostedMin || undefined,
      organization_job_posted_at_range_max: icpForm.jobPostedMax || undefined,
      per_page: icpForm.perPage ? Number(icpForm.perPage) : undefined,
      page: icpForm.page ? Number(icpForm.page) : undefined
    }
    try {
      await updateIcpSettings(payload)
      setIcpSaved(true)
      setTimeout(() => setIcpSaved(false), 2000)
    } catch (error) {
      setIcpError('Failed to save ICP settings')
    } finally {
      setIcpSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'account', label: 'Account', icon: SettingsIcon },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'api', label: 'API Keys', icon: Key },
          { id: 'integrations', label: 'Integrations', icon: Zap },
          { id: 'icp', label: 'ICP', icon: Database },
          { id: 'security', label: 'Security', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    defaultValue={user?.name || ''}
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    defaultValue={user?.email || ''}
                    disabled
                    className="bg-secondary text-foreground border-border opacity-50"
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {saved ? 'Saved ✓' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Set up your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <Input
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your company name"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Industry
                  </label>
                  <Input
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Technology, Finance"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Website
                  </label>
                  <Input
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
              </div>
              {companyError && (
                <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-md">
                  {companyError}
                </div>
              )}
              <Button
                onClick={handleCompanySave}
                disabled={companyLoading || companySaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {companySaving ? 'Saving...' : companySaved ? 'Saved ✓' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'Email Replies', description: 'Get notified when you receive a reply' },
                { label: 'Lead Updates', description: 'Updates on lead status changes' },
                { label: 'Campaign Performance', description: 'Weekly campaign performance digest' },
                { label: 'System Alerts', description: 'Important system and account alerts' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure your API settings and endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  API Base URL
                </label>
                <Input
                  placeholder="https://api.example.com"
                  className="bg-secondary text-foreground border-border"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Leave empty to use mock data. When set, OreeAI will use real API calls.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  API Key
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••••••"
                  className="bg-secondary text-foreground border-border"
                />
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {saved ? 'Saved ✓' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Third-party Integrations</CardTitle>
              <CardDescription>Connect external services to OreeAI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Gmail', description: 'Connect your Gmail account for email sync', icon: '📧' },
                { name: 'Slack', description: 'Get notifications in Slack', icon: '💬' },
                { name: 'Salesforce', description: 'Sync with your Salesforce CRM', icon: '☁️' },
                { name: 'HubSpot', description: 'Integrate with HubSpot', icon: '🎯' }
              ].map(integration => (
                <div key={integration.name} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-border text-foreground bg-transparent">
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'icp' && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>ICP Configuration</CardTitle>
              <CardDescription>Define Apollo People Search filters for this tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Person Titles
                  </label>
                  <Textarea
                    value={icpForm.personTitles}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, personTitles: e.target.value }))}
                    placeholder="VP Sales, Director of Marketing, Head of Sales"
                    className="bg-secondary text-foreground border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Comma separated</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Include Similar Titles
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={icpForm.includeSimilarTitles}
                        onChange={(e) => setIcpForm(prev => ({ ...prev, includeSimilarTitles: e.target.checked }))}
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-sm text-muted-foreground">Expand matches to similar titles</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Keywords
                    </label>
                    <Input
                      value={icpForm.qKeywords}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, qKeywords: e.target.value }))}
                      placeholder="saas, software, technology"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Person Seniorities
                    </label>
                    <Textarea
                      value={icpForm.personSeniorities}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, personSeniorities: e.target.value }))}
                      placeholder="c_suite, vp, director"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Person Locations
                    </label>
                    <Textarea
                      value={icpForm.personLocations}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, personLocations: e.target.value }))}
                      placeholder="United States, Canada"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Locations
                  </label>
                  <Textarea
                    value={icpForm.organizationLocations}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, organizationLocations: e.target.value }))}
                    placeholder="United States, United Kingdom, Canada"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Domains
                  </label>
                  <Textarea
                    value={icpForm.organizationDomains}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, organizationDomains: e.target.value }))}
                    placeholder="apollo.io, microsoft.com"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization IDs
                  </label>
                  <Textarea
                    value={icpForm.organizationIds}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, organizationIds: e.target.value }))}
                    placeholder="5e66b6381e05b4008c8331b8"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Employee Ranges
                  </label>
                  <Textarea
                    value={icpForm.organizationEmployeeRanges}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, organizationEmployeeRanges: e.target.value }))}
                      placeholder="10,50 | 51,200 | 201,500"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Keyword Tags
                  </label>
                  <Textarea
                    value={icpForm.organizationKeywordTags}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, organizationKeywordTags: e.target.value }))}
                    placeholder="saas, software, technology"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Revenue Min
                    </label>
                    <Input
                      type="number"
                      value={icpForm.revenueMin}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, revenueMin: e.target.value }))}
                      placeholder="500000"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Revenue Max
                    </label>
                    <Input
                      type="number"
                      value={icpForm.revenueMax}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, revenueMax: e.target.value }))}
                      placeholder="1500000"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Technologies All
                  </label>
                  <Textarea
                    value={icpForm.technologiesAll}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, technologiesAll: e.target.value }))}
                    placeholder="salesforce, google_analytics"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Technologies Any
                  </label>
                  <Textarea
                    value={icpForm.technologiesAny}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, technologiesAny: e.target.value }))}
                    placeholder="wordpress_org, hubspot"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Technologies Excluded
                  </label>
                  <Textarea
                    value={icpForm.technologiesNotAny}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, technologiesNotAny: e.target.value }))}
                    placeholder="shopify, wix"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Job Titles
                  </label>
                  <Textarea
                    value={icpForm.organizationJobTitles}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, organizationJobTitles: e.target.value }))}
                    placeholder="sales manager, research analyst"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Job Locations
                  </label>
                  <Textarea
                    value={icpForm.organizationJobLocations}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, organizationJobLocations: e.target.value }))}
                    placeholder="atlanta, japan"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Jobs Min
                    </label>
                    <Input
                      type="number"
                      value={icpForm.organizationJobsMin}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, organizationJobsMin: e.target.value }))}
                      placeholder="50"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Jobs Max
                    </label>
                    <Input
                      type="number"
                      value={icpForm.organizationJobsMax}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, organizationJobsMax: e.target.value }))}
                      placeholder="500"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Jobs Posted After
                    </label>
                    <Input
                      type="date"
                      value={icpForm.jobPostedMin}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, jobPostedMin: e.target.value }))}
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Jobs Posted Before
                    </label>
                    <Input
                      type="date"
                      value={icpForm.jobPostedMax}
                      onChange={(e) => setIcpForm(prev => ({ ...prev, jobPostedMax: e.target.value }))}
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Status
                  </label>
                  <Textarea
                    value={icpForm.contactEmailStatus}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, contactEmailStatus: e.target.value }))}
                    placeholder="verified, unverified"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Per Page
                  </label>
                  <Input
                    type="number"
                    value={icpForm.perPage}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, perPage: e.target.value }))}
                    placeholder="10"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Page
                  </label>
                  <Input
                    type="number"
                    value={icpForm.page}
                    onChange={(e) => setIcpForm(prev => ({ ...prev, page: e.target.value }))}
                    placeholder="1"
                    className="bg-secondary text-foreground border-border"
                  />
                </div>
              </div>

              {icpError && (
                <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-md">
                  {icpError}
                </div>
              )}

              <Button
                onClick={handleIcpSave}
                disabled={icpSaving || icpLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {icpSaving ? 'Saving...' : icpSaved ? 'Saved ✓' : 'Save ICP'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-secondary text-foreground border-border"
                    />
                  </div>
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {saved ? 'Saved ✓' : 'Update Password'}
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <Database size={20} />
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" className="border-border text-foreground bg-transparent">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
