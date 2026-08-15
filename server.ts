import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: "salgados_fritos" | "salgados_assados" | "combos" | "doces" | "bebidas";
  image: string;
  isAvailable: boolean;
  bluefocusSyncedAt: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cnpj?: string;
  password?: string;
  minDailyOrders?: number;
  minWeeklyOrders?: number;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    city: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  notes?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observation?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  type: "DELIVERY" | "TOTEM";
  clientName: string;
  clientPhone: string;
  deliveryAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "DINHEIRO" | "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO";
  changeForAmount?: number;
  pixQrCodeUrl?: string;
  status: "AGUARDANDO" | "PREPARANDO" | "PRONTO" | "CONCLUIDO" | "CANCELADO";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface StoreSettings {
  storeName: string;
  franchiseCode: string;
  logoUrl: string;
  phone: string;
  address: string;
  autoApproveClients: boolean;
  blueFocusApiUrl: string;
  blueFocusApiKey: string;
  blueFocusAutoSyncMinutes: number;
  paymentMethods: {
    id: string;
    name: string;
    type: "DINHEIRO" | "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO";
    active: boolean;
    instructions?: string;
  }[];
}

interface NotificationLog {
  id: string;
  orderId: string;
  clientName: string;
  clientPhone: string;
  channel: "WHATSAPP" | "SMS";
  message: string;
  sentAt: string;
  status: "DELIVERED" | "SENT";
}

// Default Seed Data for BALBEC
let products: Product[] = [
  {
    id: "p1",
    code: "BF-101",
    name: "Coxinha Cremosa de Frango com Catupiry",
    description: "Massa leve e dourada, recheada com peito de frango desfiado e autêntico Catupiry original.",
    price: 8.50,
    stock: 45,
    category: "salgados_fritos",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p2",
    code: "BF-102",
    name: "Kibe Recheado com Queijo e Hortelã",
    description: "Trigo selecionado temperado com hortelã fresca, recheado com queijo muçarela derretido.",
    price: 8.50,
    stock: 32,
    category: "salgados_fritos",
    image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p3",
    code: "BF-103",
    name: "Bolinha de Queijo com Ervas Finas",
    description: "Deliciosa bolinha crocanter recheada com mix de queijo muçarela, prato e orégano.",
    price: 7.50,
    stock: 60,
    category: "salgados_fritos",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p4",
    code: "BF-201",
    name: "Empada Gourmet de Palmito Rústico",
    description: "Massa podre artesanal que derrete na boca com creme rústico de palmito e azeitonas.",
    price: 9.90,
    stock: 20,
    category: "salgados_assados",
    image: "https://images.unsplash.com/photo-1621236378699-8597faf6a176?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p5",
    code: "BF-202",
    name: "Esfiha Aberta de Carne Temperada",
    description: "Massa leve e macia coberta com carne moída temperada no limão, tomate e temperos sírios.",
    price: 8.00,
    stock: 28,
    category: "salgados_assados",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p6",
    code: "BF-203",
    name: "Pão de Queijo Mineiro Artesanal",
    description: "Feito com polvilho artesanal e queijo meia cura legitimo da Canastra.",
    price: 5.50,
    stock: 50,
    category: "salgados_assados",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p7",
    code: "BF-301",
    name: "Copo Festa BALBEC (30 Minis Salgados Variados)",
    description: "Ideal para lanche rápido ou dividir: 30 minis variados (coxinha, kibe, bolinha de queijo).",
    price: 24.90,
    stock: 15,
    category: "combos",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p8",
    code: "BF-302",
    name: "Caixa Galera BALBEC (100 Minis + Refrigerante 2L)",
    description: "100 salgadinhos sortidos fresquinhos na caixa + Guaraná ou Coca-Cola 2L à sua escolha.",
    price: 79.90,
    stock: 10,
    category: "combos",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p9",
    code: "BF-401",
    name: "Churros Mini Recheados com Doce de Leite",
    description: "Copo com 10 minis churros polvilhados com açúcar e canela e recheio generoso de doce de leite.",
    price: 14.90,
    stock: 25,
    category: "doces",
    image: "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p10",
    code: "BF-501",
    name: "Guaraná Antarctica LATA 350ml",
    description: "Geladíssimo para acompanhar seu salgado favorito.",
    price: 6.50,
    stock: 80,
    category: "bebidas",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  },
  {
    id: "p11",
    code: "BF-502",
    name: "Suco Natural de Laranja 500ml",
    description: "Suco 100% natural espremido no dia sem adição de conservantes.",
    price: 9.00,
    stock: 30,
    category: "bebidas",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    bluefocusSyncedAt: new Date().toISOString()
  }
];

let clients: Client[] = [
  {
    id: "c1",
    name: "Balbec Cliente Teste LTDA",
    phone: "(34) 99999-8888",
    email: "teste@balbec.com.br",
    cnpj: "12.345.678/0001-99",
    password: "123",
    minDailyOrders: 5,
    minWeeklyOrders: 30,
    address: {
      street: "Av. Leopoldino de Oliveira",
      number: "1500",
      neighborhood: "Centro",
      city: "Uberaba"
    },
    status: "APPROVED",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "c2",
    name: "Lucas Mendes",
    phone: "(11) 97654-3210",
    email: "lucas.mendes@gmail.com",
    address: {
      street: "Rua Augusta",
      number: "450",
      neighborhood: "Consolação",
      city: "São Paulo"
    },
    status: "PENDING",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    notes: "Aguardando verificação do endereço para entrega."
  },
  {
    id: "c3",
    name: "Mariana Silva",
    phone: "(11) 91234-5678",
    email: "mariana.silva@hotmail.com",
    address: {
      street: "Rua Oscar Freire",
      number: "120",
      neighborhood: "Jardins",
      city: "São Paulo"
    },
    status: "APPROVED",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

let orders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "B-101",
    type: "DELIVERY",
    clientName: "Camilla Rodrigues",
    clientPhone: "(11) 98765-4321",
    deliveryAddress: "Av. Paulista, 1000 - Apt 42, Bela Vista",
    items: [
      { productId: "p1", productName: "Coxinha Cremosa de Frango com Catupiry", quantity: 3, unitPrice: 8.50, totalPrice: 25.50 },
      { productId: "p10", productName: "Guaraná Antarctica LATA 350ml", quantity: 2, unitPrice: 6.50, totalPrice: 13.00 }
    ],
    totalAmount: 38.50,
    paymentMethod: "PIX",
    pixQrCodeUrl: "00020126580014br.gov.bcb.pix0136balbec-pix-101520400005303986540538.50",
    status: "PREPARANDO",
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: "ord-2",
    orderNumber: "B-102",
    type: "TOTEM",
    clientName: "Cliente Totem #02",
    clientPhone: "(11) 90000-0002",
    items: [
      { productId: "p7", productName: "Copo Festa BALBEC (30 Minis Salgados)", quantity: 1, unitPrice: 24.90, totalPrice: 24.90 },
      { productId: "p9", productName: "Churros Mini Recheados com Doce de Leite", quantity: 1, unitPrice: 14.90, totalPrice: 14.90 }
    ],
    totalAmount: 39.80,
    paymentMethod: "DINHEIRO",
    changeForAmount: 50.00,
    status: "AGUARDANDO",
    createdAt: new Date(Date.now() - 120000).toISOString(),
    updatedAt: new Date(Date.now() - 120000).toISOString()
  }
];

let settings: StoreSettings = {
  storeName: "BALBEC - Unidade Matriz Centro",
  franchiseCode: "FRANQ-001-SP",
  logoUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=300&q=80",
  phone: "(11) 3333-4444",
  address: "Rua das Cozinhas, 120 - Centro, São Paulo/SP",
  autoApproveClients: false,
  blueFocusApiUrl: "https://api.bluefocus.com.br/v1/franquias/balbec",
  blueFocusApiKey: "bf_live_9a87d6f5e4c3b2a1",
  blueFocusAutoSyncMinutes: 15,
  paymentMethods: [
    { id: "pm1", name: "Pix (Instantâneo)", type: "PIX", active: true, instructions: "Chave Pix E-mail: pix@balbec.com.br" },
    { id: "pm2", name: "Dinheiro (Na Entrega/Balcão)", type: "DINHEIRO", active: true, instructions: "Informe o valor para troco se necessário." },
    { id: "pm3", name: "Cartão de Crédito", type: "CARTAO_CREDITO", active: true, instructions: "Maquininha levada ao entregador / Totem." },
    { id: "pm4", name: "Cartão de Débito", type: "CARTAO_DEBITO", active: true, instructions: "Maquininha no local." }
  ]
};

let notifications: NotificationLog[] = [
  {
    id: "notif-1",
    orderId: "ord-1",
    clientName: "Camilla Rodrigues",
    clientPhone: "(11) 98765-4321",
    channel: "WHATSAPP",
    message: "Olá Camilla! Seu pedido #B-101 na BALBEC foi recebido e já está [EM PREPARAÇÃO] na nossa cozinha! 🥐✨",
    sentAt: new Date(Date.now() - 600000).toISOString(),
    status: "DELIVERED"
  }
];

let orderCounter = 103;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "BALBEC API Service", version: "1.0.0" });
  });

  // BlueFocus API Proxy / Sync Endpoints
  app.get("/api/bluefocus/products", (req, res) => {
    res.json({
      success: true,
      source: "BlueFocus API Proxy",
      total: products.length,
      data: products
    });
  });

  app.post("/api/bluefocus/sync", (req, res) => {
    // Simulate updating bluefocusSyncedAt timestamp and refreshing stock
    const now = new Date().toISOString();
    products = products.map(p => ({
      ...p,
      bluefocusSyncedAt: now,
      // Random minor stock refresh simulation
      stock: Math.max(5, p.stock + Math.floor(Math.random() * 5) - 2)
    }));

    res.json({
      success: true,
      message: "Catálogo sincronizado com sucesso com a API BlueFocus!",
      syncedAt: now,
      productsCount: products.length
    });
  });

  app.post("/api/bluefocus/products", (req, res) => {
    const { name, description, price, stock, category, image, code } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Nome e Preço são obrigatórios." });
    }

    const newProd: Product = {
      id: "p" + (products.length + 1) + "_" + Date.now(),
      code: code || `BF-${Math.floor(100 + Math.random() * 900)}`,
      name,
      description: description || "",
      price: Number(price),
      stock: Number(stock) || 10,
      category: category || "salgados_fritos",
      image: image || "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
      isAvailable: true,
      bluefocusSyncedAt: new Date().toISOString()
    };

    products.push(newProd);
    res.status(201).json({ success: true, product: newProd });
  });

  app.patch("/api/bluefocus/products/:id/stock", (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    const prod = products.find(p => p.id === id);
    if (!prod) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    prod.stock = Number(stock);
    prod.bluefocusSyncedAt = new Date().toISOString();
    res.json({ success: true, product: prod });
  });

  // Client Management & Approval Queue
  app.get("/api/clients", (req, res) => {
    res.json({ success: true, data: clients });
  });

  app.post("/api/clients/login", (req, res) => {
    const { cnpj, password } = req.body;
    if (!cnpj || !password) {
      return res.status(400).json({ error: "CNPJ e Senha são obrigatórios para o login." });
    }

    const cleanCnpj = cnpj.replace(/\D/g, "");
    const client = clients.find(c => c.cnpj && c.cnpj.replace(/\D/g, "") === cleanCnpj && c.password === password);
    
    if (!client) {
      return res.status(401).json({ error: "CNPJ ou senha incorretos." });
    }

    res.json({ success: true, client });
  });

  app.post("/api/clients/register", (req, res) => {
    const { name, phone, email, cnpj, password, address, minDailyOrders, minWeeklyOrders } = req.body;
    if (!name || !phone || !cnpj || !password) {
      return res.status(400).json({ error: "Nome, Telefone, CNPJ e Senha são obrigatórios." });
    }

    // Check if client with CNPJ already exists
    const cleanCnpj = cnpj.replace(/\D/g, "");
    const existing = clients.find(c => c.cnpj && c.cnpj.replace(/\D/g, "") === cleanCnpj);
    if (existing) {
      // Update existing or return
      existing.name = name;
      existing.phone = phone;
      existing.email = email || existing.email;
      existing.password = password;
      if (address) existing.address = address;
      return res.json({ success: true, client: existing, message: "Dados atualizados com sucesso." });
    }

    const newClient: Client = {
      id: "c_" + Date.now(),
      name,
      phone,
      email: email || "",
      cnpj,
      password,
      minDailyOrders: Number(minDailyOrders) || 5,
      minWeeklyOrders: Number(minWeeklyOrders) || 30,
      address: address || { street: "", number: "", neighborhood: "", city: "Uberaba" },
      status: settings.autoApproveClients ? "APPROVED" : "PENDING",
      createdAt: new Date().toISOString()
    };

    clients.unshift(newClient);
    res.status(201).json({ success: true, client: newClient });
  });

  app.patch("/api/clients/:id/approval", (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const client = clients.find(c => c.id === id);
    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Status inválido." });
    }

    client.status = status;
    if (notes !== undefined) client.notes = notes;

    res.json({ success: true, client });
  });

  app.patch("/api/clients/:id/minimums", (req, res) => {
    const { id } = req.params;
    const { minDailyOrders, minWeeklyOrders } = req.body;

    const client = clients.find(c => c.id === id);
    if (!client) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    if (minDailyOrders !== undefined) client.minDailyOrders = Number(minDailyOrders);
    if (minWeeklyOrders !== undefined) client.minWeeklyOrders = Number(minWeeklyOrders);

    res.json({ success: true, client });
  });

  // Orders Management
  app.get("/api/orders", (req, res) => {
    res.json({ success: true, data: orders });
  });

  app.post("/api/orders", (req, res) => {
    const { type, clientName, clientPhone, deliveryAddress, items, paymentMethod, changeForAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "O pedido deve conter pelo menos um item." });
    }

    // Validate and reduce stock
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        if (prod.stock < item.quantity) {
          return res.status(400).json({
            error: `Estoque insuficiente para "${prod.name}". Disponível: ${prod.stock}, Solicitado: ${item.quantity}.`
          });
        }
      }
    }

    // Deduct stock
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock -= item.quantity;
      }
    }

    const totalAmount = items.reduce((sum: number, it: any) => sum + (it.totalPrice || it.unitPrice * it.quantity), 0);
    const orderNum = `B-${orderCounter++}`;

    const newOrder: Order = {
      id: "ord_" + Date.now(),
      orderNumber: orderNum,
      type: type || "DELIVERY",
      clientName: clientName || "Cliente BALBEC",
      clientPhone: clientPhone || "",
      deliveryAddress: deliveryAddress || "",
      items,
      totalAmount,
      paymentMethod: paymentMethod || "PIX",
      changeForAmount: changeForAmount ? Number(changeForAmount) : undefined,
      pixQrCodeUrl: paymentMethod === "PIX" ? `00020126580014br.gov.bcb.pix0136balbec-pix-${orderNum}5204000053039865405${totalAmount.toFixed(2)}` : undefined,
      status: "AGUARDANDO",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.unshift(newOrder);

    // Auto log notification
    const statusTextMap = {
      AGUARDANDO: "recebido e aguarda confirmação",
      PREPARANDO: "em preparação na cozinha",
      PRONTO: "pronto para retirada/envio",
      CONCLUIDO: "finalizado com sucesso",
      CANCELADO: "cancelado"
    };

    const notifMsg = `Olá ${newOrder.clientName}! Seu pedido #${newOrder.orderNumber} no valor de R$ ${totalAmount.toFixed(2)} foi registrado na BALBEC e está [${newOrder.status}]! 😋🥐`;
    notifications.unshift({
      id: "notif_" + Date.now(),
      orderId: newOrder.id,
      clientName: newOrder.clientName,
      clientPhone: newOrder.clientPhone,
      channel: "WHATSAPP",
      message: notifMsg,
      sentAt: new Date().toISOString(),
      status: "DELIVERED"
    });

    res.status(201).json({ success: true, order: newOrder });
  });

  app.patch("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (!["AGUARDANDO", "PREPARANDO", "PRONTO", "CONCLUIDO", "CANCELADO"].includes(status)) {
      return res.status(400).json({ error: "Status inválido." });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    const statusMsgMap: Record<string, string> = {
      AGUARDANDO: "está AGUARDANDO aprovação da cozinha.",
      PREPARANDO: "está EM PREPARAÇÃO na nossa cozinha! Salgados saindo quentinhos! 🔥🥐",
      PRONTO: order.type === "TOTEM" ? "está PRONTO PARA RETIRADA no balcão! Por favor venha retirar com a senha " + order.orderNumber : "está PRONTO e saiu para entrega! 🛵💨",
      CONCLUIDO: "foi ENTREGUE/CONCLUÍDO! Agradecemos a preferência pela BALBEC! ❤️",
      CANCELADO: "foi cancelado. Se tiver dúvidas, entre em contato conosco."
    };

    const notifMsg = `Olá ${order.clientName}! Seu pedido #${order.orderNumber} ${statusMsgMap[status]}`;
    notifications.unshift({
      id: "notif_" + Date.now(),
      orderId: order.id,
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      channel: "WHATSAPP",
      message: notifMsg,
      sentAt: new Date().toISOString(),
      status: "DELIVERED"
    });

    res.json({ success: true, order });
  });

  // Settings & Brand Logo
  app.get("/api/settings", (req, res) => {
    res.json({ success: true, data: settings });
  });

  app.post("/api/settings", (req, res) => {
    settings = { ...settings, ...req.body };
    res.json({ success: true, data: settings });
  });

  // Notifications Log
  app.get("/api/notifications", (req, res) => {
    res.json({ success: true, data: notifications });
  });

  // Vite Middleware integration for dev and static build for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BALBEC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
