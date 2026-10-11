import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'ta', 'hi', 'te', 'kn', 'tanglish'];

export default getRequestConfig(async (params: any) => {
  // Handle both locale and requestLocale (Promise or string)
  let locale = params.locale || (params.requestLocale ? await params.requestLocale : null);
  
  if (!locale) {
    locale = 'en'; // Fallback to default
  }

  if (!locales.includes(locale)) {
    console.error(`Locale ${locale} not in supported locales array.`);
    locale = 'en'; // Force fallback if invalid
  }

  try {
    const messages = (await import(`../../locales/${locale}.json`)).default;
    return { locale, messages };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }
});
