// Нэг дуудлагаар Facebook Pixel болон Google Analytics 4 руу эвент илгээнэ.
// ev — Meta-гийн стандарт нэр (Lead, Contact, ...). GA4-д санал болгосон нэр рүү хөрвүүлнэ.
const GA = { Lead: 'generate_lead', CompleteRegistration: 'sign_up', Contact: 'contact', ViewContent: 'view_item', InitiateCheckout: 'begin_checkout', Purchase: 'purchase', SubmitApplication: 'submit_listing', Search: 'search' };
export function track(ev, data = {}) {
  if (typeof window === 'undefined') return;
  try { window.fbq && window.fbq(GA[ev] ? 'track' : 'trackCustom', ev, data); } catch {}
  try { window.gtag && window.gtag('event', GA[ev] || ev, data); } catch {}
}
