import AppointmentWizard from '@/components/public/AppointmentWizard'

export default function RandevuPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">Randevu Al</h1>
          <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto">
            Sadece birkaç adımda randevunuzu alın. Hızlı, kolay ve güvenli.
          </p>
        </div>
      </section>
      <AppointmentWizard />
    </div>
  )
}



