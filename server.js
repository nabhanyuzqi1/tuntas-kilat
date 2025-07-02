// Tuntas Kilat Production Server for Supabase Deployment
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory data for demo (replace with Supabase in production)
const users = new Map();
const services = [
  {
    id: 1,
    name: "Cuci Mobil Regular",
    description: "Pencucian mobil standar dengan sabun berkualitas",
    category: "cuci_mobil",
    basePrice: 35000,
    duration: 45,
    features: ["Cuci badan mobil", "Lap kering", "Pembersihan interior dasar"]
  },
  {
    id: 2,
    name: "Cuci Mobil Premium",
    description: "Pencucian mobil lengkap dengan wax dan detailing",
    category: "cuci_mobil",
    basePrice: 75000,
    duration: 90,
    features: ["Cuci badan mobil", "Lap kering", "Wax premium", "Detailing interior", "Pembersihan ban"]
  },
  {
    id: 3,
    name: "Cuci Motor",
    description: "Pencucian motor lengkap dengan perawatan rantai",
    category: "cuci_motor",
    basePrice: 20000,
    duration: 30,
    features: ["Cuci badan motor", "Lap kering", "Pembersihan rantai"]
  },
  {
    id: 4,
    name: "Potong Rumput",
    description: "Pemangkasan rumput dan perawatan taman",
    category: "potong_rumput", 
    basePrice: 50000,
    duration: 120,
    features: ["Potong rumput", "Bersihkan sampah", "Rapikan tepi"]
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'tuntas-kilat-api'
  });
});

// Landing page HTML
const landingPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tuntas Kilat - Layanan Cuci & Potong Rumput</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <div class="text-2xl font-bold text-blue-600">
                        <i class="fas fa-bolt mr-2"></i>Tuntas Kilat
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="loadServices()" class="text-gray-600 hover:text-blue-600">
                        <i class="fas fa-list mr-1"></i>Layanan
                    </button>
                    <button onclick="showAuth()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-user mr-1"></i>Masuk
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">
                    Layanan Cepat & Berkualitas
                </h1>
                <p class="text-xl md:text-2xl mb-8 text-blue-100">
                    Cuci mobil, cuci motor, dan potong rumput dengan hasil profesional
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="loadServices()" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                        <i class="fas fa-search mr-2"></i>Lihat Layanan
                    </button>
                    <button onclick="bookService()" class="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition">
                        <i class="fas fa-whatsapp mr-2"></i>Pesan via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
                <p class="text-gray-600">Pilih layanan yang sesuai dengan kebutuhan Anda</p>
            </div>
            <div id="services-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Services will be loaded here -->
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Mengapa Pilih Tuntas Kilat?</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center">
                    <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-clock text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Cepat & Efisien</h3>
                    <p class="text-gray-600">Layanan berkualitas dengan waktu pengerjaan yang tepat</p>
                </div>
                <div class="text-center">
                    <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-shield-alt text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Terpercaya</h3>
                    <p class="text-gray-600">Pekerja terlatih dan berpengalaman dengan hasil memuaskan</p>
                </div>
                <div class="text-center">
                    <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-money-bill-wave text-purple-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Harga Terjangkau</h3>
                    <p class="text-gray-600">Tarif kompetitif dengan kualitas premium</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Auth Modal -->
    <div id="authModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Masuk ke Akun</h3>
                    <button onclick="hideAuth()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="authForm" onsubmit="handleAuth(event)">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" id="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                        Masuk
                    </button>
                </form>
                <div class="mt-4 text-center">
                    <button onclick="showRegister()" class="text-blue-600 hover:underline">
                        Belum punya akun? Daftar di sini
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <div class="text-2xl font-bold mb-4">
                    <i class="fas fa-bolt mr-2"></i>Tuntas Kilat
                </div>
                <p class="text-gray-400">Layanan cuci dan potong rumput terpercaya</p>
                <div class="mt-4">
                    <span class="text-green-400">
                        <i class="fas fa-whatsapp mr-1"></i>WhatsApp: +62 822-5672-9812
                    </span>
                </div>
            </div>
        </div>
    </footer>

    <script>
        // Load services on page load
        document.addEventListener('DOMContentLoaded', loadServices);

        async function loadServices() {
            try {
                const response = await fetch('/api/services');
                const services = await response.json();
                
                const grid = document.getElementById('services-grid');
                grid.innerHTML = services.map(service => \`
                    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                        <div class="text-center">
                            <div class="text-3xl mb-4">
                                \${service.category === 'cuci_mobil' ? '🚗' : 
                                  service.category === 'cuci_motor' ? '🏍️' : '🌿'}
                            </div>
                            <h3 class="text-xl font-semibold mb-2">\${service.name}</h3>
                            <p class="text-gray-600 mb-4">\${service.description}</p>
                            <div class="text-2xl font-bold text-blue-600 mb-4">
                                Rp \${service.basePrice.toLocaleString()}
                            </div>
                            <ul class="text-sm text-gray-600 mb-6">
                                \${service.features.map(feature => \`<li>• \${feature}</li>\`).join('')}
                            </ul>
                            <button onclick="bookService('\${service.name}')" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
                                <i class="fas fa-whatsapp mr-1"></i>Pesan Sekarang
                            </button>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading services:', error);
            }
        }

        function bookService(serviceName = '') {
            const message = serviceName ? 
                \`Halo! Saya ingin memesan layanan \${serviceName}\` :
                'Halo! Saya ingin memesan layanan Tuntas Kilat';
            
            const phoneNumber = '+6282256729812';
            const whatsappUrl = \`https://wa.me/\${phoneNumber.replace('+', '')}?text=\${encodeURIComponent(message)}\`;
            window.open(whatsappUrl, '_blank');
        }

        function showAuth() {
            document.getElementById('authModal').classList.remove('hidden');
        }

        function hideAuth() {
            document.getElementById('authModal').classList.add('hidden');
        }

        function showRegister() {
            alert('Fitur registrasi akan segera tersedia!');
        }

        async function handleAuth(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ identifier: email, password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Login berhasil!');
                    hideAuth();
                } else {
                    alert('Login gagal: ' + result.error);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    </script>
</body>
</html>
`;

// Root endpoint - serve landing page
app.get('/', (req, res) => {
  res.send(landingPageHTML);
});

// Services API
app.get('/api/services', (req, res) => {
  res.json(services);
});

// Simple authentication for demo
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (users.has(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: Date.now().toString(),
    email,
    firstName,
    lastName,
    role: 'customer',
    createdAt: new Date()
  };

  users.set(email, { ...user, password });

  res.json({
    success: true,
    message: 'Registration successful',
    user
  });
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const userData = users.get(identifier);
  if (!userData || userData.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { password: _, ...user } = userData;

  res.json({
    success: true,
    message: 'Login successful',
    user,
    token: 'demo-token-' + Date.now()
  });
});

// Workers endpoint
app.get('/api/workers', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Ahmad Rizki",
      specializations: ["cuci_mobil", "cuci_motor"],
      availability: "available",
      rating: 4.8
    },
    {
      id: 2,
      name: "Budi Santoso", 
      specializations: ["potong_rumput"],
      availability: "busy",
      rating: 4.6
    }
  ]);
});

// Orders endpoint
app.get('/api/orders', (req, res) => {
  res.json([]);
});

app.post('/api/orders', (req, res) => {
  const order = {
    id: Date.now(),
    trackingId: 'TK-' + Date.now(),
    status: 'pending',
    createdAt: new Date(),
    ...req.body
  };

  res.json(order);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Tuntas Kilat Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});