"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBarberById, updateBarber } from "@/lib/actions/barber.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, User, Mail, Lock, Briefcase, Scissors, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import WorkingHoursEditor, { WorkingHour } from "../../components/WorkingHoursEditor";

export default function BerberDuzenlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    experience: 0,
    specialties: "",
    image: "",
    slotDuration: 30,
  });
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

  useEffect(() => {
    loadBarberData();
  }, [id]);

  const loadBarberData = async () => {
    setDataLoading(true);
    try {
      const result = await getBarberById(id);
      if (result.success && result.data) {
        const barber = result.data;
        setFormData({
          name: barber.name,
          password: "",
          experience: barber.experience,
          specialties: barber.specialties || "",
          image: barber.image || "",
          slotDuration: 30,
        });

        if (barber.workingHours && barber.workingHours.length > 0) {
          setWorkingHours(
            barber.workingHours.map((wh: any) => ({
              dayOfWeek: wh.dayOfWeek,
              startTime: wh.startTime,
              endTime: wh.endTime,
              isWorking: wh.isWorking,
            }))
          );
        }
      } else {
        toast.error("Berber bilgileri yüklenemedi");
        router.push("/admin/berberler");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        experience: formData.experience,
        specialties: formData.specialties,
        image: formData.image,
        slotDuration: formData.slotDuration,
        workingHours,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const result = await updateBarber(id, updateData);
      if (result.success) {
        toast.success("Berber başarıyla güncellendi");
        router.push("/admin/berberler");
      } else {
        toast.error(result.error || "Berber güncellenirken hata oluştu");
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

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/berberler">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Berber Düzenle</h1>
          <p className="text-gray-600">Berber bilgilerini güncelleyin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <Label htmlFor="password">Yeni Şifre (Opsiyonel)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Boş bırakılırsa değişmez"
                      className="pl-10"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Deneyim (Yıl) *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="pl-10"
                      min="0"
                      required
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

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
                  <Label htmlFor="specialties">Uzmanlık Alanları</Label>
                  <Textarea
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) => handleInputChange("specialties", e.target.value)}
                    placeholder="Saç kesimi, sakal şekillendirme, bakım..."
                    rows={4}
                  />
                </div>

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

        <WorkingHoursEditor
          workingHours={workingHours}
          onChange={setWorkingHours}
        />

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link href="/admin/berberler">
            <Button type="button" variant="outline">
              İptal
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Güncelleniyor..." : "Güncelle"}
          </Button>
        </div>
      </form>
    </div>
  );
}

