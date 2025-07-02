import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatbotResponse {
  message: string;
  quickReplies?: string[];
  bookingAction?: {
    type: 'view_services' | 'start_booking' | 'check_order';
    data?: any;
  };
}

export async function processCustomerMessage(message: string, context?: any): Promise<ChatbotResponse> {
  try {
    const systemPrompt = `Anda adalah asisten virtual Tuntas Kilat, platform layanan cuci kendaraan dan potong rumput terpercaya.

IDENTITAS & KEPRIBADIAN:
- Nama: Tuntas Kilat Assistant
- Bahasa: Bahasa Indonesia yang ramah dan profesional
- Kepribadian: Helpful, cepat tanggap, dan customer-focused

LAYANAN YANG TERSEDIA:
1. Cuci Motor (Rp 15.000-25.000)
   - Cuci Basic: Rp 15.000
   - Cuci Premium: Rp 20.000  
   - Cuci Express: Rp 25.000

2. Cuci Mobil (Rp 35.000-75.000)
   - Cuci Luar: Rp 35.000
   - Cuci Dalam-Luar: Rp 50.000
   - Cuci Premium: Rp 75.000

3. Potong Rumput (Rp 50.000-150.000)
   - Area kecil (< 100m²): Rp 50.000
   - Area sedang (100-300m²): Rp 100.000
   - Area besar (> 300m²): Rp 150.000

FITUR UNGGULAN:
- Layanan 24/7
- Tracking real-time
- Garansi kualitas
- Pembayaran cashless
- Worker terverifikasi

CARA PEMESANAN:
1. Pilih layanan
2. Isi alamat dan detail
3. Konfirmasi pesanan
4. Tunggu worker datang

PANDUAN RESPONSE:
- Selalu sapa dengan ramah
- Berikan informasi yang akurat
- Tawarkan bantuan spesifik
- Sediakan quick replies untuk navigasi cepat
- Jika diminta booking, arahkan ke aplikasi

Respond with JSON format:
{
  "message": "your response text",
  "quickReplies": ["option1", "option2", "option3"],
  "bookingAction": {
    "type": "view_services" | "start_booking" | "check_order",
    "data": any
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            message: { type: "string" },
            quickReplies: {
              type: "array",
              items: { type: "string" }
            },
            bookingAction: {
              type: "object",
              properties: {
                type: { type: "string" },
                data: { type: "object" }
              }
            }
          },
          required: ["message"]
        }
      },
      contents: `Pesan dari customer: "${message}"${context ? `\nKontext: ${JSON.stringify(context)}` : ''}`
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: ChatbotResponse = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Error processing message:", error);
    return {
      message: "Maaf, ada gangguan teknis. Silakan coba lagi atau hubungi customer service kami.",
      quickReplies: ["🔄 Coba Lagi", "📞 Hubungi CS", "🏠 Menu Utama"]
    };
  }
}

export async function generateOrderSummary(orderData: any): Promise<string> {
  try {
    const prompt = `Buatkan ringkasan pesanan yang friendly dan profesional untuk customer berdasarkan data berikut:
    
    ${JSON.stringify(orderData, null, 2)}
    
    Format:
    📋 *Ringkasan Pesanan*
    
    Layanan: [nama layanan]
    Harga: [harga]
    Alamat: [alamat]
    Jadwal: [tanggal dan waktu]
    
    *Estimasi kedatangan worker: 15-30 menit*
    
    Tracking ID: [tracking_id]
    
    Terima kasih telah mempercayai Ambon Gercep! 🙏`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text || "Pesanan Anda telah dikonfirmasi!";
  } catch (error) {
    console.error("Error generating order summary:", error);
    return "Pesanan Anda telah dikonfirmasi! Silakan cek aplikasi untuk detail lengkap.";
  }
}

export async function analyzeCustomerSentiment(message: string): Promise<{rating: number, confidence: number}> {
  try {
    const systemPrompt = `Analisis sentiment pesan customer dalam skala 1-5:
    1 = Sangat negatif (komplain, marah)
    2 = Negatif (tidak puas)
    3 = Netral
    4 = Positif (puas)
    5 = Sangat positif (sangat puas, pujian)
    
    Berikan confidence 0-1 untuk tingkat keyakinan analisis.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rating: { type: "number" },
            confidence: { type: "number" }
          },
          required: ["rating", "confidence"]
        }
      },
      contents: message
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
  }
  
  return { rating: 3, confidence: 0.5 };
}