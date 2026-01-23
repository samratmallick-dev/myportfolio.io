import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Mail, Phone, Clock, Trash2, Eye } from 'lucide-react';
import { getAllMessages, deleteMessageById, markAsRead, getUnreadCount } from '@/store/contact.slice';
import { useAdminSocket } from '@/hooks/useSocket';

const AdminMessages = () => {
      const dispatch = useDispatch();
      const { messages, loading, unreadCount } = useSelector((state) => state.contact);
      const [processingId, setProcessingId] = useState(null);

      const handleNewMessage = useCallback((message) => {
            toast.success(`New message from ${message.name}`);
            dispatch(getAllMessages());
            dispatch(getUnreadCount());
      }, [dispatch]);

      useAdminSocket('newMessage', handleNewMessage);

      useEffect(() => {
            dispatch(getAllMessages());
            dispatch(getUnreadCount());
      }, [dispatch]);

      const handleDelete = async (id) => {
            if (processingId) return; 

            setProcessingId(id);
            try {
                  await dispatch(deleteMessageById(id)).unwrap();
                  toast.success('Message deleted successfully');
                  dispatch(getUnreadCount());
            } catch (err) {
                  console.error('Delete message error:', err);
                  toast.error(err || 'Failed to delete message');
            } finally {
                  setProcessingId(null);
            }
      };

      const handleMarkAsRead = async (id) => {
            if (processingId) return; // Prevent multiple simultaneous operations

            setProcessingId(id);
            try {
                  await dispatch(markAsRead(id)).unwrap();
                  toast.success('Message marked as read');
                  // Unread count is updated automatically in the reducer
            } catch (err) {
                  console.error('Mark as read error:', err);
                  toast.error(err || 'Failed to mark as read');
            } finally {
                  setProcessingId(null);
            }
      };

      const sortedMessages = [...(messages || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return (
            <Fragment>
                  <Card className="shadow-sm">
                        <CardHeader>
                              <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-semibold">Contact Messages</CardTitle>
                                    {unreadCount > 0 && (
                                          <Badge variant="destructive" className="ml-2">
                                                {unreadCount} unread
                                          </Badge>
                                    )}
                              </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                              {loading ? (
                                    <div className="space-y-4">
                                          <Skeleton className="h-20 w-full" />
                                          <Skeleton className="h-20 w-full" />
                                          <Skeleton className="h-20 w-full" />
                                    </div>
                              ) : sortedMessages.length > 0 ? (
                                    sortedMessages.map((m) => (
                                          <div
                                                key={m._id}
                                                className={`p-4 rounded-lg border transition-colors hover-lift ${m.status === 'unread' ? 'bg-background border-accent/30 hover:tech-glow' : 'card-gradient border-border'
                                                      }`}
                                          >
                                                <div className="flex items-start justify-between mb-3">
                                                      <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-lg">{m.name}</span>
                                                            {m.status === 'unread' && (
                                                                  <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                                                                        New
                                                                  </Badge>
                                                            )}
                                                      </div>
                                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(m.createdAt).toLocaleString()}
                                                      </div>
                                                </div>

                                                <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                                                      <a
                                                            href={`mailto:${m.email}`}
                                                            className="flex items-center gap-1 hover:text-primary transition-colors"
                                                      >
                                                            <Mail className="w-4 h-4 text-primary" />
                                                            {m.email}
                                                      </a>
                                                      {m.mobile && (
                                                            <a
                                                                  href={`tel:${m.mobile}`}
                                                                  className="flex items-center gap-1 hover:text-primary transition-colors"
                                                            >
                                                                  <Phone className="w-4 h-4 text-primary" />
                                                                  {m.mobile}
                                                            </a>
                                                      )}
                                                </div>

                                                <div className="text-sm leading-relaxed mb-4 p-3 rounded-md bg-sidebar/60">
                                                      {m.message}
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                      {m.status === 'unread' && (
                                                            <Button
                                                                  variant="outline"
                                                                  size="sm"
                                                                  onClick={() => handleMarkAsRead(m._id)}
                                                                  disabled={processingId === m._id || loading}
                                                                  className="flex items-center gap-1"
                                                            >
                                                                  <Eye className="w-3 h-3" />
                                                                  {processingId === m._id ? 'Marking...' : 'Mark as Read'}
                                                            </Button>
                                                      )}
                                                      <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(m._id)}
                                                            disabled={processingId === m._id || loading}
                                                            className="flex items-center gap-1"
                                                      >
                                                            <Trash2 className="w-3 h-3" />
                                                            {processingId === m._id ? 'Deleting...' : 'Delete'}
                                                      </Button>
                                                </div>
                                          </div>
                                    ))
                              ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                          <p className="text-lg font-medium mb-2">No messages yet</p>
                                          <p className="text-sm">Messages from your contact form will appear here.</p>
                                    </div>
                              )}
                        </CardContent>
                  </Card>
            </Fragment>
      );
};

export default AdminMessages;