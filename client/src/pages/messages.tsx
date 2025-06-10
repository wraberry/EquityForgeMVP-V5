import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Users, Paperclip, Download, FileText, Image, X, Plus } from "lucide-react";
import type { Conversation, Message } from "@/lib/types";

export default function Messages() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedConversation],
    enabled: isAuthenticated && !!selectedConversation,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    if (!selectedConversation) return;
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ toUserId, content, file }: { toUserId: string; content: string; file?: File }) => {
      if (file) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('toUserId', toUserId);
        formData.append('content', content || 'File attachment');
        formData.append('file', file);
        formData.append('messageType', 'file');
        
        const response = await fetch('/api/messages/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        
        return response.json();
      } else {
        return await apiRequest("POST", "/api/messages", { toUserId, content, messageType: 'text' });
      }
    },
    onSuccess: () => {
      setNewMessage("");
      setSelectedFile(null);
      setUploadingFile(false);
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      setUploadingFile(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() || selectedFile) && selectedConversation) {
      if (selectedFile) {
        setUploadingFile(true);
      }
      sendMessageMutation.mutate({
        toUserId: selectedConversation,
        content: newMessage.trim() || '',
        file: selectedFile || undefined,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const selectedUser = conversations.find(conv => conv.user.id === selectedConversation)?.user;

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Connect with potential employers and collaborators
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {conversationsLoading ? (
                <div className="p-4">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start by applying to opportunities or posting jobs</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.user.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conversation.user.id ? 'bg-blue-50 border-r-2 border-primary' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.user.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage src={conversation.user.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {conversation.user.firstName?.[0]}{conversation.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.user.firstName} {conversation.user.lastName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.lastMessage.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedUser ? (
                  <>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedUser.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </>
                ) : (
                  "Select a conversation"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px]">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                      {messagesLoading ? (
                        <div className="text-center py-8">Loading messages...</div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-gray-600 py-8">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.fromUserId === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                                message.fromUserId === user?.id
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              {message.messageType === 'file' && message.attachmentUrl ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    {getFileIcon(message.attachmentName || '')}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {message.attachmentName}
                                      </p>
                                      {message.attachmentSize && (
                                        <p className={`text-xs ${
                                          message.fromUserId === user?.id ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                          {formatFileSize(message.attachmentSize)}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant={message.fromUserId === user?.id ? "secondary" : "outline"}
                                      asChild
                                    >
                                      <a
                                        href={message.attachmentUrl}
                                        download={message.attachmentName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Download className="w-3 h-3" />
                                      </a>
                                    </Button>
                                  </div>
                                  {message.content && message.content !== 'File attachment' && (
                                    <p className="text-sm">{message.content}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm">{message.content}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <p className={`text-xs ${
                                  message.fromUserId === user?.id ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {new Date(message.createdAt!).toLocaleTimeString()}
                                </p>
                                {!message.isRead && message.fromUserId !== user?.id && (
                                  <div className={`w-2 h-2 rounded-full ${
                                    message.fromUserId === user?.id ? 'bg-blue-200' : 'bg-blue-500'
                                  }`} />
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="space-y-3">
                    {/* File attachment preview */}
                    {selectedFile && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          {getFileIcon(selectedFile.name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeSelectedFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <div className="flex gap-2 flex-1">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
                          className="flex-1"
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={(!newMessage.trim() && !selectedFile) || sendMessageMutation.isPending || uploadingFile}
                        size="icon"
                      >
                        {uploadingFile ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
