import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getAllMessagesAdmin, removeMessage, markAsRead, replyToMessageThunk } from '@/store/contact.slice';
import { toast } from 'sonner';
import { Mail, Phone, Clock, CheckCircle2, Circle, Reply, MessageSquare, Send } from 'lucide-react';

const AdminMessages = () => {
      const dispatch = useDispatch();
      const { messages, loading } = useSelector((state) => state.contact);
      const [replyDialogOpen, setReplyDialogOpen] = useState(false);
      const [selectedMessage, setSelectedMessage] = useState(null);
      const [replyText, setReplyText] = useState('');
      const [replyingTo, setReplyingTo] = useState(null);

      useEffect(() => {
            dispatch(getAllMessagesAdmin());
      }, [dispatch]);

      const handleDelete = async (id) => {
            if (!window.confirm('Are you sure you want to delete this message?')) return;
            
            try {
                  await dispatch(removeMessage(id)).unwrap();
                  toast.success('Message deleted successfully');
            } catch (err) {
                  toast.error(err || 'Failed to delete message');
            }
      };

      const handleMarkAsRead = async (id, currentStatus) => {
            if (currentStatus === 'read') return;
            
            try {
                  await dispatch(markAsRead(id)).unwrap();
                  toast.success('Message marked as read');
            } catch (err) {
                  toast.error(err || 'Failed to mark as read');
            }
      };

      const handleReply = (message) => {
            setSelectedMessage(message);
            setReplyText('');
            setReplyingTo(message.email);
            setReplyDialogOpen(true);
      };

      const handleSendReply = async () => {
            if (!replyText.trim() || !selectedMessage) {
                  toast.error('Please enter a reply message');
                  return;
            }

            try {
                  await dispatch(replyToMessageThunk({ 
                        messageId: selectedMessage._id, 
                        replyData: { 
                              replyMessage: replyText, 
                              repliedBy: 'Admin' 
                        } 
                  })).unwrap();
                  
                  toast.success('Reply sent successfully');
                  setReplyDialogOpen(false);
                  setReplyText('');
                  setSelectedMessage(null);
                  setReplyingTo(null);
            } catch (err) {
                  toast.error(err || 'Failed to send reply');
            }
      };

      const sortedMessages = [...(messages || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const getStatusBadge = (status) => {
            const variants = {
                  unread: 'destructive',
                  read: 'secondary',
                  replied: 'default'
            };
            return <Badge variant={variants[status] || 'secondary'} className={"text-white"}>{status}</Badge>;
      };

      return (
            <Fragment>
                  <Card className="shadow-sm">
                        <CardHeader>
                              <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-semibold">Contact Messages</CardTitle>
                                    <Badge variant="outline">{sortedMessages.length} Total</Badge>
                              </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                              {loading ? (
                                    <div className="space-y-4">
                                          <Skeleton className="h-32 w-full" />
                                          <Skeleton className="h-32 w-full" />
                                          <Skeleton className="h-32 w-full" />
                                    </div>
                              ) : sortedMessages.length > 0 ? (
                                    sortedMessages.map((m) => (
                                          <div
                                                key={m._id}
                                                className={`p-4 rounded-md border flex flex-col gap-3 transition-all ${
                                                      m.status === 'unread' ? 'bg-primary/5 border-primary/20' : ''
                                                }`}
                                          >
                                                <div className="flex items-start justify-between gap-2">
                                                      <div className="flex items-center gap-2">
                                                            {m.status === 'unread' ? (
                                                                  <Circle className="h-4 w-4 text-primary fill-primary" />
                                                            ) : (
                                                                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                            <span className="font-semibold text-lg">{m.name}</span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                            {getStatusBadge(m.status)}
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                  <Clock className="h-3 w-3" />
                                                                  {new Date(m.createdAt).toLocaleString()}
                                                            </span>
                                                      </div>
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                      <div className="flex items-center gap-1">
                                                            <Mail className="h-4 w-4" />
                                                            <a href={`mailto:${m.email}`} className="hover:text-primary">
                                                                  {m.email}
                                                            </a>
                                                      </div>
                                                      <div className="flex items-center gap-1">
                                                            <Phone className="h-4 w-4" />
                                                            <a href={`tel:${m.mobile}`} className="hover:text-primary">
                                                                  {m.mobile}
                                                            </a>
                                                      </div>
                                                </div>

                                                <div className="text-sm leading-relaxed p-3 bg-muted/50 rounded">
                                                      {m.message}
                                                </div>

                                                {m.replyMessage && (
                                                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                  <MessageSquare className="h-4 w-4 text-blue-600" />
                                                                  <span className="text-sm font-semibold text-blue-800">Admin Reply</span>
                                                                  <Badge variant="secondary" className="text-xs">
                                                                        {new Date(m.repliedAt).toLocaleString()}
                                                                  </Badge>
                                                            </div>
                                                            <div className="text-sm leading-relaxed text-blue-700">
                                                                  {m.replyMessage}
                                                            </div>
                                                            {m.repliedBy && (
                                                                  <div className="text-xs text-blue-600 mt-2">
                                                                        - {m.repliedBy}
                                                                  </div>
                                                            )}
                                                      </div>
                                                )}

                                                <div className="flex justify-end gap-2">
                                                      {m.status === 'unread' && (
                                                            <Button
                                                                  variant="outline"
                                                                  size="sm"
                                                                  onClick={() => handleMarkAsRead(m._id, m.status)}
                                                                  disabled={loading}
                                                            >
                                                                  Mark as Read
                                                            </Button>
                                                      )}
                                                      <Dialog open={replyDialogOpen && selectedMessage?._id === m._id} onOpenChange={(open) => {
                                                            if (!open) {
                                                                  setReplyDialogOpen(false);
                                                                  setSelectedMessage(null);
                                                                  setReplyText('');
                                                                  setReplyingTo(null);
                                                            }
                                                      }}>
                                                            <DialogTrigger asChild>
                                                                  <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleReply(m)}
                                                                        disabled={loading}
                                                                  >
                                                                        <Reply className="h-4 w-4 mr-1" />
                                                                        Reply
                                                                  </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                  <DialogHeader>
                                                                        <DialogTitle>Reply to Message</DialogTitle>
                                                                  </DialogHeader>
                                                                  <div className="space-y-4">
                                                                        <div>
                                                                          <Label className="text-sm font-medium">From</Label>
                                                                          <p className="text-sm text-muted-foreground">{selectedMessage?.name} ({selectedMessage?.email})</p>
                                                                        </div>
                                                                        <div>
                                                                          <Label className="text-sm font-medium">Original Message</Label>
                                                                          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-1">
                                                                                {selectedMessage?.message}
                                                                          </div>
                                                                        </div>
                                                                        <div>
                                                                          <Label htmlFor="reply" className="text-sm font-medium">Your Reply</Label>
                                                                          <Textarea
                                                                                id="reply"
                                                                                value={replyText}
                                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                                placeholder="Type your reply here..."
                                                                                className="mt-1"
                                                                                rows={4}
                                                                          />
                                                                        </div>
                                                                        <div className="flex justify-end gap-2">
                                                                          <Button
                                                                                variant="outline"
                                                                                onClick={() => setReplyDialogOpen(false)}
                                                                          >
                                                                                Cancel
                                                                          </Button>
                                                                          <Button
                                                                                onClick={handleSendReply}
                                                                                disabled={loading || !replyText.trim()}
                                                                                className={"hero-gradient text-muted"}
                                                                          >
                                                                                <Send className="h-4 w-4 mr-1" />
                                                                                Send Reply
                                                                          </Button>
                                                                        </div>
                                                                  </div>
                                                            </DialogContent>
                                                      </Dialog>
                                                      <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(m._id)}
                                                            disabled={loading}
                                                      >
                                                            Delete
                                                      </Button>
                                                </div>
                                          </div>
                                    ))
                              ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                          <p className="text-lg">No messages found.</p>
                                          <p className="text-sm mt-2">Messages from the contact form will appear here.</p>
                                    </div>
                              )}
                        </CardContent>
                  </Card>
            </Fragment>
      );
};

export default AdminMessages;
