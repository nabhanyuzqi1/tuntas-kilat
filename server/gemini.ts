// Intelligent fallback chatbot system - no external API dependencies

export interface ChatbotResponse {
  message: string;
  quickReplies?: string[];
  bookingAction?: {
    type: 'view_services' | 'start_booking' | 'check_order';
    data?: any;
  };
}

export async function processCustomerMessage(message: string, context?: any): Promise<ChatbotResponse> {
  // Fallback chatbot dengan respons intelligence manual
  try {
    const messageLower = message.toLowerCase();
    
    // Greeting responses
    if (messageLower.includes('halo') || messageLower.includes('hi') || messageLower.includes('selamat')) {
      return {
        message: "Halo! Selamat datang di Tuntas Kilat! 👋\n\nSaya siap membantu Anda memesan layanan cuci kendaraan dan potong rumput. Mau pesan layanan apa hari ini?",
        quickReplies: ["🏍️ Cuci Motor", "🚗 Cuci Mobil", "🌿 Potong Rumput", "💰 Lihat Harga"]
      };
    }
    
    // Price inquiries
    if (messageLower.includes('harga') || messageLower.includes('tarif') || messageLower.includes('biaya')) {
      if (messageLower.includes('motor')) {
        return {
          message: "💰 Harga Cuci Motor:\n\n• Cuci Basic: Rp 15.000\n• Cuci Premium: Rp 20.000\n• Cuci Express: Rp 25.000\n\nSemua paket sudah termasuk:\n✅ Cuci body motor\n✅ Pembersihan velg\n✅ Pengeringan",
          quickReplies: ["📋 Pesan Sekarang", "🚗 Lihat Cuci Mobil", "🌿 Potong Rumput", "📞 Hubungi CS"],
          bookingAction: { type: "view_services", data: { category: "cuci_motor" } }
        };
      } else if (messageLower.includes('mobil')) {
        return {
          message: "💰 Harga Cuci Mobil:\n\n• Cuci Luar: Rp 35.000\n• Cuci Dalam-Luar: Rp 50.000\n• Cuci Premium: Rp 75.000\n\nLayanan premium termasuk:\n✅ Wax pelindung\n✅ Vacuum interior\n✅ Dashboard cleaning",
          quickReplies: ["📋 Pesan Sekarang", "🏍️ Lihat Cuci Motor", "🌿 Potong Rumput", "📞 Hubungi CS"],
          bookingAction: { type: "view_services", data: { category: "cuci_mobil" } }
        };
      } else if (messageLower.includes('rumput')) {
        return {
          message: "💰 Harga Potong Rumput:\n\n• Area kecil (< 100m²): Rp 50.000\n• Area sedang (100-300m²): Rp 100.000\n• Area besar (> 300m²): Rp 150.000\n\nSudah termasuk:\n✅ Pemotongan rumput\n✅ Pembersihan area\n✅ Pembuangan sampah",
          quickReplies: ["📋 Pesan Sekarang", "🏍️ Cuci Motor", "🚗 Cuci Mobil", "📞 Hubungi CS"],
          bookingAction: { type: "view_services", data: { category: "potong_rumput" } }
        };
      } else {
        return {
          message: "💰 Daftar Harga Lengkap:\n\n🏍️ Cuci Motor: Rp 15.000 - 25.000\n🚗 Cuci Mobil: Rp 35.000 - 75.000\n🌿 Potong Rumput: Rp 50.000 - 150.000\n\nSilakan pilih layanan untuk detail lengkap:",
          quickReplies: ["🏍️ Detail Cuci Motor", "🚗 Detail Cuci Mobil", "🌿 Detail Potong Rumput", "📋 Langsung Pesan"]
        };
      }
    }
    
    // Service booking requests
    if (messageLower.includes('pesan') || messageLower.includes('booking') || messageLower.includes('order')) {
      return {
        message: "📋 Siap membantu pemesanan!\n\nUntuk memesan layanan, saya perlu informasi:\n1. Jenis layanan yang diinginkan\n2. Alamat lokasi\n3. Waktu yang diinginkan\n\nPilih layanan yang Anda butuhkan:",
        quickReplies: ["🏍️ Cuci Motor", "🚗 Cuci Mobil", "🌿 Potong Rumput", "📞 Hubungi WhatsApp"],
        bookingAction: { type: "start_booking" }
      };
    }
    
    // Motor wash
    if (messageLower.includes('motor') && (messageLower.includes('cuci') || messageLower.includes('wash'))) {
      return {
        message: "🏍️ Layanan Cuci Motor Tuntas Kilat\n\nPaket yang tersedia:\n• Basic (Rp 15.000) - Cuci standar\n• Premium (Rp 20.000) - + pembersihan detail\n• Express (Rp 25.000) - Cepat & maksimal\n\nSemua paket dikerjakan dengan peralatan profesional!",
        quickReplies: ["📋 Pesan Basic", "📋 Pesan Premium", "📋 Pesan Express", "💰 Lihat Harga Lain"],
        bookingAction: { type: "view_services", data: { category: "cuci_motor" } }
      };
    }
    
    // Car wash
    if (messageLower.includes('mobil') && (messageLower.includes('cuci') || messageLower.includes('wash'))) {
      return {
        message: "🚗 Layanan Cuci Mobil Tuntas Kilat\n\nPaket yang tersedia:\n• Cuci Luar (Rp 35.000) - Eksterior saja\n• Dalam-Luar (Rp 50.000) - Lengkap\n• Premium (Rp 75.000) - + wax & detailing\n\nHasil bersih maksimal dengan peralatan modern!",
        quickReplies: ["📋 Pesan Cuci Luar", "📋 Pesan Dalam-Luar", "📋 Pesan Premium", "💰 Lihat Harga Lain"],
        bookingAction: { type: "view_services", data: { category: "cuci_mobil" } }
      };
    }
    
    // Lawn mowing
    if (messageLower.includes('rumput') || messageLower.includes('potong') || messageLower.includes('taman')) {
      return {
        message: "🌿 Layanan Potong Rumput Tuntas Kilat\n\nTarif berdasarkan luas area:\n• Kecil < 100m² (Rp 50.000)\n• Sedang 100-300m² (Rp 100.000)\n• Besar > 300m² (Rp 150.000)\n\nSudah termasuk pembersihan dan pembuangan sampah!",
        quickReplies: ["📋 Area Kecil", "📋 Area Sedang", "📋 Area Besar", "📏 Ukur Area Dulu"],
        bookingAction: { type: "view_services", data: { category: "potong_rumput" } }
      };
    }
    
    // Contact/support
    if (messageLower.includes('kontak') || messageLower.includes('hubungi') || messageLower.includes('cs') || messageLower.includes('customer service')) {
      return {
        message: "📞 Hubungi Customer Service:\n\nWhatsApp: +62 822-5672-9812\nOperasional: 24/7\n\nAtau Anda bisa langsung pesan melalui chat ini untuk respons lebih cepat!",
        quickReplies: ["📱 Chat WhatsApp", "🏍️ Cuci Motor", "🚗 Cuci Mobil", "🌿 Potong Rumput"]
      };
    }
    
    // Default fallback
    return {
      message: "Terima kasih sudah menghubungi Tuntas Kilat! 😊\n\nSaya adalah asisten virtual yang siap membantu Anda memesan layanan:\n• Cuci Motor & Mobil\n• Potong Rumput\n\nAda yang bisa saya bantu hari ini?",
      quickReplies: ["🏍️ Cuci Motor", "🚗 Cuci Mobil", "🌿 Potong Rumput", "💰 Lihat Harga"]
    };
    
  } catch (error) {
    console.error("Error processing message:", error);
    return {
      message: "Halo! Saya Tuntas Kilat Assistant 👋\n\nMaaf ada kendala teknis, tapi saya tetap bisa membantu Anda memesan layanan cuci kendaraan dan potong rumput.\n\nSilakan pilih layanan yang dibutuhkan:",
      quickReplies: ["🏍️ Cuci Motor", "🚗 Cuci Mobil", "🌿 Potong Rumput", "📞 Hubungi CS"]
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