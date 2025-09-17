// src\pages\NotificationsPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Clock, Calendar, Settings, Users, Check, X, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { AccountsApi } from "@/api/apis/accounts-api"
import { TeamsApi } from "@/api/apis/teams-api" // Assuming you have a teams API
import { Notification, UserSettings } from "@/api/models"
import { formatDistanceToNow, parseISO, format } from "date-fns"
import customAxios from "@/lib/customAxios"

// Define the TeamInvitation interface based on your serializer
interface TeamInvitation {
  id: number
  team: number
  team_name: string
  email: string
  invited_by: number
  invited_by_email: string
  user?: number
  user_email?: string
  status: 'pending' | 'accepted' | 'rejected'
  token: string
  created_at: string
  updated_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [processingInvitations, setProcessingInvitations] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchNotifications()
    fetchUserSettings()
    fetchUserInvitations()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const api = new AccountsApi(undefined, undefined, customAxios)
      const response = await api.accountsNotificationsList()
      setNotifications(response.data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch notifications")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserInvitations = async () => {
    try {
      const response = await customAxios.get('/teams/my-invitations/')
      setInvitations(response.data.filter((inv: TeamInvitation) => inv.status === 'pending'))
    } catch (err) {
      console.error("Failed to fetch invitations", err)
    }
  }

  const fetchUserSettings = async () => {
    try {
      const api = new AccountsApi(undefined, undefined, customAxios)
      const response = await api.accountsSettingsRead()
      setSettings(response.data)
    } catch (err) {
      console.error("Failed to fetch user settings", err)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const api = new AccountsApi(undefined, undefined, customAxios)
      await api.accountsNotificationsMarkAsReadUpdate(id.toString(), {
        is_read: true
      })
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ))
    } catch (err) {
      console.error("Failed to mark notification as read", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const api = new AccountsApi(undefined, undefined, customAxios)
      await api.accountsNotificationsMarkAllAsReadCreate()
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })))
    } catch (err) {
      console.error("Failed to mark all notifications as read", err)
    }
  }

  const handleInvitationResponse = async (invitationId: number, status: 'accepted' | 'rejected') => {
    setProcessingInvitations(prev => new Set(prev).add(invitationId))
    
    try {
      await customAxios.patch(`/teams/my-invitations/${invitationId}/`, { status })
      
      // Remove the invitation from the list since it's no longer pending
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      
      // Show success message (you might want to use a toast notification here)
      console.log(`Invitation ${status} successfully`)
      
    } catch (err) {
      console.error(`Failed to ${status} invitation`, err)
      // You might want to show an error toast here
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev)
        newSet.delete(invitationId)
        return newSet
      })
    }
  }

  const updateNotificationSettings = async (key: keyof UserSettings, value: boolean) => {
    if (!settings) return
    
    try {
      const updatedSettings = { ...settings, [key]: value }
      const api = new AccountsApi(undefined, undefined, customAxios)
      await api.accountsSettingsUpdate(updatedSettings)
      setSettings(updatedSettings)
    } catch (err) {
      console.error("Failed to update notification settings", err)
    }
  }

  const formatNotificationTime = (dateString: string | undefined) => {
    if (!dateString) return ""
    const date = parseISO(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const formatNotificationDate = (dateString: string | undefined) => {
    if (!dateString) return ""
    const date = parseISO(dateString)
    return format(date, "MMM d")
  }

  if (loading) {
    return <div>Loading notifications...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  const totalNotifications = notifications.filter(n => !n.is_read).length + invitations.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Notifications
            {totalNotifications > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalNotifications}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Stay updated with task reminders, alerts, and team invitations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Notification Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notification Center</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Team Invitations */}
              {invitations.map((invitation) => (
                <div
                  key={`invitation-${invitation.id}`}
                  className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                        <Users className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Team Invitation</h4>
                          <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
                            Invitation
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          You've been invited to join <strong>{invitation.team_name}</strong> by {invitation.invited_by_email}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatNotificationTime(invitation.created_at)}
                          <span className="mx-1">•</span>
                          <Mail className="h-3 w-3 mr-1" />
                          {invitation.email}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleInvitationResponse(invitation.id, 'accepted')}
                            disabled={processingInvitations.has(invitation.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInvitationResponse(invitation.id, 'rejected')}
                            disabled={processingInvitations.has(invitation.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Regular Notifications */}
              {notifications.length === 0 && invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications available
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={`notification-${notification.id}`}
                    className={cn(
                      "p-4 rounded-lg border transition-colors cursor-pointer",
                      notification.is_read
                        ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                    )}
                    onClick={() => markAsRead(notification.id as number)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                            notification.is_read ? "bg-gray-100 dark:bg-gray-800" : "bg-blue-100 dark:bg-blue-900",
                          )}
                        >
                          <Bell
                            className={cn(
                              "h-4 w-4",
                              notification.is_read ? "text-gray-500 dark:text-gray-400" : "text-blue-600 dark:text-blue-300",
                            )}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">Notification</h4>
                            {!notification.is_read && (
                              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatNotificationTime(notification.created_at)}
                            <span className="mx-1">•</span>
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatNotificationDate(notification.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={settings?.email_notifications || false}
                    onCheckedChange={(checked) => updateNotificationSettings('email_notifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                  </div>
                  <Switch 
                    id="in-app-notifications" 
                    checked={settings?.in_app_notifications || false}
                    onCheckedChange={(checked) => updateNotificationSettings('in_app_notifications', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}