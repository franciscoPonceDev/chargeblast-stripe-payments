import { CONSENT_KEY } from "@/lib/analytics/consentKey";

/** Renders nothing unless NEXT_PUBLIC_GTM_ID is set. Env is read per render so it is testable. */
export async function Gtm() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) return null;
  const serverUrl = process.env.NEXT_PUBLIC_GTM_SERVER_URL?.replace(/\/$/, "");
  // Trade-off: loaded on demand so next/script stays out of the bundle when GTM is not configured.
  const { default: Script } = await import("next/script");
  const base = serverUrl || "https://www.googletagmanager.com";
  // Trade-off: all storage denied until the user opts in (Consent Mode v2); GA4 then sends cookieless pings only.
  const consent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
${serverUrl ? `gtag('set',{transport_url:${JSON.stringify(serverUrl)},server_container_url:${JSON.stringify(serverUrl)}});` : ""}
try{if(localStorage.getItem(${JSON.stringify(CONSENT_KEY)})==='granted')gtag('consent','update',{analytics_storage:'granted'})}catch(e){}`;
  const loader = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src=${JSON.stringify(base)}+'/gtm.js?id='+i;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`;
  return (
    <>
      {/* beforeInteractive is supported in the App Router root layout (Gtm is rendered there); the lint rule does not flag it here. */}
      <Script id="gtm-consent-default" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: consent }} />
      <Script id="gtm-loader" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: loader }} />
    </>
  );
}
