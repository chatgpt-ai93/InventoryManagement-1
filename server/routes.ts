import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { 
  insertUserSchema, insertCategorySchema, insertSupplierSchema, 
  insertProductSchema, insertCustomerSchema, insertSaleSchema,
  insertSaleItemSchema, insertStockMovementSchema, insertReturnSchema,
  insertPurchaseOrderSchema, insertPurchaseOrderItemSchema,
  type User, type CartItem
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access control
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Registration failed", error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", authenticateToken, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard metrics" });
    }
  });

  app.get("/api/dashboard/top-products", authenticateToken, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProducts = await storage.getTopProducts(limit);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get top products" });
    }
  });

  app.get("/api/dashboard/sales-data", authenticateToken, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const salesData = await storage.getSalesData(days);
      res.json(salesData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sales data" });
    }
  });

  // Category routes
  app.get("/api/categories", authenticateToken, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });

  app.post("/api/categories", authenticateToken, async (req, res) => {
    try {
      console.log("Category creation request body:", req.body);
      
      // Validate required fields
      if (!req.body.name || !req.body.slug) {
        return res.status(400).json({ 
          message: "Name and slug are required fields"
        });
      }
      
      const categoryData = insertCategorySchema.parse(req.body);
      console.log("Parsed category data:", categoryData);
      
      const category = await storage.createCategory(categoryData);
      console.log("Created category:", category);
      
      res.status(201).json(category);
    } catch (error) {
      console.error("Category creation error:", error);
      
      if (error.issues) {
        console.error("Validation errors:", error.issues);
        return res.status(400).json({ 
          message: "Validation failed", 
          error: error.message,
          details: error.issues
        });
      }
      
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          message: "Category with this name or slug already exists"
        });
      }
      
      res.status(500).json({ 
        message: "Failed to create category", 
        error: error.message
      });
    }
  });

  app.put("/api/categories/:id", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to update category", error: error.message });
    }
  });

  app.delete("/api/categories/:id", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", authenticateToken, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get suppliers" });
    }
  });

  app.post("/api/suppliers", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Failed to create supplier", error: error.message });
    }
  });

  app.put("/api/suppliers/:id", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, supplierData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Failed to update supplier", error: error.message });
    }
  });

  app.delete("/api/suppliers/:id", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Product routes
  app.get("/api/products", authenticateToken, async (req, res) => {
    try {
      const { search, category, supplier, stock_status } = req.query;
      let products = await storage.getAllProducts();

      if (search) {
        products = await storage.searchProducts(search as string);
      }

      if (category) {
        products = products.filter(p => p.categoryId === category);
      }

      if (supplier) {
        products = products.filter(p => p.supplierId === supplier);
      }

      if (stock_status === 'low') {
        products = products.filter(p => p.trackStock && p.quantity <= p.minStockLevel);
      } else if (stock_status === 'out') {
        products = products.filter(p => p.trackStock && p.quantity === 0);
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  app.get("/api/products/low-stock", authenticateToken, async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get low stock products" });
    }
  });

  app.get("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  app.get("/api/products/barcode/:barcode", authenticateToken, async (req, res) => {
    try {
      const product = await storage.getProductByBarcode(req.params.barcode);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  app.post("/api/products", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      console.log("Product creation request body:", req.body);
      const productData = insertProductSchema.parse(req.body);
      console.log("Parsed product data:", productData);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.log("Product creation error:", error);
      res.status(400).json({ message: "Failed to create product", error: error.message });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product", error: error.message });
    }
  });

  app.delete("/api/products/:id", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.post("/api/products/:id/adjust-stock", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { quantity, reason } = req.body;
      if (typeof quantity !== 'number') {
        return res.status(400).json({ message: "Quantity must be a number" });
      }

      const success = await storage.updateProductStock(
        req.params.id,
        quantity,
        'adjustment',
        reason,
        req.user.id
      );

      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Stock adjusted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to adjust stock" });
    }
  });

  // Customer routes
  app.get("/api/customers", authenticateToken, async (req, res) => {
    try {
      const { search } = req.query;
      let customers;
      
      if (search) {
        customers = await storage.searchCustomers(search as string);
      } else {
        customers = await storage.getAllCustomers();
      }

      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get customers" });
    }
  });

  app.post("/api/customers", authenticateToken, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to create customer", error: error.message });
    }
  });

  app.put("/api/customers/:id", authenticateToken, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to update customer", error: error.message });
    }
  });

  app.delete("/api/customers/:id", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Sales routes
  app.get("/api/sales", authenticateToken, async (req, res) => {
    try {
      const { start_date, end_date, customer_id } = req.query;
      let sales;

      if (start_date && end_date) {
        sales = await storage.getSalesByDateRange(new Date(start_date as string), new Date(end_date as string));
      } else if (customer_id) {
        sales = await storage.getSalesByCustomer(customer_id as string);
      } else {
        sales = await storage.getAllSales();
      }

      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sales" });
    }
  });

  app.get("/api/sales/:id", authenticateToken, async (req, res) => {
    try {
      const sale = await storage.getSale(req.params.id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sale" });
    }
  });

  app.post("/api/sales", authenticateToken, async (req, res) => {
    try {
      const { sale, items } = req.body;
      console.log("Sale creation request:", { sale, items });
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      const saleData = insertSaleSchema.parse({
        ...sale,
        invoiceNumber,
        userId: req.user.id,
      });
      console.log("Parsed sale data:", saleData);
      
      const saleItems = items.map((item: any) => insertSaleItemSchema.parse(item));
      console.log("Parsed sale items:", saleItems);
      
      const createdSale = await storage.createSale(saleData, saleItems);
      res.status(201).json(createdSale);
    } catch (error) {
      console.error("Sale creation error:", error);
      if (error.errors) {
        console.error("Validation errors:", error.errors);
      }
      res.status(400).json({ 
        message: "Failed to create sale", 
        error: error.message,
        details: error.errors || null 
      });
    }
  });

  // Stock movement routes
  app.get("/api/stock-movements", authenticateToken, async (req, res) => {
    try {
      const { product_id } = req.query;
      const movements = await storage.getStockMovements(product_id as string);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stock movements" });
    }
  });

  // Return routes
  app.get("/api/returns", authenticateToken, async (req, res) => {
    try {
      const returns = await storage.getReturns();
      res.json(returns);
    } catch (error) {
      res.status(500).json({ message: "Failed to get returns" });
    }
  });

  app.post("/api/returns", authenticateToken, async (req, res) => {
    try {
      const returnData = insertReturnSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const returnItem = await storage.createReturn(returnData);
      res.status(201).json(returnItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to create return", error: error.message });
    }
  });

  // Purchase order routes
  app.get("/api/purchase-orders", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const orders = await storage.getAllPurchaseOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get purchase orders" });
    }
  });

  app.post("/api/purchase-orders", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const { order, items } = req.body;
      
      const orderNumber = `PO-${Date.now()}`;
      const orderData = insertPurchaseOrderSchema.parse({
        ...order,
        orderNumber,
        userId: req.user.id,
      });
      
      const orderItems = items.map((item: any) => insertPurchaseOrderItemSchema.parse(item));
      
      const createdOrder = await storage.createPurchaseOrder(orderData, orderItems);
      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(400).json({ message: "Failed to create purchase order", error: error.message });
    }
  });

  app.post("/api/purchase-orders/:id/receive", authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
    try {
      const success = await storage.receivePurchaseOrder(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Purchase order not found or already received" });
      }
      res.json({ message: "Purchase order received successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to receive purchase order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
