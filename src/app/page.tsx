import HeroSection from '@/components/public/HeroSection'
import ServicesPreview from '@/components/public/ServicesPreview'
import BarbersPreview from '@/components/public/BarbersPreview'
import { mockServices, mockBarbers } from '@/lib/mock-data'

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServicesPreview services={mockServices} />
      <BarbersPreview barbers={mockBarbers} />
    </div>
  )
}