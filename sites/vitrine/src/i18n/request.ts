import { getRequestConfig } from 'next-intl/server';
import { routing } from '../navigation';

export default getRequestConfig(async ({ locale }) => {
    // Ensure that the incoming `locale` is valid
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
