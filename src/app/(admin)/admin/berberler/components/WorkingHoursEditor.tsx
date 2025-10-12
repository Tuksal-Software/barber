"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

export interface WorkingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

interface WorkingHoursEditorProps {
  workingHours: WorkingHour[];
  onChange: (workingHours: WorkingHour[]) => void;
}

const dayNames = [
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
  { value: 0, label: "Pazar" },
];

export default function WorkingHoursEditor({ workingHours, onChange }: WorkingHoursEditorProps) {
  const handleToggle = (dayOfWeek: number) => {
    const updated = workingHours.map(wh =>
      wh.dayOfWeek === dayOfWeek ? { ...wh, isWorking: !wh.isWorking } : wh
    );
    onChange(updated);
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = workingHours.map(wh =>
      wh.dayOfWeek === dayOfWeek ? { ...wh, [field]: value } : wh
    );
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Çalışma Saatleri</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {dayNames.map((day) => {
            const workingHour = workingHours.find(wh => wh.dayOfWeek === day.value) || {
              dayOfWeek: day.value,
              startTime: "09:00",
              endTime: "18:00",
              isWorking: day.value !== 0,
            };

            return (
              <div
                key={day.value}
                className={`border rounded-lg p-4 transition-all ${
                  workingHour.isWorking
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={workingHour.isWorking}
                      onCheckedChange={() => handleToggle(day.value)}
                      id={`working-${day.value}`}
                    />
                    <Label
                      htmlFor={`working-${day.value}`}
                      className={`font-semibold cursor-pointer ${
                        workingHour.isWorking ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {day.label}
                    </Label>
                  </div>
                  {!workingHour.isWorking && (
                    <span className="text-sm text-gray-500 font-medium">Kapalı</span>
                  )}
                </div>

                {workingHour.isWorking && (
                  <div className="grid grid-cols-2 gap-4 pl-11">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Başlangıç</Label>
                      <Input
                        type="time"
                        value={workingHour.startTime}
                        onChange={(e) => handleTimeChange(day.value, 'startTime', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Bitiş</Label>
                      <Input
                        type="time"
                        value={workingHour.endTime}
                        onChange={(e) => handleTimeChange(day.value, 'endTime', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-800">
            <strong>💡 İpucu:</strong> Berberin çalışmadığı günleri kapatabilir, 
            çalışma saatlerini özelleştirebilirsiniz.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

