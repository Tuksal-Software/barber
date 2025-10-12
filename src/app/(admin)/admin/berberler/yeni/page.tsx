"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBarber } from "@/lib/actions/barber.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, User, Mail, Scissors, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import WorkingHoursEditor, { WorkingHour } from "../components/WorkingHoursEditor";

const defaultWorkingHours: WorkingHour[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isWorking: true },
  { dayOfWeek: 6, startTime: "09:00", endTime: "16:00", isWorking: true },
  { dayOfWeek: 0, startTime: "10:00", endTime: "16:00", isWorking: false },
];

export default function YeniBerberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
    slotDuration: 30,
  });
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(defaultWorkingHours);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createBarber({
        ...formData,
        password: 'default123',
        role: 'barber',
        experience: 5,
        specialties: 'Saç Kesimi, Sakal Tıraşı, Bakım',
        workingHours,
      });
      if (result.success) {
        toast.success("Berber başarıyla oluşturuldu");
        router.push("/admin/berberler");
      } else {
        toast.error(result.error || "Berber oluşturulurken hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/berberler">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Berber Ekle</h1>
          <p className="text-gray-600">Yeni berber bilgilerini girin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol Kolon - Temel Bilgiler */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Temel Bilgiler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İsim *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Berber adı"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="berber@salon.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>


              </CardContent>
            </Card>
          </div>

          {/* Sağ Kolon - Ek Bilgiler */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scissors className="h-5 w-5" />
                  <span>Berberlik Bilgileri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Profil Fotoğrafı URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Randevu Slot Süresi *</Label>
                  <RadioGroup
                    value={formData.slotDuration.toString()}
                    onValueChange={(value) => handleInputChange("slotDuration", parseInt(value))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="15" id="slot15" />
                      <Label htmlFor="slot15" className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>15 Dakika</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="slot30" />
                      <Label htmlFor="slot30" className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>30 Dakika (Önerilen)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="60" id="slot60" />
                      <Label htmlFor="slot60" className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>1 Saat</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Çalışma Saatleri */}
        <WorkingHoursEditor
          workingHours={workingHours}
          onChange={setWorkingHours}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link href="/admin/berberler">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Oluşturuluyor..." : "Berber Oluştur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
