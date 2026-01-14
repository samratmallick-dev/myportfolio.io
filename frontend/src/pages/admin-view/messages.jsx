import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Mail, Phone, Clock, Trash2, Eye } from 'lucide-react';
import { getAllMessages, deleteMessageById, markAsRead, getUnreadCount } from '@/store/contact.slice';

const AdminMessages = () => {
      const dispatch = useDispatch();
      const { messages, loading, unreadCount } = useSelector((state) => state.contact);

      useEffect(() => {
            dispatch(getAllMessages());
            dispatch(getUnreadCount());
      }, [dispatch]);

      const handleDelete = async (id) => {
            try {
                  await dispatch(deleteMessageById(id)).unwrap();
                  toast.success('Message deleted successfully');
                  dispatch(getUnreadCount());
            } catch (err) {
                  toast.error(err || 'Failed to delete message');
            }
      };

      const handleMarkAsRead = async (id) => {
            try {
                  await dispatch(markAsRead(id)).unwrap();
                  toast.success('Message marked as read');
                  dispatch(getUnreadCount());
            } catch (err) {
                  toast.error(err || 'Failed to mark as read');
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
                                                className={`p-4 rounded-lg border transition-colors ${
                                                      !m.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                                }`}
                                          >
                                                <div className="flex items-start justify-between mb-3">
                                                      <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-lg">{m.name}</span>
                                                            {!m.isRead && (
                                                                  <Badge variant="secondary" className="text-xs">
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
                                                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                                      >
                                                            <Mail className="w-4 h-4" />
                                                            {m.email}
                                                      </a>
                                                      {m.mobile && (
                                                            <a
                                                                  href={`tel:${m.mobile}`}
                                                                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                                            >
                                                                  <Phone className="w-4 h-4" />
                                                                  {m.mobile}
                                                            </a>
                                                      )}
                                                </div>

                                                <div className="text-sm leading-relaxed mb-4 p-3 bg-gray-50 rounded-md">
                                                      {m.message}
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                      {!m.isRead && (
                                                            <Button
                                                                  variant="outline"
                                                                  size="sm"
                                                                  onClick={() => handleMarkAsRead(m._id)}
                                                                  disabled={loading}
                                                                  className="flex items-center gap-1"
                                                            >
                                                                  <Eye className="w-3 h-3" />
                                                                  Mark as Read
                                                            </Button>
                                                      )}
                                                      <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(m._id)}
                                                            disabled={loading}
                                                            className="flex items-center gap-1"
                                                      >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
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