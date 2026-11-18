// Plain module (no "use client") so Server Components can read the values too.
export const TABLE_SETTINGS_KEY = "payments.tableSettings.v1";

/** Hideable data columns in table order. Select and row actions are structural and not listed. */
export const COLUMN_OPTIONS: readonly { id: string; label: string; locked?: boolean }[] = [
  { id: "amount", label: "Amount", locked: true },
  { id: "currency", label: "Currency" },
  { id: "status", label: "Status" },
  { id: "method", label: "Payment method" },
  { id: "description", label: "Description" },
  { id: "customer", label: "Customer" },
  { id: "created", label: "Date" },
  { id: "refundedAt", label: "Refunded date" },
  { id: "declineReason", label: "Decline reason" },
  { id: "paymentId", label: "Payment ID" },
];

export const SETTINGS_STYLE_ID = "tbl-prefs";

/**
 * Inline script that runs before the table is parsed. It turns the saved column and wrap preferences into a <style>
 * element, so the very first paint already has the saved layout (no hidden-column flash, no layout shift).
 * useTableSettings removes the element once React has applied the same settings.
 */
export function settingsScript(): string {
  const hideable = COLUMN_OPTIONS.filter((c) => !c.locked).map((c) => c.id);
  return `(function(){try{var v=JSON.parse(localStorage.getItem(${JSON.stringify(TABLE_SETTINGS_KEY)})||"null");if(!v)return;var ok=${JSON.stringify(hideable)},h=Array.isArray(v.hidden)?v.hidden:[],t="[data-payments-table] ",css="";for(var i=0;i<h.length;i++)if(ok.indexOf(h[i])>-1)css+=t+'[data-col="'+h[i]+'"]{display:none}';if(v.wrap===true)css+=t+"td,"+t+"td .truncate{white-space:normal}";if(css){var s=document.createElement("style");s.id=${JSON.stringify(SETTINGS_STYLE_ID)};s.textContent=css;document.head.appendChild(s)}}catch(e){}})()`;
}
