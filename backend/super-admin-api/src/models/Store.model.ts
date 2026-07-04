import { query, schemaQualified } from '../config/database';

export interface Store {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  registration_number: string | null;
  timezone: string;
  currency: string;
  language: string;
  business_type: string | null;
  website: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStoreData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_number?: string;
  registration_number?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  business_type?: string;
  website?: string;
}

export class StoreModel {
  static async create(data: CreateStoreData): Promise<Store> {
    const result = await query(
      `INSERT INTO public.stores (
        name, email, phone, address, tax_number, registration_number,
        timezone, currency, language, business_type, website
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.name,
        data.email || null,
        data.phone || null,
        data.address || null,
        data.tax_number || null,
        data.registration_number || null,
        data.timezone || 'Asia/Baku',
        data.currency || 'AZN',
        data.language || 'az',
        data.business_type || null,
        data.website || null,
      ]
    );
    
    return result.rows[0];
  }

  static async findById(id: string): Promise<Store | null> {
    const result = await query(
      `SELECT * FROM public.stores WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll({
    is_active,
    page = 1,
    limit = 20,
    search,
  }: {
    is_active?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM public.stores ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT s.*, 
        CAST((SELECT COUNT(*) FROM ${schemaQualified}.users u WHERE u.store_id = s.id) AS INTEGER) as users_count 
       FROM public.stores s
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      stores: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id: string, data: Partial<Store>): Promise<Store | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      email: 'email',
      phone: 'phone',
      address: 'address',
      tax_number: 'tax_number',
      registration_number: 'registration_number',
      timezone: 'timezone',
      currency: 'currency',
      language: 'language',
      business_type: 'business_type',
      website: 'website',
      is_active: 'is_active',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key as keyof Store] !== undefined) {
        fields.push(`${dbField} = $${paramIndex++}`);
        values.push(data[key as keyof Store]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE public.stores SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM public.stores WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}