import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import WhyUs from '@/components/home/WhyUs'
import CTASection from '@/components/home/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <WhyUs />
      <CTASection />
    </div>
  )
}