import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Clock, User, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface Message {
  id: string;
  sender: 'customer' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  bookingAction?: {
    type: 'view_services' | 'start_booking' | 'check_order';
    data?: any;
  };
  sentiment?: {
    rating: number;
    confidence: number;
  };
}

export default function WhatsAppInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      content: 'Halo! Saya Gercep Assistant 👋\nSaya bisa membantu Anda memesan layanan cuci kendaraan dan potong rumput.\n\nMau pesan layanan apa hari ini?',
      timestamp: new Date(),
      quickReplies: ['🏍️ Cuci Motor', '🚗 Cuci Mobil', '🌿 Potong Rumput', '💰 Lihat Harga']
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');

  // AI chatbot mutation
  const chatbotMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/chatbot/message', 'POST', {
        message,
        context: {
          messagesCount: messages.length,
          lastMessageTime: messages[messages.length - 1]?.timestamp
        }
      });
    },
    onSuccess: (response: any) => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response.message,
        timestamp: new Date(response.timestamp),
        quickReplies: response.quickReplies,
        bookingAction: response.bookingAction,
        sentiment: response.sentiment
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: 'Maaf, ada gangguan teknis. Silakan coba lagi atau hubungi customer service kami.',
        timestamp: new Date(),
        quickReplies: ['🔄 Coba Lagi', '📞 Hubungi CS']
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'customer',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Send message to AI backend
    chatbotMutation.mutate(message);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      {/* Header */}
      <div className="bg-[#128C7E] p-4 rounded-t-lg">
        <div className="flex items-center text-white">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <Bot className="w-6 h-6 text-[#128C7E]" />
          </div>
          <div>
            <h3 className="font-semibold">Gercep Assistant</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-xs opacity-75">Online • AI Bot</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <CardContent className="p-0">
        <ScrollArea className="h-96 bg-[#E5DDD5] p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 ${message.sender === 'customer' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    {message.sender === 'customer' && (
                      <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-xs rounded-lg p-3 shadow-sm ${
                        message.sender === 'customer'
                          ? 'bg-[#DCF8C6] chat-bubble-sent'
                          : 'bg-white chat-bubble-received'
                      }`}
                    >
                      <p className="text-sm text-gray-800 whitespace-pre-line">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender === 'customer' && (
                          <span className="text-xs text-gray-500">✓✓</span>
                        )}
                        {message.sentiment && message.sender === 'ai' && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            {message.sentiment.rating >= 4 ? '😊' : message.sentiment.rating <= 2 ? '😔' : '😐'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Replies */}
                {message.quickReplies && (
                  <div className="flex justify-start mt-2 ml-10">
                    <div className="max-w-xs space-y-1">
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="block w-full text-left bg-white hover:bg-gray-50 text-primary border-primary text-xs"
                          onClick={() => handleSendMessage(reply)}
                          disabled={chatbotMutation.isPending}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {chatbotMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-gray-600">Sedang mengetik...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="bg-white p-4 rounded-b-lg border-t">
          <div className="flex items-center space-x-3">
            <Input
              type="text"
              placeholder="Ketik pesan..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              className="flex-1 border-gray-300 rounded-full"
            />
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 rounded-full w-10 h-10 p-0"
              onClick={() => handleSendMessage(inputMessage)}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
