import { query, schemaQualified } from '../config/database';

export const productService = {
  async getAllProducts() {
    const result = await query(`SELECT * FROM ${schemaQualified}."products" ORDER BY created_at DESC`);
    return result.rows;
  },

  async bulkImport(products: any[]) {
    // Basic bulk import loop
    // In production, one might use a transaction and unnest, but for simplicity:
    const imported: any[] = [];
    for (const p of products) {
      const result = await query(
        `INSERT INTO ${schemaQualified}."products" (name, sku, category, price, stock, min_stock, status, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (sku) DO UPDATE 
         SET price = EXCLUDED.price, stock = EXCLUDED.stock, status = EXCLUDED.status
         RETURNING *`,
        [p.name, p.sku || Math.random().toString(36).substr(2, 9).toUpperCase(), p.category || 'Digər', p.price || 0, p.stock || 0, p.min_stock || 0, p.status || 'active', p.image || '📦']
      );
      imported.push(result.rows[0]);
    }
    return imported;
  },

  async createProduct(data: any) {
    const result = await query(
      `INSERT INTO ${schemaQualified}."products" (name, sku, category, price, stock, min_stock, status, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.name, data.sku || Math.random().toString(36).substr(2, 9).toUpperCase(), data.category || 'Digər', data.price || 0, data.stock || 0, data.min_stock || 0, data.status || 'active', data.image || '📦']
    );
    return result.rows[0];
  },

  async updateProduct(id: string, data: any) {
    const result = await query(
      `UPDATE ${schemaQualified}."products" 
       SET name = $1, sku = $2, category = $3, price = $4, stock = $5, min_stock = $6, status = $7, image = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [data.name, data.sku, data.category, data.price, data.stock, data.min_stock, data.status, data.image, id]
    );
    return result.rows[0];
  },

  async deleteProduct(id: string) {
    await query(`DELETE FROM ${schemaQualified}."products" WHERE id = $1`, [id]);
    return true;
  }
};
