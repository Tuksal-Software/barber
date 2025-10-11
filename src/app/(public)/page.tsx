import HeroSection from '@/components/home/HeroSection'
import ServicesPreview from '@/components/home/ServicesPreview'
import WhyUs from '@/components/home/WhyUs'
import CTASection from '@/components/home/CTASection'
import { mockServices } from '@/lib/mock-data'

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServicesPreview services={mockServices} />
      <WhyUs />
      <CTASection />
    </div>
  )
}