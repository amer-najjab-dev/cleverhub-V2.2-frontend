import { api } from '../../../services/api';
import { Supplier, CreditNote, ProductPurchase } from '../types/supplier.types';

export const supplierService = {
  getAll: async (params?: any): Promise<Supplier[]> => {
    const response = await api.get('/suppliers', { params });
    // Mapear snake_case a camelCase para que coincida con los tipos
    return response.data.data.map((item: any) => ({
      id: item.id,
      companyName: item.company_name,
      email: item.email,
      website: item.website,
      fax: item.fax,
      paymentTerms: item.payment_terms,
      taxId: item.tax_id,
      registrationNumber: item.registration_number,
      balance: item.balance,
      isActive: item.is_active,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      phones: item.phones?.map((p: any) => ({
        id: p.id,
        supplierId: p.supplier_id,
        number: p.number,
        type: p.type,
        description: p.description,
        isPrimary: p.is_primary,
        createdAt: p.created_at
      })),
      addresses: item.addresses?.map((a: any) => ({
        id: a.id,
        supplierId: a.supplier_id,
        streetNumber: a.street_number,
        streetName: a.street_name,
        city: a.city,
        postalCode: a.postal_code,
        country: a.country,
        complement: a.complement,
        isPrimary: a.is_primary,
        createdAt: a.created_at
      }))
    }));
  },

  getById: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    const item = response.data.data;
    return {
      id: item.id,
      companyName: item.company_name,
      email: item.email,
      website: item.website,
      fax: item.fax,
      paymentTerms: item.payment_terms,
      taxId: item.tax_id,
      registrationNumber: item.registration_number,
      balance: item.balance,
      isActive: item.is_active,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      phones: item.phones?.map((p: any) => ({
        id: p.id,
        supplierId: p.supplier_id,
        number: p.number,
        type: p.type,
        description: p.description,
        isPrimary: p.is_primary,
        createdAt: p.created_at
      })),
      addresses: item.addresses?.map((a: any) => ({
        id: a.id,
        supplierId: a.supplier_id,
        streetNumber: a.street_number,
        streetName: a.street_name,
        city: a.city,
        postalCode: a.postal_code,
        country: a.country,
        complement: a.complement,
        isPrimary: a.is_primary,
        createdAt: a.created_at
      }))
    };
  },

  create: async (data: Partial<Supplier> & { name?: string }): Promise<Supplier> => {
    console.log('📦 supplierService.create - data recibido:', JSON.stringify(data, null, 2));
    
    const payload: any = {};
    
    // Mapear 'name' a 'company_name' (prioridad)
    if (data.name) {
      payload.company_name = data.name;
    } else if (data.companyName) {
      payload.company_name = data.companyName;
    }
    
    if (data.email) payload.email = data.email;
    if (data.website) payload.website = data.website;
    if (data.fax) payload.fax = data.fax;
    if (data.paymentTerms) payload.payment_terms = data.paymentTerms;
    if (data.taxId) payload.tax_id = data.taxId;
    if (data.registrationNumber) payload.registration_number = data.registrationNumber;
    if (data.balance !== undefined) payload.balance = data.balance;
    if (data.isActive !== undefined) payload.is_active = data.isActive;
    if (data.notes) payload.notes = data.notes;
    
    console.log('📦 supplierService.create - payload a enviar:', JSON.stringify(payload, null, 2));

    const response = await api.post('/suppliers', payload);
    return supplierService.getById(response.data.data.id);
  },

  update: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    // Convertir camelCase a snake_case para el backend
    const payload: any = {};
    if (data.companyName) payload.company_name = data.companyName;
    if (data.email) payload.email = data.email;
    if (data.website) payload.website = data.website;
    if (data.fax) payload.fax = data.fax;
    if (data.paymentTerms) payload.payment_terms = data.paymentTerms;
    if (data.taxId) payload.tax_id = data.taxId;
    if (data.registrationNumber) payload.registration_number = data.registrationNumber;
    if (data.balance !== undefined) payload.balance = data.balance;
    if (data.isActive !== undefined) payload.is_active = data.isActive;
    if (data.notes) payload.notes = data.notes;

    await api.put(`/suppliers/${id}`, payload);
    return supplierService.getById(id);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },

  getCreditNotes: async (supplierId: string, params?: any): Promise<CreditNote[]> => {
    const response = await api.get(`/suppliers/${supplierId}/credit-notes`, { params });
    return response.data.data.map((item: any) => ({
      id: item.id,
      supplierId: item.supplier_id,
      reference: item.reference,
      issueDate: item.issue_date,
      totalAmount: item.total_amount,
      usedAmount: item.used_amount,
      remainingAmount: item.remaining_amount,
      status: item.status,
      reason: item.reason,
      linkedBL: item.linked_bl,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  getPurchaseHistory: async (supplierId: string, months?: number): Promise<ProductPurchase[]> => {
    const response = await api.get(`/suppliers/${supplierId}/purchases`, { params: { months } });
    return response.data.data.map((item: any) => ({
      id: item.id,
      supplierId: item.supplier_id,
      productId: item.product_id,
      productName: item.product?.name,
      purchaseDate: item.purchase_date,
      quantity: item.quantity,
      pricePPH: item.price_pph,
      previousPPH: item.previous_pph,
      batchNumber: item.batch_number,
      expiryDate: item.expiry_date,
      deliveryNoteId: item.delivery_note_id,
      createdAt: item.created_at
    }));
  },

  updateBalance: async (id: string, amount: number): Promise<Supplier> => {
    await api.patch(`/suppliers/${id}/balance`, { amount });
      return supplierService.getById(id);
  },
};