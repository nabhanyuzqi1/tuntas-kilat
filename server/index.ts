import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";

// Production-safe logging function
function log(message: string, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

// Production-safe static file serving
function serveStaticFiles(app: express.Express) {
  // In production, built files should be in a public directory
  const publicPath = path.resolve(process.cwd(), "public");
  
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    log(`Serving static files from ${publicPath}`);
    
    // Catch-all handler for SPA routing
    app.get("*", (_req, res) => {
      const indexPath = path.join(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: "index.html not found" });
      }
    });
  } else {
    log(`Warning: Static files directory not found at ${publicPath}`);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Firebase App Hosting
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'tuntas-kilat-api'
  });
});

// Serve static files from public directory
const publicDir = path.resolve(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  log(`Serving static files from ${publicDir}`);
}

// Frontend routes - serve React app for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }

  // Check if index.html exists in public directory (built React app)
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // Fallback: serve inline HTML with service integration
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tuntas Kilat - Layanan Cepat & Terpercaya</title>
    <meta name="description" content="Platform layanan on-demand terpercaya untuk cuci mobil, cuci motor, dan potong rumput dengan booking mudah via WhatsApp">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .hero-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
    </style>
</head>
<body class="bg-gray-50">
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-indigo-600">Tuntas Kilat</h1>
                </div>
                <nav class="hidden md:flex space-x-8">
                    <a href="#services" class="text-gray-600 hover:text-indigo-600">Layanan</a>
                    <a href="#how-it-works" class="text-gray-600 hover:text-indigo-600">Cara Kerja</a>
                    <a href="#contact" class="text-gray-600 hover:text-indigo-600">Kontak</a>
                    <a href="/login" class="text-gray-600 hover:text-indigo-600">Dashboard</a>
                </nav>
                <div class="flex gap-2">
                    <button id="loginBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Masuk
                    </button>
                    <a href="/admin" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        Admin
                    </a>
                </div>
            </div>
        </div>
    </header>

    <section class="hero-bg text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">Layanan Cepat & Terpercaya</h1>
            <p class="text-xl md:text-2xl mb-8 text-white/90">Cuci mobil, cuci motor, dan potong rumput dengan booking mudah via WhatsApp</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button id="bookNowBtn" class="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                    Pesan Sekarang
                </button>
                <a href="https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20tahu%20lebih%20lanjut%20tentang%20layanan%20Tuntas%20Kilat" target="_blank" class="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors">
                    WhatsApp Langsung
                </a>
            </div>
        </div>
    </section>

    <section id="services" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
                <p class="text-xl text-gray-600">Pilih layanan yang Anda butuhkan</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8" id="servicesGrid">
                <div class="text-center text-gray-500">Memuat layanan...</div>
            </div>
        </div>
    </section>

    <section id="how-it-works" class="bg-gray-100 py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cara Kerjanya</h2>
            </div>
            <div class="grid md:grid-cols-4 gap-8">
                <div class="text-center">
                    <div class="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                    <h3 class="text-xl font-semibold mb-2">Pilih Layanan</h3>
                    <p class="text-gray-600">Pilih layanan yang Anda butuhkan dari daftar yang tersedia</p>
                </div>
                <div class="text-center">
                    <div class="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                    <h3 class="text-xl font-semibold mb-2">Booking Online</h3>
                    <p class="text-gray-600">Isi form booking atau hubungi via WhatsApp untuk jadwal</p>
                </div>
                <div class="text-center">
                    <div class="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                    <h3 class="text-xl font-semibold mb-2">Pekerja Datang</h3>
                    <p class="text-gray-600">Pekerja profesional akan datang sesuai jadwal yang dipilih</p>
                </div>
                <div class="text-center">
                    <div class="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                    <h3 class="text-xl font-semibold mb-2">Selesai</h3>
                    <p class="text-gray-600">Pembayaran mudah dan rating untuk kepuasan layanan</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Hubungi Kami</h2>
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold mb-4">WhatsApp</h3>
                    <a href="https://wa.me/6281234567890" class="text-green-600 text-lg hover:underline">+62 812-3456-7890</a>
                </div>
                <div>
                    <h3 class="text-xl font-semibold mb-4">Email</h3>
                    <a href="mailto:info@tuntaskilat.com" class="text-indigo-600 text-lg hover:underline">info@tuntaskilat.com</a>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 class="text-2xl font-bold mb-4">Tuntas Kilat</h3>
            <p class="text-gray-400 mb-4">Platform layanan on-demand terpercaya</p>
            <div class="flex justify-center gap-4 mb-4">
                <a href="/admin" class="text-gray-400 hover:text-white">Admin Dashboard</a>
                <a href="/worker" class="text-gray-400 hover:text-white">Worker Portal</a>
                <a href="/api/docs" class="text-gray-400 hover:text-white">API Docs</a>
            </div>
            <p class="text-gray-500">&copy; 2025 Tuntas Kilat. All rights reserved.</p>
        </div>
    </footer>

    <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-xl font-bold mb-4">Masuk ke Tuntas Kilat</h3>
                <div class="space-y-4">
                    <input type="email" id="emailInput" placeholder="Email" class="w-full p-3 border rounded-lg">
                    <input type="password" id="passwordInput" placeholder="Password" class="w-full p-3 border rounded-lg">
                    <button id="loginSubmit" class="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
                        Masuk
                    </button>
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Belum punya akun? <a href="/register" class="text-indigo-600 hover:underline">Daftar</a></p>
                    </div>
                </div>
                <button id="closeModal" class="mt-4 text-gray-500 hover:text-gray-700">Tutup</button>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.origin;
        
        async function loadServices() {
            try {
                const response = await fetch(\`\${API_BASE}/api/services\`);
                const services = await response.json();
                
                const servicesGrid = document.getElementById('servicesGrid');
                servicesGrid.innerHTML = '';
                
                services.forEach(service => {
                    const serviceCard = document.createElement('div');
                    serviceCard.className = 'bg-white rounded-lg shadow-md p-6 card-hover cursor-pointer';
                    serviceCard.innerHTML = \`
                        <div class="text-3xl mb-4">\${getServiceIcon(service.category)}</div>
                        <h3 class="text-xl font-semibold mb-2">\${service.name}</h3>
                        <p class="text-gray-600 mb-4">\${service.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-2xl font-bold text-indigo-600">Rp \${Number(service.basePrice).toLocaleString('id-ID')}</span>
                            <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700" onclick="bookService(\${service.id}, '\${service.name}')">
                                Pesan
                            </button>
                        </div>
                    \`;
                    servicesGrid.appendChild(serviceCard);
                });
            } catch (error) {
                console.error('Error loading services:', error);
                document.getElementById('servicesGrid').innerHTML = '<div class="col-span-3 text-center text-gray-500">Gagal memuat layanan. Silakan refresh halaman.</div>';
            }
        }
        
        function getServiceIcon(category) {
            switch(category) {
                case 'cuci_mobil': return '🚗';
                case 'cuci_motor': return '🏍️';
                case 'potong_rumput': return '🌱';
                default: return '⚡';
            }
        }
        
        function bookService(serviceId, serviceName) {
            const message = \`Halo, saya ingin memesan *\${serviceName}* (ID: \${serviceId}). Mohon info lebih lanjut tentang jadwal dan harga.\`;
            const whatsappUrl = \`https://wa.me/6281234567890?text=\${encodeURIComponent(message)}\`;
            window.open(whatsappUrl, '_blank');
        }
        
        // Modal functionality
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            document.getElementById('loginModal').classList.remove('hidden');
        });
        
        document.getElementById('closeModal')?.addEventListener('click', () => {
            document.getElementById('loginModal').classList.add('hidden');
        });
        
        document.getElementById('bookNowBtn')?.addEventListener('click', () => {
            document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Login functionality
        document.getElementById('loginSubmit')?.addEventListener('click', async () => {
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: email, password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    localStorage.setItem('token', result.token);
                    alert('Login successful!');
                    document.getElementById('loginModal').classList.add('hidden');
                    
                    // Redirect based on user role
                    if (result.user?.role === 'admin_umum' || result.user?.role === 'admin_perusahaan') {
                        window.location.href = '/admin';
                    } else if (result.user?.role === 'worker') {
                        window.location.href = '/worker';
                    } else {
                        window.location.href = '/profile';
                    }
                } else {
                    alert(result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });
        
        // Load services on page load
        document.addEventListener('DOMContentLoaded', loadServices);
    </script>
</body>
</html>`);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register API routes first, before any static file handling
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup development vs production static serving
  if (process.env.NODE_ENV === "development") {
    try {
      // Use dynamic import with a function to prevent esbuild from resolving at build time
      const viteModulePath = "./vite.ts";
      const importVite = new Function('path', 'return import(path)');
      const viteModule = await importVite(viteModulePath);
      await viteModule.setupVite(app, server);
    } catch (error) {
      log("Vite setup failed, falling back to static files: " + (error as Error).message);
      serveStaticFiles(app);
    }
  } else {
    // Use simple static file serving in production
    serveStaticFiles(app);
  }

  // Use port 80 for web access or 5000 for development
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
  });
})();
