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
  type DashboardMetrics,
  users, categories, suppliers, products, customers, sales, saleItems, stockMovements, returns, purchaseOrders, purchaseOrderItems
} from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, like, desc, asc, sql, and, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}

const client = neon(dbUrl);
const db = drizzle(client);

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

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if admin user already exists
      const existingAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
      
      if (existingAdmin.length === 0) {
        // Create admin user
        await db.insert(users).values({
          username: "admin",
          password: await bcrypt.hash("admin123", 10),
          email: "admin@retailflow.com",
          fullName: "System Administrator",
          role: "admin",
          isActive: true,
        });
      }
    } catch (error) {
      console.log("Sample data initialization error:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const updateData: any = { ...userData };
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }
    const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result as any).rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Category methods
  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(insertCategory).returning();
    return result[0];
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result as any).rowCount > 0;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  // Supplier methods
  async getSupplier(id: string): Promise<Supplier | undefined> {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return result[0];
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const result = await db.insert(suppliers).values(insertSupplier).returning();
    return result[0];
  }

  async updateSupplier(id: string, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const result = await db.update(suppliers).set(supplierData).where(eq(suppliers.id, id)).returning();
    return result[0];
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return (result as any).rowCount > 0;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    return result[0];
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    if (!barcode) return undefined;
    const result = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
    return result[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result as any).rowCount > 0;
  }

  async getAllProducts(): Promise<ProductWithDetails[]> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
        description: products.description,
        categoryId: products.categoryId,
        supplierId: products.supplierId,
        costPrice: products.costPrice,
        sellingPrice: products.sellingPrice,
        quantity: products.quantity,
        minStockLevel: products.minStockLevel,
        trackStock: products.trackStock,
        isActive: products.isActive,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories.name,
        supplier: suppliers.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id));
    
    return result.map(row => ({
      ...row,
      category: row.category ? { name: row.category } : undefined,
      supplier: row.supplier ? { name: row.supplier } : undefined
    })) as ProductWithDetails[];
  }

  async searchProducts(query: string): Promise<ProductWithDetails[]> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
        description: products.description,
        categoryId: products.categoryId,
        supplierId: products.supplierId,
        costPrice: products.costPrice,
        sellingPrice: products.sellingPrice,
        quantity: products.quantity,
        minStockLevel: products.minStockLevel,
        trackStock: products.trackStock,
        isActive: products.isActive,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories.name,
        supplier: suppliers.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(like(products.name, `%${query}%`));
    
    return result.map(row => ({
      ...row,
      category: row.category ? { name: row.category } : undefined,
      supplier: row.supplier ? { name: row.supplier } : undefined
    })) as ProductWithDetails[];
  }

  async getLowStockProducts(): Promise<ProductWithDetails[]> {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
        description: products.description,
        categoryId: products.categoryId,
        supplierId: products.supplierId,
        costPrice: products.costPrice,
        sellingPrice: products.sellingPrice,
        quantity: products.quantity,
        minStockLevel: products.minStockLevel,
        trackStock: products.trackStock,
        isActive: products.isActive,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories.name,
        supplier: suppliers.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(sql`${products.quantity} <= ${products.minStockLevel}`);
    
    return result.map(row => ({
      ...row,
      category: row.category ? { name: row.category } : undefined,
      supplier: row.supplier ? { name: row.supplier } : undefined
    })) as ProductWithDetails[];
  }

  async updateProductStock(id: string, quantity: number, movementType: string, reason?: string, userId?: string): Promise<boolean> {
    try {
      // Update product quantity
      await db.update(products).set({ quantity }).where(eq(products.id, id));
      
      // Create stock movement record
      if (userId) {
        await db.insert(stockMovements).values({
          productId: id,
          quantity,
          movementType,
          reason: reason || null,
          userId,
        });
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(insertCustomer).returning();
    return result[0];
  }

  async updateCustomer(id: string, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db.update(customers).set(customerData).where(eq(customers.id, id)).returning();
    return result[0];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result as any).rowCount > 0;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return await db.select().from(customers).where(like(customers.name, `%${query}%`));
  }

  // Sale methods
  async getSale(id: string): Promise<SaleWithDetails | undefined> {
    const result = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        customerId: sales.customerId,
        userId: sales.userId,
        subtotal: sales.subtotal,
        taxAmount: sales.taxAmount,
        discountAmount: sales.discountAmount,
        total: sales.total,
        paymentMethod: sales.paymentMethod,
        status: sales.status,
        createdAt: sales.createdAt,
        customer: customers.name,
        user: users.fullName,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .leftJoin(users, eq(sales.userId, users.id))
      .where(eq(sales.id, id))
      .limit(1);
    
    return result[0] as SaleWithDetails;
  }

  async createSale(insertSale: InsertSale, items: InsertSaleItem[]): Promise<Sale> {
    const result = await db.insert(sales).values(insertSale).returning();
    const sale = result[0];
    
    // Insert sale items and update stock
    for (const item of items) {
      // Insert sale item
      await db.insert(saleItems).values({
        ...item,
        saleId: sale.id,
      });
      
      // Update product stock
      const product = await this.getProduct(item.productId);
      if (product && product.trackStock) {
        const newQuantity = product.quantity - item.quantity;
        await db.update(products)
          .set({ quantity: newQuantity })
          .where(eq(products.id, item.productId));
        
        // Create stock movement record
        await db.insert(stockMovements).values({
          productId: item.productId,
          movementType: 'sale',
          quantity: -item.quantity,
          reason: 'Sale transaction',
          reference: sale.id,
          userId: insertSale.userId,
        });
      }
    }
    
    return sale;
  }

  async getAllSales(): Promise<SaleWithDetails[]> {
    const result = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        customerId: sales.customerId,
        userId: sales.userId,
        subtotal: sales.subtotal,
        taxAmount: sales.taxAmount,
        discountAmount: sales.discountAmount,
        total: sales.total,
        paymentMethod: sales.paymentMethod,
        status: sales.status,
        createdAt: sales.createdAt,
        customer: customers.name,
        user: users.fullName,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .leftJoin(users, eq(sales.userId, users.id))
      .orderBy(desc(sales.createdAt));
    
    return result as SaleWithDetails[];
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<SaleWithDetails[]> {
    const result = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        customerId: sales.customerId,
        userId: sales.userId,
        subtotal: sales.subtotal,
        taxAmount: sales.taxAmount,
        discountAmount: sales.discountAmount,
        total: sales.total,
        paymentMethod: sales.paymentMethod,
        status: sales.status,
        createdAt: sales.createdAt,
        customer: customers.name,
        user: users.fullName,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .leftJoin(users, eq(sales.userId, users.id))
      .where(and(gte(sales.createdAt, startDate), lte(sales.createdAt, endDate)))
      .orderBy(desc(sales.createdAt));
    
    return result as SaleWithDetails[];
  }

  async getSalesByCustomer(customerId: string): Promise<SaleWithDetails[]> {
    const result = await db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        customerId: sales.customerId,
        userId: sales.userId,
        subtotal: sales.subtotal,
        taxAmount: sales.taxAmount,
        discountAmount: sales.discountAmount,
        total: sales.total,
        paymentMethod: sales.paymentMethod,
        status: sales.status,
        createdAt: sales.createdAt,
        customer: customers.name,
        user: users.fullName,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .leftJoin(users, eq(sales.userId, users.id))
      .where(eq(sales.customerId, customerId))
      .orderBy(desc(sales.createdAt));
    
    return result as SaleWithDetails[];
  }

  // Stock movement methods
  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const result = await db.insert(stockMovements).values(movement).returning();
    return result[0];
  }

  async getStockMovements(productId?: string): Promise<StockMovement[]> {
    if (productId) {
      return await db.select().from(stockMovements).where(eq(stockMovements.productId, productId)).orderBy(desc(stockMovements.createdAt));
    }
    return await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
  }

  // Return methods
  async createReturn(returnItem: InsertReturn): Promise<Return> {
    const result = await db.insert(returns).values(returnItem).returning();
    return result[0];
  }

  async getReturns(): Promise<Return[]> {
    return await db.select().from(returns).orderBy(desc(returns.createdAt));
  }

  // Purchase order methods
  async createPurchaseOrder(order: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder> {
    const result = await db.insert(purchaseOrders).values(order).returning();
    const purchaseOrder = result[0];
    
    // Insert purchase order items
    for (const item of items) {
      await db.insert(purchaseOrderItems).values({
        ...item,
        purchaseOrderId: purchaseOrder.id,
      });
    }
    
    return purchaseOrder;
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);
    return result[0];
  }

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async receivePurchaseOrder(id: string, userId: string): Promise<boolean> {
    try {
      await db.update(purchaseOrders).set({ 
        status: "received",
        receivedAt: new Date()
      }).where(eq(purchaseOrders.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Dashboard methods
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const totalProducts = await db.select({ count: sql<number>`count(*)` }).from(products);
    const totalCategories = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const totalCustomers = await db.select({ count: sql<number>`count(*)` }).from(customers);
    const totalSales = await db.select({ sum: sql<number>`sum(CAST(${sales.total} AS DECIMAL))` }).from(sales);
    
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Get today's sales
    const todaySales = await db
      .select({ sum: sql<number>`sum(CAST(${sales.total} AS DECIMAL))`, count: sql<number>`count(*)` })
      .from(sales)
      .where(and(gte(sales.createdAt, startOfDay), lte(sales.createdAt, endOfDay)));
    
    const lowStockCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`${products.quantity} <= ${products.minStockLevel}`);
    
    return {
      totalProducts: totalProducts[0]?.count || 0,
      totalCategories: totalCategories[0]?.count || 0,
      totalCustomers: totalCustomers[0]?.count || 0,
      totalRevenue: Number(totalSales[0]?.sum) || 0,
      lowStockItems: lowStockCount[0]?.count || 0,
      todaySales: Number(todaySales[0]?.sum) || 0,
      todayTransactions: todaySales[0]?.count || 0,
      salesGrowth: 0, // Default to 0 for now
      transactionGrowth: 0, // Default to 0 for now
    };
  }

  async getTopProducts(limit = 5): Promise<Array<{ product: Product; totalSold: number; revenue: number }>> {
    // This would require complex aggregation - for now return empty array
    return [];
  }

  async getSalesData(days: number): Promise<Array<{ date: string; sales: number; transactions: number }>> {
    // This would require date aggregation - for now return empty array
    return [];
  }
}

export const storage = new DatabaseStorage();