import { 
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Supplier, type InsertSupplier,
  type Product, type InsertProduct, type ProductWithDetails,
  type Customer, type InsertCustomer,
  type Sale, type InsertSale, type SaleWithDetails,
  type SaleItem, type InsertSaleItem,
  type StockMovement, type InsertStockMovement,
  type Return, type InsertReturn,
  type PurchaseOrder, type InsertPurchaseOrder,
  type PurchaseOrderItem, type InsertPurchaseOrderItem,
  type DashboardMetrics
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Category methods
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;

  // Supplier methods
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
  getAllSuppliers(): Promise<Supplier[]>;

  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getAllProducts(): Promise<ProductWithDetails[]>;
  searchProducts(query: string): Promise<ProductWithDetails[]>;
  getLowStockProducts(): Promise<ProductWithDetails[]>;
  updateProductStock(id: string, quantity: number, movementType: string, reason?: string, userId?: string): Promise<boolean>;

  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  getAllCustomers(): Promise<Customer[]>;
  searchCustomers(query: string): Promise<Customer[]>;

  // Sale methods
  getSale(id: string): Promise<SaleWithDetails | undefined>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale>;
  getAllSales(): Promise<SaleWithDetails[]>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<SaleWithDetails[]>;
  getSalesByCustomer(customerId: string): Promise<SaleWithDetails[]>;

  // Stock movement methods
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  getStockMovements(productId?: string): Promise<StockMovement[]>;

  // Return methods
  createReturn(returnItem: InsertReturn): Promise<Return>;
  getReturns(): Promise<Return[]>;

  // Purchase order methods
  createPurchaseOrder(order: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  receivePurchaseOrder(id: string, userId: string): Promise<boolean>;

  // Dashboard methods
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getTopProducts(limit?: number): Promise<Array<{ product: Product; totalSold: number; revenue: number }>>;
  getSalesData(days: number): Promise<Array<{ date: string; sales: number; transactions: number }>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private products: Map<string, Product> = new Map();
  private customers: Map<string, Customer> = new Map();
  private sales: Map<string, Sale> = new Map();
  private saleItems: Map<string, SaleItem> = new Map();
  private stockMovements: Map<string, StockMovement> = new Map();
  private returns: Map<string, Return> = new Map();
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private purchaseOrderItems: Map<string, PurchaseOrderItem> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: await bcrypt.hash("admin123", 10),
      email: "admin@retailflow.com",
      fullName: "John Manager",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create categories
    const electronicsCategory: Category = {
      id: randomUUID(),
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and accessories",
      createdAt: new Date(),
    };
    this.categories.set(electronicsCategory.id, electronicsCategory);

    const accessoriesCategory: Category = {
      id: randomUUID(),
      name: "Accessories",
      slug: "accessories",
      description: "Device accessories and peripherals",
      createdAt: new Date(),
    };
    this.categories.set(accessoriesCategory.id, accessoriesCategory);

    const officeCategory: Category = {
      id: randomUUID(),
      name: "Office Supplies",
      slug: "office-supplies",
      description: "Office and workplace supplies",
      createdAt: new Date(),
    };
    this.categories.set(officeCategory.id, officeCategory);

    // Create suppliers
    const techSupplier: Supplier = {
      id: randomUUID(),
      name: "Tech Supplies Co.",
      contactPerson: "Sarah Wilson",
      email: "orders@techsupplies.com",
      phone: "+1-555-0123",
      address: "123 Tech Street",
      city: "San Francisco",
      country: "USA",
      createdAt: new Date(),
    };
    this.suppliers.set(techSupplier.id, techSupplier);

    const globalSupplier: Supplier = {
      id: randomUUID(),
      name: "Global Electronics",
      contactPerson: "Mike Chen",
      email: "mike@globalelectronics.com",
      phone: "+1-555-0456",
      address: "456 Global Ave",
      city: "Los Angeles",
      country: "USA",
      createdAt: new Date(),
    };
    this.suppliers.set(globalSupplier.id, globalSupplier);

    // Create products
    const products = [
      {
        name: "Wireless Headphones Pro",
        sku: "WH-001",
        barcode: "1234567890123",
        description: "Premium noise-canceling wireless headphones",
        categoryId: electronicsCategory.id,
        supplierId: techSupplier.id,
        costPrice: "35.00",
        sellingPrice: "50.00",
        quantity: 125,
        minStockLevel: 20,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      },
      {
        name: "Phone Case Pro",
        sku: "PC-002",
        barcode: "1234567890124",
        description: "Protective case with card holder",
        categoryId: accessoriesCategory.id,
        supplierId: globalSupplier.id,
        costPrice: "20.00",
        sellingPrice: "30.00",
        quantity: 85,
        minStockLevel: 15,
        imageUrl: "https://images.unsplash.com/photo-1601593346740-925612772716",
      },
      {
        name: "Steel Water Bottle",
        sku: "WB-003",
        barcode: "1234567890125",
        description: "Insulated stainless steel water bottle",
        categoryId: officeCategory.id,
        supplierId: techSupplier.id,
        costPrice: "12.00",
        sellingPrice: "20.00",
        quantity: 67,
        minStockLevel: 25,
        imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504",
      },
      {
        name: "Laptop Stand",
        sku: "LS-004",
        barcode: "1234567890126",
        description: "Adjustable laptop stand for ergonomic work",
        categoryId: officeCategory.id,
        supplierId: globalSupplier.id,
        costPrice: "18.00",
        sellingPrice: "30.00",
        quantity: 43,
        minStockLevel: 15,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
      },
      {
        name: "USB-C Cable",
        sku: "USB-001",
        barcode: "1234567890127",
        description: "Fast charging USB-C cable 3ft",
        categoryId: electronicsCategory.id,
        supplierId: techSupplier.id,
        costPrice: "8.00",
        sellingPrice: "15.00",
        quantity: 3,
        minStockLevel: 10,
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90",
      },
      {
        name: "Power Bank",
        sku: "PB-002",
        barcode: "1234567890128",
        description: "10000mAh portable power bank",
        categoryId: electronicsCategory.id,
        supplierId: globalSupplier.id,
        costPrice: "15.00",
        sellingPrice: "25.00",
        quantity: 7,
        minStockLevel: 15,
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90",
      },
    ];

    for (const productData of products) {
      const product: Product = {
        id: randomUUID(),
        ...productData,
        trackStock: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.products.set(product.id, product);
    }

    // Create customers
    const customers = [
      {
        name: "Sarah Johnson",
        email: "sarah@email.com",
        phone: "+1-555-0789",
        address: "789 Customer Lane",
        city: "New York",
        loyaltyPoints: 450,
        totalSpent: "4750.00",
      },
      {
        name: "Mike Chen",
        email: "mike@email.com",
        phone: "+1-555-0987",
        address: "987 Customer Ave",
        city: "Los Angeles",
        loyaltyPoints: 320,
        totalSpent: "3240.00",
      },
      {
        name: "Emma Wilson",
        email: "emma@email.com",
        phone: "+1-555-0654",
        address: "654 Customer Blvd",
        city: "Chicago",
        loyaltyPoints: 289,
        totalSpent: "2890.00",
      },
    ];

    for (const customerData of customers) {
      const customer: Customer = {
        id: randomUUID(),
        ...customerData,
        createdAt: new Date(),
      };
      this.customers.set(customer.id, customer);
    }

    // Create sample sales data
    const sampleSales = [
      {
        invoiceNumber: "INV-001247",
        customerId: Array.from(this.customers.values())[0].id,
        userId: adminUser.id,
        subtotal: "130.00",
        taxAmount: "11.05",
        discountAmount: "0.00",
        total: "141.05",
        paymentMethod: "card",
        status: "completed",
      },
    ];

    for (const saleData of sampleSales) {
      const sale: Sale = {
        id: randomUUID(),
        ...saleData,
        createdAt: new Date(),
      };
      this.sales.set(sale.id, sale);

      // Add sale items
      const headphones = Array.from(this.products.values()).find(p => p.sku === "WH-001");
      const phoneCase = Array.from(this.products.values()).find(p => p.sku === "PC-002");

      if (headphones) {
        const item1: SaleItem = {
          id: randomUUID(),
          saleId: sale.id,
          productId: headphones.id,
          quantity: 2,
          unitPrice: "50.00",
          totalPrice: "100.00",
        };
        this.saleItems.set(item1.id, item1);
      }

      if (phoneCase) {
        const item2: SaleItem = {
          id: randomUUID(),
          saleId: sale.id,
          productId: phoneCase.id,
          quantity: 1,
          unitPrice: "30.00",
          totalPrice: "30.00",
        };
        this.saleItems.set(item2.id, item2);
      }
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    if (userData.password) {
      updatedUser.password = await bcrypt.hash(userData.password, 10);
    }
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Category methods
  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  // Supplier methods
  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      ...insertSupplier,
      id,
      createdAt: new Date(),
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;

    const updatedSupplier = { ...supplier, ...supplierData };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.sku === sku);
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.barcode === barcode);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...productData, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getAllProducts(): Promise<ProductWithDetails[]> {
    const products = Array.from(this.products.values());
    return products.map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined,
      supplier: product.supplierId ? this.suppliers.get(product.supplierId) : undefined,
    }));
  }

  async searchProducts(query: string): Promise<ProductWithDetails[]> {
    const lowerQuery = query.toLowerCase();
    const products = await this.getAllProducts();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.sku.toLowerCase().includes(lowerQuery) ||
      (product.barcode && product.barcode.toLowerCase().includes(lowerQuery))
    );
  }

  async getLowStockProducts(): Promise<ProductWithDetails[]> {
    const products = await this.getAllProducts();
    return products.filter(product => 
      product.trackStock && product.quantity <= product.minStockLevel
    );
  }

  async updateProductStock(id: string, quantity: number, movementType: string, reason?: string, userId?: string): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;

    const updatedProduct = { 
      ...product, 
      quantity: product.quantity + quantity,
      updatedAt: new Date()
    };
    this.products.set(id, updatedProduct);

    // Create stock movement record
    if (userId) {
      const movement: StockMovement = {
        id: randomUUID(),
        productId: id,
        movementType,
        quantity,
        reason,
        userId,
        createdAt: new Date(),
      };
      this.stockMovements.set(movement.id, movement);
    }

    return true;
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updatedCustomer = { ...customer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase();
    const customers = await this.getAllCustomers();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery)) ||
      (customer.phone && customer.phone.includes(query))
    );
  }

  // Sale methods
  async getSale(id: string): Promise<SaleWithDetails | undefined> {
    const sale = this.sales.get(id);
    if (!sale) return undefined;

    const items = Array.from(this.saleItems.values())
      .filter(item => item.saleId === id)
      .map(item => ({
        ...item,
        product: this.products.get(item.productId),
      }));

    return {
      ...sale,
      customer: sale.customerId ? this.customers.get(sale.customerId) : undefined,
      user: this.users.get(sale.userId),
      items,
    };
  }

  async createSale(insertSale: InsertSale, items: InsertSaleItem[]): Promise<Sale> {
    const id = randomUUID();
    const sale: Sale = {
      ...insertSale,
      id,
      createdAt: new Date(),
    };
    this.sales.set(id, sale);

    // Create sale items and update stock
    for (const itemData of items) {
      const saleItem: SaleItem = {
        ...itemData,
        id: randomUUID(),
        saleId: id,
      };
      this.saleItems.set(saleItem.id, saleItem);

      // Update product stock
      await this.updateProductStock(
        saleItem.productId,
        -saleItem.quantity,
        'sale',
        `Sale ${sale.invoiceNumber}`,
        sale.userId
      );
    }

    // Update customer total spent and loyalty points
    if (sale.customerId) {
      const customer = this.customers.get(sale.customerId);
      if (customer) {
        const totalSpent = parseFloat(customer.totalSpent) + parseFloat(sale.total);
        const loyaltyPoints = customer.loyaltyPoints + Math.floor(parseFloat(sale.total));
        
        const updatedCustomer = {
          ...customer,
          totalSpent: totalSpent.toFixed(2),
          loyaltyPoints,
        };
        this.customers.set(sale.customerId, updatedCustomer);
      }
    }

    return sale;
  }

  async getAllSales(): Promise<SaleWithDetails[]> {
    const sales = Array.from(this.sales.values());
    const salesWithDetails: SaleWithDetails[] = [];

    for (const sale of sales) {
      const saleWithDetails = await this.getSale(sale.id);
      if (saleWithDetails) {
        salesWithDetails.push(saleWithDetails);
      }
    }

    return salesWithDetails;
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<SaleWithDetails[]> {
    const allSales = await this.getAllSales();
    return allSales.filter(sale => 
      sale.createdAt && sale.createdAt >= startDate && sale.createdAt <= endDate
    );
  }

  async getSalesByCustomer(customerId: string): Promise<SaleWithDetails[]> {
    const allSales = await this.getAllSales();
    return allSales.filter(sale => sale.customerId === customerId);
  }

  // Stock movement methods
  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const id = randomUUID();
    const stockMovement: StockMovement = {
      ...movement,
      id,
      createdAt: new Date(),
    };
    this.stockMovements.set(id, stockMovement);
    return stockMovement;
  }

  async getStockMovements(productId?: string): Promise<StockMovement[]> {
    const movements = Array.from(this.stockMovements.values());
    if (productId) {
      return movements.filter(movement => movement.productId === productId);
    }
    return movements;
  }

  // Return methods
  async createReturn(insertReturn: InsertReturn): Promise<Return> {
    const id = randomUUID();
    const returnItem: Return = {
      ...insertReturn,
      id,
      createdAt: new Date(),
    };
    this.returns.set(id, returnItem);

    // Update stock
    await this.updateProductStock(
      returnItem.productId,
      returnItem.quantity,
      'return',
      `Return: ${returnItem.reason}`,
      returnItem.userId
    );

    return returnItem;
  }

  async getReturns(): Promise<Return[]> {
    return Array.from(this.returns.values());
  }

  // Purchase order methods
  async createPurchaseOrder(insertOrder: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder> {
    const id = randomUUID();
    const order: PurchaseOrder = {
      ...insertOrder,
      id,
      createdAt: new Date(),
      receivedAt: null,
    };
    this.purchaseOrders.set(id, order);

    // Create purchase order items
    for (const itemData of items) {
      const item: PurchaseOrderItem = {
        ...itemData,
        id: randomUUID(),
        purchaseOrderId: id,
      };
      this.purchaseOrderItems.set(item.id, item);
    }

    return order;
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async receivePurchaseOrder(id: string, userId: string): Promise<boolean> {
    const order = this.purchaseOrders.get(id);
    if (!order || order.status === 'received') return false;

    // Update order status
    const updatedOrder = { ...order, status: 'received' as const, receivedAt: new Date() };
    this.purchaseOrders.set(id, updatedOrder);

    // Update stock for all items
    const orderItems = Array.from(this.purchaseOrderItems.values())
      .filter(item => item.purchaseOrderId === id);

    for (const item of orderItems) {
      await this.updateProductStock(
        item.productId,
        item.quantity,
        'purchase',
        `Purchase Order ${order.orderNumber}`,
        userId
      );

      // Update product cost price
      const product = this.products.get(item.productId);
      if (product) {
        const updatedProduct = { ...product, costPrice: item.unitCost, updatedAt: new Date() };
        this.products.set(item.productId, updatedProduct);
      }
    }

    return true;
  }

  // Dashboard methods
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

    const todaySales = Array.from(this.sales.values())
      .filter(sale => sale.createdAt && sale.createdAt >= startOfDay);
    
    const yesterdaySales = Array.from(this.sales.values())
      .filter(sale => sale.createdAt && sale.createdAt >= yesterday && sale.createdAt < startOfDay);

    const todayRevenue = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

    const totalProducts = this.products.size;
    const lowStockProducts = await this.getLowStockProducts();
    const totalCustomers = this.customers.size;

    return {
      todaySales: todayRevenue,
      todayTransactions: todaySales.length,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      totalCustomers,
      salesGrowth: yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0,
      transactionGrowth: yesterdaySales.length > 0 ? ((todaySales.length - yesterdaySales.length) / yesterdaySales.length) * 100 : 0,
      customerGrowth: 15.3, // Sample data
    };
  }

  async getTopProducts(limit = 5): Promise<Array<{ product: Product; totalSold: number; revenue: number }>> {
    const productSales = new Map<string, { totalSold: number; revenue: number }>();

    // Calculate sales for each product
    for (const item of this.saleItems.values()) {
      const existing = productSales.get(item.productId) || { totalSold: 0, revenue: 0 };
      productSales.set(item.productId, {
        totalSold: existing.totalSold + item.quantity,
        revenue: existing.revenue + parseFloat(item.totalPrice),
      });
    }

    // Convert to array and sort by revenue
    const topProducts = Array.from(productSales.entries())
      .map(([productId, stats]) => ({
        product: this.products.get(productId)!,
        ...stats,
      }))
      .filter(item => item.product)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return topProducts;
  }

  async getSalesData(days: number): Promise<Array<{ date: string; sales: number; transactions: number }>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const salesInRange = Array.from(this.sales.values())
      .filter(sale => sale.createdAt && sale.createdAt >= startDate && sale.createdAt <= endDate);

    // Group by date
    const dailyData = new Map<string, { sales: number; transactions: number }>();
    
    for (const sale of salesInRange) {
      const dateKey = sale.createdAt!.toISOString().split('T')[0];
      const existing = dailyData.get(dateKey) || { sales: 0, transactions: 0 };
      dailyData.set(dateKey, {
        sales: existing.sales + parseFloat(sale.total),
        transactions: existing.transactions + 1,
      });
    }

    // Fill in missing days with zero data
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const data = dailyData.get(dateKey) || { sales: 0, transactions: 0 };
      result.push({
        date: dateKey,
        ...data,
      });
    }

    return result;
  }
}

export const storage = new MemStorage();
