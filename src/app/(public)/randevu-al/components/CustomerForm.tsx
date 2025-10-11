'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, User, Phone } from 'lucide-react';

const formSchema = z.object({
  customerName: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  customerPhone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalı'),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData>;
}

export function CustomerForm({ onSubmit, initialData }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      customerName: initialData?.customerName || '',
      customerPhone: initialData?.customerPhone || '',
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // 0 ile başlamıyorsa 0 ekle
    if (numbers.length > 0 && !numbers.startsWith('0')) {
      return '0' + numbers;
    }
    
    // Maksimum 11 karakter (0 + 10 rakam)
    return numbers.slice(0, 11);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    form.setValue('customerPhone', formatted, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  const getFieldStatus = (fieldName: keyof FormData) => {
    const value = form.getValues(fieldName);
    const error = form.formState.errors[fieldName];
    
    if (error) return 'error';
    if (value && value.length > 0) return 'success';
    return 'default';
  };

  const FieldIcon = ({ status }: { status: 'success' | 'error' | 'default' }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bilgilerinizi Girin</h2>
        <p className="text-gray-600">Randevu için gerekli bilgileri doldurun</p>
      </div>

      <Card className="max-w-2xl mx-auto animate-in slide-in-from-bottom-50 duration-500">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* İsim Soyisim */}
            <div className="space-y-2 animate-in fade-in-50 duration-500">
              <Label htmlFor="customerName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                İsim Soyisim *
              </Label>
              <div className="relative">
                <Input
                  id="customerName"
                  placeholder="Ahmet Yılmaz"
                  className={cn(
                    "pl-4 pr-10 h-12 transition-all duration-200",
                    getFieldStatus('customerName') === 'error' && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    getFieldStatus('customerName') === 'success' && "border-green-500 focus:border-green-500 focus:ring-green-500"
                  )}
                  {...form.register('customerName')}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FieldIcon status={getFieldStatus('customerName')} />
                </div>
              </div>
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>

            {/* Telefon */}
            <div className="space-y-2 animate-in fade-in-50 duration-500" style={{ animationDelay: '100ms' }}>
              <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefon Numarası *
              </Label>
              <div className="relative">
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="05551234567"
                  className={cn(
                    "pl-4 pr-10 h-12 transition-all duration-200",
                    getFieldStatus('customerPhone') === 'error' && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    getFieldStatus('customerPhone') === 'success' && "border-green-500 focus:border-green-500 focus:ring-green-500"
                  )}
                  {...form.register('customerPhone')}
                  onChange={handlePhoneChange}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FieldIcon status={getFieldStatus('customerPhone')} />
                </div>
              </div>
              {form.formState.errors.customerPhone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.customerPhone.message}
                </p>
              )}
            </div>


            {/* Form Özet */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 animate-in fade-in-50 duration-500" style={{ animationDelay: '200ms' }}>
              <h4 className="font-semibold text-gray-900">Girilen Bilgiler:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">İsim:</span> {form.watch('customerName') || 'Girilmedi'}</p>
                <p><span className="font-medium">Telefon:</span> {form.watch('customerPhone') || 'Girilmedi'}</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4 animate-in fade-in-50 duration-500" style={{ animationDelay: '300ms' }}>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    İşleniyor...
                  </div>
                ) : (
                  'Randevuyu Onayla →'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
