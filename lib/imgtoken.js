import { sign } from './server';
// Маягт илгээсний дараа тухайн шинэ бүртгэлд зураг хавсаргах түр эрх (60 мин). Нэвтрээгүй санал болгогчид ч ажиллана.
export async function imgToken(k, id) { const ts = Date.now(); return { k, id, ts, t: await sign(`img:${k}:${id}:${ts}`) }; }
export async function checkImgToken({ k, id, ts, t }) { ts = +ts; if (!k || !id || !ts || !t || Date.now() - ts > 3600e3) return false; return (await sign(`img:${k}:${id}:${ts}`)) === t; }
