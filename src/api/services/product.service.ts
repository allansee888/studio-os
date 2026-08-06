import { ProductRepository, productRepository, ProductFilters } from "../repositories/product.repository";
import { categoryRepository } from "../repositories/category.repository";
import { brandRepository } from "../repositories/brand.repository";
import { uomRepository } from "../repositories/uom.repository";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
  CreateProductSchema,
  UpdateProductSchema,
  ProductFilterSchema,
} from "../../packages/validation/product";

export class ProductError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ProductError";
    this.statusCode = statusCode;
  }
}

export class ProductService {
  private repository: ProductRepository;

  constructor(repository: ProductRepository = productRepository) {
    this.repository = repository;
  }

  static async getProducts(query: ProductFilterInput = {}) {
    return productService.getProducts(query);
  }

  static async getProduct(id: string) {
    return productService.getProduct(id);
  }

  static async createProduct(input: CreateProductInput, userId?: string) {
    return productService.createProduct(input, userId);
  }

  static async updateProduct(id: string, input: UpdateProductInput, userId?: string) {
    return productService.updateProduct(id, input, userId);
  }

  static async deleteProduct(id: string, userId?: string) {
    return productService.deleteProduct(id, userId);
  }

  async getProducts(query: ProductFilterInput = {}) {
    const validated = ProductFilterSchema.safeParse(query);
    const filterInput = validated.success ? validated.data : query;

    const isActiveBool =
      filterInput.isActive === "true" || filterInput.isActive === true
        ? true
        : filterInput.isActive === "false" || filterInput.isActive === false
        ? false
        : undefined;

    const repoFilters: ProductFilters = {
      page: filterInput.page,
      limit: filterInput.limit || filterInput.pageSize,
      pageSize: filterInput.pageSize,
      search: filterInput.search,
      categoryId: filterInput.categoryId,
      brandId: filterInput.brandId,
      unitId: filterInput.unitId,
      isActive: isActiveBool,
      sortBy: filterInput.sortBy,
      sortOrder: filterInput.sortOrder,
    };

    const result = await this.repository.findAll(repoFilters);

    return {
      items: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  async getProduct(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new ProductError("Product not found", 404);
    }
    return product;
  }

  async createProduct(input: CreateProductInput, userId?: string) {
    const parsedResult = CreateProductSchema.safeParse(input);
    if (!parsedResult.success) {
      const firstError =
        parsedResult.error.issues?.[0]?.message ||
        (parsedResult.error as any).errors?.[0]?.message ||
        "Invalid product input";
      throw new ProductError(firstError, 400);
    }

    const validated = parsedResult.data;

    // Business Rules validation
    if (validated.sellingPrice < validated.costPrice) {
      throw new ProductError("Selling Price must be greater than or equal to Cost Price", 400);
    }

    const existingSku = await this.repository.findBySku(validated.sku);
    if (existingSku) {
      throw new ProductError(`Product SKU '${validated.sku}' already exists`, 400);
    }

    if (validated.barcode) {
      const existingBarcode = await this.repository.findByBarcode(validated.barcode);
      if (existingBarcode) {
        throw new ProductError(`Product barcode '${validated.barcode}' already exists`, 400);
      }
    }

    const category = await categoryRepository.findById(validated.categoryId);
    if (!category) {
      throw new ProductError(`Category with ID '${validated.categoryId}' does not exist`, 400);
    }

    const brand = await brandRepository.findById(validated.brandId);
    if (!brand) {
      throw new ProductError(`Brand with ID '${validated.brandId}' does not exist`, 400);
    }

    const unit = await uomRepository.findById(validated.unitId);
    if (!unit) {
      throw new ProductError(`Unit with ID '${validated.unitId}' does not exist`, 400);
    }

    const created = await this.repository.create({
      sku: validated.sku,
      barcode: validated.barcode || null,
      name: validated.name,
      description: validated.description || null,
      categoryId: validated.categoryId,
      brandId: validated.brandId,
      unitId: validated.unitId,
      costPrice: validated.costPrice,
      sellingPrice: validated.sellingPrice,
      minimumStock: validated.minimumStock,
      maximumStock: validated.maximumStock,
      reorderPoint: validated.reorderPoint,
      trackInventory: validated.trackInventory,
      allowNegativeInventory: validated.allowNegativeInventory,
      isActive: validated.isActive,
      createdBy: userId || null,
    });

    console.log(`[ProductService] Created product: ${created.id} (${created.sku})`);
    return created;
  }

  async updateProduct(id: string, input: UpdateProductInput, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ProductError("Product not found", 404);
    }

    const parsedResult = UpdateProductSchema.safeParse(input);
    if (!parsedResult.success) {
      const firstError =
        parsedResult.error.issues?.[0]?.message ||
        (parsedResult.error as any).errors?.[0]?.message ||
        "Invalid product update input";
      throw new ProductError(firstError, 400);
    }

    const validated = parsedResult.data;

    let sku: string | undefined = undefined;
    if (validated.sku !== undefined) {
      sku = validated.sku;
      const existingSku = await this.repository.findBySku(sku);
      if (existingSku && existingSku.id !== id) {
        throw new ProductError(`Product SKU '${sku}' already exists`, 400);
      }
    }

    let barcode: string | null | undefined = undefined;
    if (validated.barcode !== undefined) {
      barcode = validated.barcode || null;
      if (barcode) {
        const existingBarcode = await this.repository.findByBarcode(barcode);
        if (existingBarcode && existingBarcode.id !== id) {
          throw new ProductError(`Product barcode '${barcode}' already exists`, 400);
        }
      }
    }

    let categoryId: string | undefined = undefined;
    if (validated.categoryId !== undefined) {
      categoryId = validated.categoryId;
      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw new ProductError(`Category with ID '${categoryId}' does not exist`, 400);
      }
    }

    let brandId: string | undefined = undefined;
    if (validated.brandId !== undefined) {
      brandId = validated.brandId;
      const brand = await brandRepository.findById(brandId);
      if (!brand) {
        throw new ProductError(`Brand with ID '${brandId}' does not exist`, 400);
      }
    }

    let unitId: string | undefined = undefined;
    if (validated.unitId !== undefined) {
      unitId = validated.unitId;
      const unit = await uomRepository.findById(unitId);
      if (!unit) {
        throw new ProductError(`Unit with ID '${unitId}' does not exist`, 400);
      }
    }

    const currentCostPrice = validated.costPrice !== undefined ? validated.costPrice : Number(existing.costPrice);
    const currentSellingPrice = validated.sellingPrice !== undefined ? validated.sellingPrice : Number(existing.sellingPrice);

    if (currentSellingPrice < currentCostPrice) {
      throw new ProductError("Selling Price must be greater than or equal to Cost Price", 400);
    }

    const updated = await this.repository.update(id, {
      ...(sku !== undefined && { sku }),
      ...(barcode !== undefined && { barcode }),
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description || null }),
      ...(categoryId !== undefined && { categoryId }),
      ...(brandId !== undefined && { brandId }),
      ...(unitId !== undefined && { unitId }),
      ...(validated.costPrice !== undefined && { costPrice: validated.costPrice }),
      ...(validated.sellingPrice !== undefined && { sellingPrice: validated.sellingPrice }),
      ...(validated.minimumStock !== undefined && { minimumStock: validated.minimumStock }),
      ...(validated.maximumStock !== undefined && { maximumStock: validated.maximumStock }),
      ...(validated.reorderPoint !== undefined && { reorderPoint: validated.reorderPoint }),
      ...(validated.trackInventory !== undefined && { trackInventory: validated.trackInventory }),
      ...(validated.allowNegativeInventory !== undefined && { allowNegativeInventory: validated.allowNegativeInventory }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      updatedBy: userId || null,
    });

    console.log(`[ProductService] Updated product: ${updated.id}`);
    return updated;
  }

  async deleteProduct(id: string, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ProductError("Product not found", 404);
    }

    // Placeholder check for future inventory transactions
    if ((existing as any)._count?.inventoryTransactions > 0) {
      throw new ProductError(
        `Cannot delete Product '${existing.name}' because it is associated with existing inventory transactions`,
        400
      );
    }

    const deleted = await this.repository.delete(id);
    console.log(`[ProductService] Deleted product: ${id}`);
    return deleted;
  }
}

export const productService = new ProductService();
