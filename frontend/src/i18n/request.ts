import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  const [common] = await Promise.all([
    import(`@/messages/${locale}/common.json`).then((m) => m.default),
  ]);

  const [topnav] = await Promise.all([
    import(`@/messages/${locale}/topnav.json`).then((m) => m.default),
  ]);

  return {
    locale: locale as string,
    messages: {
      Common: common,
      TopNav: topnav,
      // Room: room,
      // Tenant: tenant,
      // Billing: billing,
      // Payment: payment,
    },
  };
});
