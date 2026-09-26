import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  const [common] = await Promise.all([
    import(`@/messages/${locale}/common.json`).then((m) => m.default),
    // import(`../../messages/${locale}/auth.json`).then((m) => m.default),
    // import(`../../messages/${locale}/room.json`).then((m) => m.default),
    // import(`../../messages/${locale}/tenant.json`).then((m) => m.default),
    // import(`../../messages/${locale}/billing.json`).then((m) => m.default),
    // import(`../../messages/${locale}/payment.json`).then((m) => m.default),
  ]);

  return {
    locale: locale as string,
    messages: {
      Common: common,
      // Auth: auth,
      // Room: room,
      // Tenant: tenant,
      // Billing: billing,
      // Payment: payment,
    },
  };
});
