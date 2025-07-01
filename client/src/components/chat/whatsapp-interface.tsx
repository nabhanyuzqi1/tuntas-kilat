import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Clock } from "lucide-react";

interface Message {
  id: string;
  sender: 'customer' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

export default function WhatsAppInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      content: 'Halo! Saya Gercep Assistant 👋\nMau cuci motor, mobil, atau potong rumput?',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: '2',
      sender: 'customer',
      content: 'Mau cuci motor dong',
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
    },
    {
      id: '3',
      sender: 'ai',
      content: 'Siap! Untuk cuci motor, kami punya paket:\n🏍️ Basic (Rp 25.000)\n🏍️ Premium (Rp 35.000)\n\nMau yang mana? Dan lokasi dimana?',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    },
    {
      id: '4',
      sender: 'customer',
      content: 'Basic aja. Lokasi Jl. Merdeka No 123',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    },
    {
      id: '5',
      sender: 'ai',
      content: 'Oke! Paket Basic Rp 25.000\n📍 Jl. Merdeka No 123\n\nMau dijadwalkan kapan?',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      quickReplies: ['Sekarang juga', 'Pilih waktu lain']
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');

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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: getAIResponse(message),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sekarang')) {
      return 'Perfect! Teknisi terdekat akan kami assign untuk Anda.\n\n✅ Pesanan dikonfirmasi\n🕐 Estimasi kedatangan: 30 menit\n💰 Total: Rp 25.000\n\nAnda akan mendapat notifikasi WhatsApp dengan detail teknisi. Terima kasih! 🙏';
    } else if (lowerMessage.includes('waktu lain')) {
      return 'Baik, silakan pilih waktu yang Anda inginkan:\n\n📅 Hari ini (13:00 - 17:00)\n📅 Besok (08:00 - 17:00)\n📅 Pilih tanggal lain\n\nKetik pilihan atau langsung tulis waktu yang diinginkan.';
    } else {
      return 'Maaf, bisa diperjelas? Atau pilih opsi yang tersedia di atas. Jika butuh bantuan, ketik "bantuan" 😊';
    }
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
                    </div>
                  </div>
                </div>

                {/* Quick Replies */}
                {message.quickReplies && (
                  <div className="flex justify-start mt-2">
                    <div className="max-w-xs space-y-2">
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="block w-full text-left bg-white hover:bg-gray-50 text-primary border-primary"
                          onClick={() => handleSendMessage(reply)}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
