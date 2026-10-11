import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('Home');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center bg-[#FDFBF7] overflow-hidden">
        
        {/* Subtle Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-[#E5E7EB] rounded-full blur-[90px] mix-blend-multiply"></div>
        </div>

        <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center">
          
          {/* Text Content */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-primary bg-primary/10 rounded-full uppercase">
              {t('hero.badge', { defaultMessage: 'New Collection 2026' })}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
              {t('hero.title1', { defaultMessage: 'Discover True' })} <br/>
              <span className="text-primary italic font-serif">{t('hero.title2', { defaultMessage: 'Elegance.' })}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
              {t('hero.subtitle', { defaultMessage: 'Explore our premium selection of tailored fashion and exclusive accessories crafted for the modern individual.' })}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/shop" className="premium-button w-full sm:w-auto text-center">
                {t('hero.shopNow', { defaultMessage: 'Shop Now' })}
              </Link>
              <Link href="/collections" className="w-full sm:w-auto text-center px-6 py-3 font-medium text-foreground bg-white border border-border rounded-xl hover:bg-gray-50 transition-colors">
                {t('hero.viewLookbook', { defaultMessage: 'View Lookbook' })}
              </Link>
            </div>
          </div>

          {/* Featured Hero Image Placeholder */}
          <div className="w-full md:w-1/2 mt-12 md:mt-0 flex justify-center">
            <div className="relative w-72 h-[450px] md:w-96 md:h-[550px] rounded-[2rem] overflow-hidden premium-shadow border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000" 
                alt={t('hero.imageAlt', { defaultMessage: 'Premium Fashion Model' })}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
        </div>
      </section>

      {/* Featured Categories (Placeholder for next step) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {t('categories.title', { defaultMessage: 'Shop by Category' })}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-10 rounded-full"></div>
          <p className="text-muted-foreground mb-12">
            {t('categories.subtitle', { defaultMessage: 'Category cards will be placed here.' })}
          </p>
        </div>
      </section>
    </div>
  );
}
