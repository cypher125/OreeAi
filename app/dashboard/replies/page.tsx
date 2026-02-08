'use client'

import { useEffect, useState } from 'react'
import { getReplies, updateReplyStatus, Reply, ReplyStats } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { 
  Search, 
  Archive, 
  Flag, 
  MessageSquare, 
  SmilePlus, 
  AlertCircle, 
  CheckCircle2,
  MailOpen,
  Mail
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function RepliesPage() {
  const [replies, setReplies] = useState<Reply[]>([])
  const [stats, setStats] = useState<ReplyStats | undefined>(undefined)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [perPage] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadReplies = async () => {
    setLoading(true)
    try {
      const data = await getReplies({
        status: statusFilter,
        search,
        page,
        perPage
      })
      setReplies(data.items)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load replies:', error)
      toast({
        title: 'Error',
        description: 'Failed to load replies. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReplies()
  }, [statusFilter, search, page, perPage])

  const handleStatusUpdate = async (replyId: string, newStatus: string) => {
    // Optimistic update
    setReplies(replies.map(r => 
      r.id === replyId ? { ...r, status: newStatus as any } : r
    ))

    const success = await updateReplyStatus(replyId, { status: newStatus })
    
    if (success) {
      toast({
        title: 'Status Updated',
        description: `Reply marked as ${newStatus}.`,
      })
      // Reload to update stats
      loadReplies()
    } else {
      // Revert on failure
      loadReplies()
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      })
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <SmilePlus className="h-5 w-5 text-green-500" />
      case 'negative':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <MessageSquare className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'negative':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Replies</h1>
          <p className="text-muted-foreground">Monitor and manage incoming email responses</p>
        </div>
        <div className="flex gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{stats?.unread ?? 0}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">{stats?.total ?? total}</div>
              <p className="text-sm text-muted-foreground">Total Replies</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats?.unread ?? 0}</div>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">{stats?.positive ?? 0}</div>
              <p className="text-sm text-muted-foreground">Positive Responses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or message..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10 bg-secondary text-foreground border-border"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'unread', 'read', 'archived'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  className={statusFilter === status ? 'bg-primary text-primary-foreground' : 'border-border text-foreground'}
                  onClick={() => {
                    setStatusFilter(status)
                    setPage(1)
                  }}
                >
                  {status === 'unread' && <CheckCircle2 size={16} className="mr-2" />}
                  {status === 'read' && <MailOpen size={16} className="mr-2" />}
                  {status === 'archived' && <Archive size={16} className="mr-2" />}
                  <span className="capitalize">{status}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Email Responses ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading replies...</div>
          ) : replies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No replies found</div>
          ) : (
            <div className="space-y-2">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded-lg transition-all border ${
                    reply.status === 'unread'
                      ? 'bg-primary/5 border-primary/20 shadow-sm'
                      : 'bg-secondary/50 border-transparent hover:border-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Sentiment Icon */}
                    <div className="mt-1 flex-shrink-0" title={`Sentiment: ${reply.sentiment}`}>
                      {getSentimentIcon(reply.sentiment)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{reply.leadName}</h3>
                        <p className="text-sm text-muted-foreground hidden sm:block">&bull;</p>
                        <p className="text-sm text-muted-foreground">{reply.leadEmail}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getSentimentColor(reply.sentiment)}`}>
                          {reply.sentiment.charAt(0).toUpperCase() + reply.sentiment.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{reply.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{reply.preview}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(reply.timestamp).toLocaleString()}</span>
                        {reply.status === 'read' && <span>&bull; Read</span>}
                        {reply.status === 'archived' && <span>&bull; Archived</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      {reply.status === 'unread' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Mark as Read"
                          onClick={() => handleStatusUpdate(reply.id, 'read')}
                          className="text-muted-foreground hover:text-accent h-8 w-8"
                        >
                          <MailOpen size={16} />
                        </Button>
                      )}
                      {reply.status === 'read' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Mark as Unread"
                          onClick={() => handleStatusUpdate(reply.id, 'unread')}
                          className="text-muted-foreground hover:text-accent h-8 w-8"
                        >
                          <Mail size={16} />
                        </Button>
                      )}
                      {reply.status !== 'archived' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Archive"
                          onClick={() => handleStatusUpdate(reply.id, 'archived')}
                          className="text-muted-foreground hover:text-accent h-8 w-8"
                        >
                          <Archive size={16} />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Flag"
                        className="text-muted-foreground hover:text-red-500 h-8 w-8"
                      >
                        <Flag size={16} />
                      </Button>
                    </div>

                    {/* Unread Indicator */}
                    {reply.status === 'unread' && (
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" title="Unread" />
                    )}
                  </div>
                </div>
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
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {/* Simple pagination logic for now */}
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
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
