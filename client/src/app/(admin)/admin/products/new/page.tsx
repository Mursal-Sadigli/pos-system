'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';

const productSchema = z.object({
  name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır'),
  sku: z.string().min(2, 'SKU ən az 2 simvol olmalıdır'),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, 'Kateqoriya seçin'),
  price: z.string().min(1, 'Qiymət daxil edin'),
  cost: z.string().min(1, 'Maya dəyəri daxil edin'),
  taxRate: z.string().optional(),
  stock: z.string().min(1, 'Stok miqdarı daxil edin'),
  minStock: z.string().optional(),
  unit: z.enum(['PIECE', 'KG', 'GRAM', 'LITER', 'METER']),
  description: z.string().optional(),
  supplier: z.string().optional(),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Mock categories
const categories = [
  { id: 'cat-1', name: 'Elektronika' },
  { id: 'cat-2', name: 'Geyim' },
  { id: 'cat-3', name: 'Qida' },
  { id: 'cat-4', name: 'Aksesuarlar' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      unit: 'PIECE',
      taxRate: '0',
      minStock: '5',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: '✅ Məhsul yaradıldı!',
        description: `${data.name} məhsulu uğurla əlavə edildi`,
      });
      
      router.push('/admin/products');
    } catch (error) {
      toast({
        title: '❌ Xəta baş verdi',
        description: 'Məhsul yaradılarkən xəta baş verdi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as { files?: { length: number; [index: number]: File } | null };
    const files = target.files;
    if (!files) return;

    // Mock image upload - in real app, upload to cloud storage
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        setImages((prev) => [...prev, URL.createObjectURL(file)]);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => router.push('/admin/products')}
      >
        <ArrowLeft className="h-4 w-4" />
        Geri
      </Button>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Məhsul Məlumatları</CardTitle>
              <CardDescription>
                Yeni məhsulun əsas məlumatlarını daxil edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Məhsul Adı *</Label>
                  <Input
                    id="name"
                    placeholder="iPhone 15 Pro"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    placeholder="IP-001"
                    {...register('sku')}
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barkod</Label>
                  <Input
                    id="barcode"
                    placeholder="1234567890123"
                    {...register('barcode')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Kateqoriya *</Label>
                  <Select
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Kateqoriya seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Satış Qiyməti (₼) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="1299.00"
                    {...register('price')}
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Maya Dəyəri (₼) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="999.00"
                    {...register('cost')}
                    className={errors.cost ? 'border-red-500' : ''}
                  />
                  {errors.cost && (
                    <p className="text-sm text-red-500">{errors.cost.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Vergi Dərəcəsi (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    {...register('taxRate')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Ölçü Vahidi *</Label>
                  <Select
                    onValueChange={(value: any) => setValue('unit', value)}
                    defaultValue="PIECE"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vahid seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIECE">Ədəd</SelectItem>
                      <SelectItem value="KG">Kiloqram</SelectItem>
                      <SelectItem value="GRAM">Qram</SelectItem>
                      <SelectItem value="LITER">Litr</SelectItem>
                      <SelectItem value="METER">Metr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stok Miqdarı *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="10"
                    {...register('stock')}
                    className={errors.stock ? 'border-red-500' : ''}
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500">{errors.stock.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stok</Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="5"
                    {...register('minStock')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Təchizatçı</Label>
                  <Input
                    id="supplier"
                    placeholder="Apple Inc."
                    {...register('supplier')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Təsvir</Label>
                <Textarea
                  id="description"
                  placeholder="Məhsul haqqında ətraflı məlumat..."
                  className="min-h-[100px]"
                  {...register('description')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Şəkillər</CardTitle>
              <CardDescription>
                Məhsulun şəkillərini yükləyin (maksimum 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg border bg-gray-50 overflow-hidden">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Şəkil yüklə</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP formatları dəstəklənir. Maksimum 5 şəkil.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Teqlər</CardTitle>
              <CardDescription>
                Məhsulu kateqoriyalara görə teqləyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Teq əlavə et..."
                    value={tagInput}
                    onChange={(e) => setTagInput((e.target as { value?: string }).value ?? "")}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">Hələ heç bir teq əlavə edilməyib</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/admin/products')}
            >
              Ləğv Et
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yaradılır...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Məhsulu Yarat
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}