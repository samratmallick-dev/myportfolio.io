import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Phone, Clock, Trash2, Eye, Reply, MessageSquare } from 'lucide-react';
import { getAllMessages, deleteMessageById, markAsRead, getUnreadCount, replyToMessageThunk } from '@/store/contact.slice';

const AdminMessages = () => {
      const dispatch = useDispatch();
      const { messages, loading, unreadCount } = useSelector((state) => state.contact);
      const [processingId, setProcessingId] = useState(null);
      const [replyModalOpen, setReplyModalOpen] = useState(false);
      const [selectedMessage, setSelectedMessage] = useState(null);
      const [replyText, setReplyText] = useState('');
      const [replySubmitting, setReplySubmitting] = useState(false);

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

      const handleReply = async (message) => {
            setSelectedMessage(message);
            setReplyText('');
            setReplyModalOpen(true);
      };

      const handleSendReply = async () => {
            if (!selectedMessage || !replyText.trim()) {
                  toast.error('Please enter a reply message');
                  return;
            }

            setReplySubmitting(true);
            try {
                  await dispatch(replyToMessageThunk({ 
                        messageId: selectedMessage._id, 
                        replyData: { replyMessage: replyText.trim() } 
                  })).unwrap();
                  
                  toast.success('Reply sent successfully');
                  setReplyModalOpen(false);
                  setSelectedMessage(null);
                  setReplyText('');
                  dispatch(getUnreadCount());
            } catch (err) {
                  console.error('Reply error:', err);
                  toast.error(err || 'Failed to send reply');
            } finally {
                  setReplySubmitting(false);
            }
      };

      const sortedMessages = [...(messages || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const getStatusBadge = (status) => {
            switch (status) {
                  case 'unread':
                        return <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">New</Badge>;
                  case 'read':
                        return <Badge variant="outline" className="text-xs">Read</Badge>;
                  case 'replied':
                        return <Badge variant="default" className="text-xs bg-green-500 text-white">Replied</Badge>;
                  default:
                        return null;
            }
      };

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
                                                            {getStatusBadge(m.status)}
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

                                                {m.replyMessage && (
                                                      <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                  <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Your Reply:</span>
                                                            </div>
                                                            <div className="text-sm leading-relaxed text-green-700 dark:text-green-300">
                                                                  {m.replyMessage}
                                                            </div>
                                                            <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                                                                  Replied on {new Date(m.repliedAt).toLocaleString()}
                                                            </div>
                                                      </div>
                                                )}

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
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReply(m)}
                                                            disabled={m.isReplied || processingId === m._id || loading}
                                                            className="flex items-center gap-1"
                                                      >
                                                            <Reply className="w-3 h-3" />
                                                            {m.isReplied ? 'Replied' : 'Reply'}
                                                      </Button>
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

                  {/* Reply Modal */}
                  <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                    <DialogTitle>Reply to Message</DialogTitle>
                              </DialogHeader>
                              
                              {selectedMessage && (
                                    <div className="space-y-4">
                                          <div className="p-3 rounded-md bg-sidebar/60">
                                                <div className="font-medium mb-2">Original Message from {selectedMessage.name}:</div>
                                                <div className="text-sm text-muted-foreground">
                                                      {selectedMessage.message}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-2">
                                                      Email: {selectedMessage.email}
                                                      {selectedMessage.mobile && ` • Phone: ${selectedMessage.mobile}`}
                                                </div>
                                          </div>
                                          
                                          <div className="space-y-2">
                                                <label htmlFor="reply" className="text-sm font-medium">
                                                      Your Reply:
                                                </label>
                                                <Textarea
                                                      id="reply"
                                                      placeholder="Type your reply here..."
                                                      value={replyText}
                                                      onChange={(e) => setReplyText(e.target.value)}
                                                      className="min-h-[120px]"
                                                      disabled={replySubmitting}
                                                />
                                          </div>
                                    </div>
                              )}
                              
                              <DialogFooter>
                                    <Button
                                          variant="outline"
                                          onClick={() => setReplyModalOpen(false)}
                                          disabled={replySubmitting}
                                    >
                                          Cancel
                                    </Button>
                                    <Button
                                          onClick={handleSendReply}
                                          disabled={replySubmitting || !replyText.trim()}
                                          className={"hero-gradient"}
                                    >
                                          {replySubmitting ? 'Sending...' : 'Send Reply'}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </Fragment>
      );
};

export default AdminMessages;