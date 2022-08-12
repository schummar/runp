import {
  runp
} from "./chunk-EPPPHU3V.js";

// node_modules/.pnpm/type-flag@2.2.0/node_modules/type-flag/dist/index.mjs
var C = /-(\w)/g;
var E = (t) => t.replace(C, (e, r) => r.toUpperCase());
var P = /\B([A-Z])/g;
var O = (t) => t.replace(P, "-$1").toLowerCase();
var { stringify: d } = JSON;
var { hasOwnProperty: x } = Object.prototype;
var y = (t, e) => x.call(t, e);
var j = /^--?/;
var D = /[.:=]/;
var I = (t) => {
  let e = t.replace(j, ""), r;
  const s = e.match(D);
  if (s != null && s.index) {
    const n = s.index;
    r = e.slice(n + 1), e = e.slice(0, n);
  }
  return { flagName: e, flagValue: r };
};
var T = /[\s.:=]/;
var U = (t, e) => {
  const r = `Invalid flag name ${d(e)}:`;
  if (e.length === 0)
    throw new Error(`${r} flag name cannot be empty}`);
  if (e.length === 1)
    throw new Error(`${r} single characters are reserved for aliases`);
  const s = e.match(T);
  if (s)
    throw new Error(`${r} flag name cannot contain the character ${d(s == null ? void 0 : s[0])}`);
  let n;
  if (C.test(e) ? n = E(e) : P.test(e) && (n = O(e)), n && y(t, n))
    throw new Error(`${r} collides with flag ${d(n)}`);
};
function L(t) {
  const e = /* @__PURE__ */ new Map();
  for (const r in t) {
    if (!y(t, r))
      continue;
    U(t, r);
    const s = t[r];
    if (s && typeof s == "object") {
      const { alias: n } = s;
      if (typeof n == "string") {
        if (n.length === 0)
          throw new Error(`Invalid flag alias ${d(r)}: flag alias cannot be empty`);
        if (n.length > 1)
          throw new Error(`Invalid flag alias ${d(r)}: flag aliases can only be a single-character`);
        if (e.has(n))
          throw new Error(`Flag collision: Alias "${n}" is already used`);
        e.set(n, { name: r, schema: s });
      }
    }
  }
  return e;
}
var M = (t) => !t || typeof t == "function" ? false : Array.isArray(t) || Array.isArray(t.type);
var z = (t) => {
  const e = {};
  for (const r in t)
    y(t, r) && (e[r] = M(t[r]) ? [] : void 0);
  return e;
};
var A = (t, e) => t === Number && e === "" ? Number.NaN : t === Boolean ? e !== "false" : e;
var B = (t, e) => {
  for (const r in t) {
    if (!y(t, r))
      continue;
    const s = t[r];
    if (!s)
      continue;
    const n = e[r];
    if (!(n !== void 0 && !(Array.isArray(n) && n.length === 0)) && "default" in s) {
      let o = s.default;
      typeof o == "function" && (o = o()), e[r] = o;
    }
  }
};
var _ = (t, e) => {
  if (!e)
    throw new Error(`Missing type on flag "${t}"`);
  return typeof e == "function" ? e : Array.isArray(e) ? e[0] : _(t, e.type);
};
var K = /^-[\da-z]+/i;
var q = /^--[\w-]{2,}/;
var F = "--";
function G(t, e = process.argv.slice(2), r = {}) {
  const s = L(t), n = { flags: z(t), unknownFlags: {}, _: Object.assign([], { [F]: [] }) };
  let o;
  const v3 = (i2, a, l) => {
    const c2 = _(i2, a);
    l = A(c2, l), l !== void 0 && !Number.isNaN(l) ? Array.isArray(n.flags[i2]) ? n.flags[i2].push(c2(l)) : n.flags[i2] = c2(l) : o = (f) => {
      Array.isArray(n.flags[i2]) ? n.flags[i2].push(c2(A(c2, f || ""))) : n.flags[i2] = c2(A(c2, f || "")), o = void 0;
    };
  }, b3 = (i2, a) => {
    i2 in n.unknownFlags || (n.unknownFlags[i2] = []), a !== void 0 ? n.unknownFlags[i2].push(a) : o = (l = true) => {
      n.unknownFlags[i2].push(l), o = void 0;
    };
  };
  for (let i2 = 0; i2 < e.length; i2 += 1) {
    const a = e[i2];
    if (a === F) {
      const f = e.slice(i2 + 1);
      n._[F] = f, n._.push(...f);
      break;
    }
    const l = K.test(a);
    if (q.test(a) || l) {
      o && o();
      const f = I(a), { flagValue: w3 } = f;
      let { flagName: u } = f;
      if (l) {
        for (let g2 = 0; g2 < u.length; g2 += 1) {
          const $3 = u[g2], h = s.get($3), k3 = g2 === u.length - 1;
          h ? v3(h.name, h.schema, k3 ? w3 : true) : r != null && r.ignoreUnknown ? n._.push(a) : b3($3, k3 ? w3 : true);
        }
        continue;
      }
      let p3 = t[u];
      if (!p3) {
        const g2 = E(u);
        p3 = t[g2], p3 && (u = g2);
      }
      if (!p3) {
        r != null && r.ignoreUnknown ? n._.push(a) : b3(u, w3);
        continue;
      }
      v3(u, p3, w3);
    } else
      o ? o(a) : n._.push(a);
  }
  return o && o(), B(t, n.flags), n;
}

// node_modules/.pnpm/cleye@1.2.1/node_modules/cleye/dist/index.mjs
import B2 from "tty";

// node_modules/.pnpm/terminal-columns@1.4.1/node_modules/terminal-columns/dist/index.mjs
var DD = Object.create;
var m = Object.defineProperty;
var uD = Object.defineProperties;
var FD = Object.getOwnPropertyDescriptor;
var CD = Object.getOwnPropertyDescriptors;
var tD = Object.getOwnPropertyNames;
var I2 = Object.getOwnPropertySymbols;
var ED = Object.getPrototypeOf;
var L2 = Object.prototype.hasOwnProperty;
var eD = Object.prototype.propertyIsEnumerable;
var W = (D3, F3, u) => F3 in D3 ? m(D3, F3, { enumerable: true, configurable: true, writable: true, value: u }) : D3[F3] = u;
var p = (D3, F3) => {
  for (var u in F3 || (F3 = {}))
    L2.call(F3, u) && W(D3, u, F3[u]);
  if (I2)
    for (var u of I2(F3))
      eD.call(F3, u) && W(D3, u, F3[u]);
  return D3;
};
var c = (D3, F3) => uD(D3, CD(F3));
var nD = (D3) => m(D3, "__esModule", { value: true });
var rD = (D3, F3) => () => (D3 && (F3 = D3(D3 = 0)), F3);
var iD = (D3, F3) => () => (F3 || D3((F3 = { exports: {} }).exports, F3), F3.exports);
var oD = (D3, F3, u, C3) => {
  if (F3 && typeof F3 == "object" || typeof F3 == "function")
    for (let t of tD(F3))
      !L2.call(D3, t) && (u || t !== "default") && m(D3, t, { get: () => F3[t], enumerable: !(C3 = FD(F3, t)) || C3.enumerable });
  return D3;
};
var BD = (D3, F3) => oD(nD(m(D3 != null ? DD(ED(D3)) : {}, "default", !F3 && D3 && D3.__esModule ? { get: () => D3.default, enumerable: true } : { value: D3, enumerable: true })), D3);
var i = rD(() => {
});
var $ = iD((LD, N) => {
  "use strict";
  i();
  N.exports = function() {
    return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
  };
});
i();
i();
i();
var v = (D3) => {
  var u, C3, t;
  let F3 = (u = process.stdout.columns) != null ? u : Number.POSITIVE_INFINITY;
  return typeof D3 == "function" && (D3 = D3(F3)), D3 || (D3 = {}), Array.isArray(D3) ? { columns: D3, stdoutColumns: F3 } : { columns: (C3 = D3.columns) != null ? C3 : [], stdoutColumns: (t = D3.stdoutColumns) != null ? t : F3 };
};
i();
i();
i();
i();
i();
function w({ onlyFirst: D3 = false } = {}) {
  let F3 = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");
  return new RegExp(F3, D3 ? void 0 : "g");
}
function d2(D3) {
  if (typeof D3 != "string")
    throw new TypeError(`Expected a \`string\`, got \`${typeof D3}\``);
  return D3.replace(w(), "");
}
i();
function y2(D3) {
  return Number.isInteger(D3) ? D3 >= 4352 && (D3 <= 4447 || D3 === 9001 || D3 === 9002 || 11904 <= D3 && D3 <= 12871 && D3 !== 12351 || 12880 <= D3 && D3 <= 19903 || 19968 <= D3 && D3 <= 42182 || 43360 <= D3 && D3 <= 43388 || 44032 <= D3 && D3 <= 55203 || 63744 <= D3 && D3 <= 64255 || 65040 <= D3 && D3 <= 65049 || 65072 <= D3 && D3 <= 65131 || 65281 <= D3 && D3 <= 65376 || 65504 <= D3 && D3 <= 65510 || 110592 <= D3 && D3 <= 110593 || 127488 <= D3 && D3 <= 127569 || 131072 <= D3 && D3 <= 262141) : false;
}
var j2 = BD($(), 1);
function g(D3) {
  if (typeof D3 != "string" || D3.length === 0 || (D3 = d2(D3), D3.length === 0))
    return 0;
  D3 = D3.replace((0, j2.default)(), "  ");
  let F3 = 0;
  for (let u = 0; u < D3.length; u++) {
    let C3 = D3.codePointAt(u);
    C3 <= 31 || C3 >= 127 && C3 <= 159 || C3 >= 768 && C3 <= 879 || (C3 > 65535 && u++, F3 += y2(C3) ? 2 : 1);
  }
  return F3;
}
var b = (D3) => Math.max(...D3.split(`
`).map(g));
var k = (D3) => {
  let F3 = [];
  for (let u of D3) {
    let { length: C3 } = u, t = C3 - F3.length;
    for (let E2 = 0; E2 < t; E2 += 1)
      F3.push(0);
    for (let E2 = 0; E2 < C3; E2 += 1) {
      let e = b(u[E2]);
      e > F3[E2] && (F3[E2] = e);
    }
  }
  return F3;
};
i();
var _2 = /^\d+%$/;
var z2 = { width: "auto", align: "left", contentWidth: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, horizontalPadding: 0, paddingLeftString: "", paddingRightString: "" };
var sD = (D3, F3) => {
  var C3;
  let u = [];
  for (let t = 0; t < D3.length; t += 1) {
    let E2 = (C3 = F3[t]) != null ? C3 : "auto";
    if (typeof E2 == "number" || E2 === "auto" || E2 === "content-width" || typeof E2 == "string" && _2.test(E2)) {
      u.push(c(p({}, z2), { width: E2, contentWidth: D3[t] }));
      continue;
    }
    if (E2 && typeof E2 == "object") {
      let e = c(p(p({}, z2), E2), { contentWidth: D3[t] });
      e.horizontalPadding = e.paddingLeft + e.paddingRight, u.push(e);
      continue;
    }
    throw new Error(`Invalid column width: ${JSON.stringify(E2)}`);
  }
  return u;
};
function aD(D3, F3) {
  for (let u of D3) {
    let { width: C3 } = u;
    if (C3 === "content-width" && (u.width = u.contentWidth), C3 === "auto") {
      let n = Math.min(20, u.contentWidth);
      u.width = n, u.autoOverflow = u.contentWidth - n;
    }
    if (typeof C3 == "string" && _2.test(C3)) {
      let n = Number.parseFloat(C3.slice(0, -1)) / 100;
      u.width = Math.floor(F3 * n) - (u.paddingLeft + u.paddingRight);
    }
    let { horizontalPadding: t } = u, E2 = 1, e = E2 + t;
    if (e >= F3) {
      let n = e - F3, o = Math.ceil(u.paddingLeft / t * n), B3 = n - o;
      u.paddingLeft -= o, u.paddingRight -= B3, u.horizontalPadding = u.paddingLeft + u.paddingRight;
    }
    u.paddingLeftString = u.paddingLeft ? " ".repeat(u.paddingLeft) : "", u.paddingRightString = u.paddingRight ? " ".repeat(u.paddingRight) : "";
    let r = F3 - u.horizontalPadding;
    u.width = Math.max(Math.min(u.width, r), E2);
  }
}
var G2 = () => Object.assign([], { columns: 0 });
function lD(D3, F3) {
  let u = [G2()], [C3] = u;
  for (let t of D3) {
    let E2 = t.width + t.horizontalPadding;
    C3.columns + E2 > F3 && (C3 = G2(), u.push(C3)), C3.push(t), C3.columns += E2;
  }
  for (let t of u) {
    let E2 = t.reduce((s, l) => s + l.width + l.horizontalPadding, 0), e = F3 - E2;
    if (e === 0)
      continue;
    let r = t.filter((s) => "autoOverflow" in s), n = r.filter((s) => s.autoOverflow > 0), o = n.reduce((s, l) => s + l.autoOverflow, 0), B3 = Math.min(o, e);
    for (let s of n) {
      let l = Math.floor(s.autoOverflow / o * B3);
      s.width += l, e -= l;
    }
    let a = Math.floor(e / r.length);
    for (let s = 0; s < r.length; s += 1) {
      let l = r[s];
      s === r.length - 1 ? l.width += e : l.width += a, e -= a;
    }
  }
  return u;
}
function Z(D3, F3, u) {
  let C3 = sD(u, F3);
  return aD(C3, D3), lD(C3, D3);
}
i();
i();
i();
var O2 = 10;
var U2 = (D3 = 0) => (F3) => `\x1B[${F3 + D3}m`;
var V = (D3 = 0) => (F3) => `\x1B[${38 + D3};5;${F3}m`;
var Y = (D3 = 0) => (F3, u, C3) => `\x1B[${38 + D3};2;${F3};${u};${C3}m`;
function AD() {
  let D3 = /* @__PURE__ */ new Map(), F3 = { modifier: { reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23], underline: [4, 24], overline: [53, 55], inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29] }, color: { black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39], blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39], blackBright: [90, 39], redBright: [91, 39], greenBright: [92, 39], yellowBright: [93, 39], blueBright: [94, 39], magentaBright: [95, 39], cyanBright: [96, 39], whiteBright: [97, 39] }, bgColor: { bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49], bgYellow: [43, 49], bgBlue: [44, 49], bgMagenta: [45, 49], bgCyan: [46, 49], bgWhite: [47, 49], bgBlackBright: [100, 49], bgRedBright: [101, 49], bgGreenBright: [102, 49], bgYellowBright: [103, 49], bgBlueBright: [104, 49], bgMagentaBright: [105, 49], bgCyanBright: [106, 49], bgWhiteBright: [107, 49] } };
  F3.color.gray = F3.color.blackBright, F3.bgColor.bgGray = F3.bgColor.bgBlackBright, F3.color.grey = F3.color.blackBright, F3.bgColor.bgGrey = F3.bgColor.bgBlackBright;
  for (let [u, C3] of Object.entries(F3)) {
    for (let [t, E2] of Object.entries(C3))
      F3[t] = { open: `\x1B[${E2[0]}m`, close: `\x1B[${E2[1]}m` }, C3[t] = F3[t], D3.set(E2[0], E2[1]);
    Object.defineProperty(F3, u, { value: C3, enumerable: false });
  }
  return Object.defineProperty(F3, "codes", { value: D3, enumerable: false }), F3.color.close = "\x1B[39m", F3.bgColor.close = "\x1B[49m", F3.color.ansi = U2(), F3.color.ansi256 = V(), F3.color.ansi16m = Y(), F3.bgColor.ansi = U2(O2), F3.bgColor.ansi256 = V(O2), F3.bgColor.ansi16m = Y(O2), Object.defineProperties(F3, { rgbToAnsi256: { value: (u, C3, t) => u === C3 && C3 === t ? u < 8 ? 16 : u > 248 ? 231 : Math.round((u - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(u / 255 * 5) + 6 * Math.round(C3 / 255 * 5) + Math.round(t / 255 * 5), enumerable: false }, hexToRgb: { value: (u) => {
    let C3 = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(u.toString(16));
    if (!C3)
      return [0, 0, 0];
    let { colorString: t } = C3.groups;
    t.length === 3 && (t = t.split("").map((e) => e + e).join(""));
    let E2 = Number.parseInt(t, 16);
    return [E2 >> 16 & 255, E2 >> 8 & 255, E2 & 255];
  }, enumerable: false }, hexToAnsi256: { value: (u) => F3.rgbToAnsi256(...F3.hexToRgb(u)), enumerable: false }, ansi256ToAnsi: { value: (u) => {
    if (u < 8)
      return 30 + u;
    if (u < 16)
      return 90 + (u - 8);
    let C3, t, E2;
    if (u >= 232)
      C3 = ((u - 232) * 10 + 8) / 255, t = C3, E2 = C3;
    else {
      u -= 16;
      let n = u % 36;
      C3 = Math.floor(u / 36) / 5, t = Math.floor(n / 6) / 5, E2 = n % 6 / 5;
    }
    let e = Math.max(C3, t, E2) * 2;
    if (e === 0)
      return 30;
    let r = 30 + (Math.round(E2) << 2 | Math.round(t) << 1 | Math.round(C3));
    return e === 2 && (r += 60), r;
  }, enumerable: false }, rgbToAnsi: { value: (u, C3, t) => F3.ansi256ToAnsi(F3.rgbToAnsi256(u, C3, t)), enumerable: false }, hexToAnsi: { value: (u) => F3.ansi256ToAnsi(F3.hexToAnsi256(u)), enumerable: false } }), F3;
}
var fD = AD();
var K2 = fD;
var x2 = /* @__PURE__ */ new Set(["\x1B", "\x9B"]);
var gD = 39;
var R = "\x07";
var q2 = "[";
var pD = "]";
var H = "m";
var M2 = `${pD}8;;`;
var J = (D3) => `${x2.values().next().value}${q2}${D3}${H}`;
var Q = (D3) => `${x2.values().next().value}${M2}${D3}${R}`;
var hD = (D3) => D3.split(" ").map((F3) => g(F3));
var S = (D3, F3, u) => {
  let C3 = [...F3], t = false, E2 = false, e = g(d2(D3[D3.length - 1]));
  for (let [r, n] of C3.entries()) {
    let o = g(n);
    if (e + o <= u ? D3[D3.length - 1] += n : (D3.push(n), e = 0), x2.has(n) && (t = true, E2 = C3.slice(r + 1).join("").startsWith(M2)), t) {
      E2 ? n === R && (t = false, E2 = false) : n === H && (t = false);
      continue;
    }
    e += o, e === u && r < C3.length - 1 && (D3.push(""), e = 0);
  }
  !e && D3[D3.length - 1].length > 0 && D3.length > 1 && (D3[D3.length - 2] += D3.pop());
};
var cD = (D3) => {
  let F3 = D3.split(" "), u = F3.length;
  for (; u > 0 && !(g(F3[u - 1]) > 0); )
    u--;
  return u === F3.length ? D3 : F3.slice(0, u).join(" ") + F3.slice(u).join("");
};
var dD = (D3, F3, u = {}) => {
  if (u.trim !== false && D3.trim() === "")
    return "";
  let C3 = "", t, E2, e = hD(D3), r = [""];
  for (let [o, B3] of D3.split(" ").entries()) {
    u.trim !== false && (r[r.length - 1] = r[r.length - 1].trimStart());
    let a = g(r[r.length - 1]);
    if (o !== 0 && (a >= F3 && (u.wordWrap === false || u.trim === false) && (r.push(""), a = 0), (a > 0 || u.trim === false) && (r[r.length - 1] += " ", a++)), u.hard && e[o] > F3) {
      let s = F3 - a, l = 1 + Math.floor((e[o] - s - 1) / F3);
      Math.floor((e[o] - 1) / F3) < l && r.push(""), S(r, B3, F3);
      continue;
    }
    if (a + e[o] > F3 && a > 0 && e[o] > 0) {
      if (u.wordWrap === false && a < F3) {
        S(r, B3, F3);
        continue;
      }
      r.push("");
    }
    if (a + e[o] > F3 && u.wordWrap === false) {
      S(r, B3, F3);
      continue;
    }
    r[r.length - 1] += B3;
  }
  u.trim !== false && (r = r.map((o) => cD(o)));
  let n = [...r.join(`
`)];
  for (let [o, B3] of n.entries()) {
    if (C3 += B3, x2.has(B3)) {
      let { groups: s } = new RegExp(`(?:\\${q2}(?<code>\\d+)m|\\${M2}(?<uri>.*)${R})`).exec(n.slice(o).join("")) || { groups: {} };
      if (s.code !== void 0) {
        let l = Number.parseFloat(s.code);
        t = l === gD ? void 0 : l;
      } else
        s.uri !== void 0 && (E2 = s.uri.length === 0 ? void 0 : s.uri);
    }
    let a = K2.codes.get(Number(t));
    n[o + 1] === `
` ? (E2 && (C3 += Q("")), t && a && (C3 += J(a))) : B3 === `
` && (t && a && (C3 += J(t)), E2 && (C3 += Q(E2)));
  }
  return C3;
};
function T2(D3, F3, u) {
  return String(D3).normalize().replace(/\r\n/g, `
`).split(`
`).map((C3) => dD(C3, F3, u)).join(`
`);
}
var X = (D3) => Array.from({ length: D3 }).fill("");
function P2(D3, F3) {
  let u = [], C3 = 0;
  for (let t of D3) {
    let E2 = 0, e = t.map((n) => {
      var a;
      let o = (a = F3[C3]) != null ? a : "";
      C3 += 1, n.preprocess && (o = n.preprocess(o)), b(o) > n.width && (o = T2(o, n.width, { hard: true }));
      let B3 = o.split(`
`);
      if (n.postprocess) {
        let { postprocess: s } = n;
        B3 = B3.map((l, h) => s.call(n, l, h));
      }
      return n.paddingTop && B3.unshift(...X(n.paddingTop)), n.paddingBottom && B3.push(...X(n.paddingBottom)), B3.length > E2 && (E2 = B3.length), c(p({}, n), { lines: B3 });
    }), r = [];
    for (let n = 0; n < E2; n += 1) {
      let o = e.map((B3) => {
        var h;
        let a = (h = B3.lines[n]) != null ? h : "", s = Number.isFinite(B3.width) ? " ".repeat(B3.width - g(a)) : "", l = B3.paddingLeftString;
        return B3.align === "right" && (l += s), l += a, B3.align === "left" && (l += s), l + B3.paddingRightString;
      }).join("");
      r.push(o);
    }
    u.push(r.join(`
`));
  }
  return u.join(`
`);
}
function mD(D3, F3) {
  if (!D3 || D3.length === 0)
    return "";
  let u = k(D3), C3 = u.length;
  if (C3 === 0)
    return "";
  let { stdoutColumns: t, columns: E2 } = v(F3);
  if (E2.length > C3)
    throw new Error(`${E2.length} columns defined, but only ${C3} columns found`);
  let e = Z(t, E2, u);
  return D3.map((r) => P2(e, r)).join(`
`);
}
i();
var bD = ["<", ">", "=", ">=", "<="];
function xD(D3) {
  if (!bD.includes(D3))
    throw new TypeError(`Invalid breakpoint operator: ${D3}`);
}
function wD(D3) {
  let F3 = Object.keys(D3).map((u) => {
    let [C3, t] = u.split(" ");
    xD(C3);
    let E2 = Number.parseInt(t, 10);
    if (Number.isNaN(E2))
      throw new TypeError(`Invalid breakpoint value: ${t}`);
    let e = D3[u];
    return { operator: C3, breakpoint: E2, value: e };
  }).sort((u, C3) => C3.breakpoint - u.breakpoint);
  return (u) => {
    var C3;
    return (C3 = F3.find(({ operator: t, breakpoint: E2 }) => t === "=" && u === E2 || t === ">" && u > E2 || t === "<" && u < E2 || t === ">=" && u >= E2 || t === "<=" && u <= E2)) == null ? void 0 : C3.value;
  };
}

// node_modules/.pnpm/cleye@1.2.1/node_modules/cleye/dist/index.mjs
var D2 = (r) => r.replace(/[-_ ](\w)/g, (e, t) => t.toUpperCase());
var R2 = (r) => r.replace(/\B([A-Z])/g, "-$1").toLowerCase();
var L3 = { "> 80": [{ width: "content-width", paddingLeft: 2, paddingRight: 8 }, { width: "auto" }], "> 40": [{ width: "auto", paddingLeft: 2, paddingRight: 8, preprocess: (r) => r.trim() }, { width: "100%", paddingLeft: 2, paddingBottom: 1 }], "> 0": { stdoutColumns: 1e3, columns: [{ width: "content-width", paddingLeft: 2, paddingRight: 8 }, { width: "content-width" }] } };
function T3(r) {
  let e = false;
  const n = Object.keys(r).sort((a, i2) => a.localeCompare(i2)).map((a) => {
    const i2 = r[a], s = "alias" in i2;
    return s && (e = true), { name: a, flag: i2, flagFormatted: `--${R2(a)}`, aliasesEnabled: e, aliasFormatted: s ? `-${i2.alias}` : void 0 };
  }).map((a) => (a.aliasesEnabled = e, [{ type: "flagName", data: a }, { type: "flagDescription", data: a }]));
  return { type: "table", data: { tableData: n, tableBreakpoints: L3 } };
}
var P3 = (r) => {
  var e;
  return !r || ((e = r.version) != null ? e : r.help ? r.help.version : void 0);
};
var C2 = (r) => {
  var e;
  const t = "parent" in r && ((e = r.parent) == null ? void 0 : e.name);
  return (t ? `${t} ` : "") + r.name;
};
function F2(r) {
  var e;
  const t = [];
  r.name && t.push(C2(r));
  const n = (e = P3(r)) != null ? e : "parent" in r && P3(r.parent);
  if (n && t.push(`v${n}`), t.length !== 0)
    return { id: "name", type: "text", data: `${t.join(" ")}
` };
}
function H2(r) {
  const { help: e } = r;
  if (!(!e || !e.description))
    return { id: "description", type: "text", data: `${e.description}
` };
}
function U3(r) {
  var e;
  const t = r.help || {};
  if ("usage" in t)
    return t.usage ? { id: "usage", type: "section", data: { title: "Usage:", body: Array.isArray(t.usage) ? t.usage.join(`
`) : t.usage } } : void 0;
  if (r.name) {
    const n = [], a = [C2(r)];
    if (r.flags && Object.keys(r.flags).length > 0 && a.push("[flags...]"), r.parameters && r.parameters.length > 0) {
      const { parameters: i2 } = r, s = i2.indexOf("--"), l = s > -1 && i2.slice(s + 1).some((o) => o.startsWith("<"));
      a.push(i2.map((o) => o !== "--" ? o : l ? "--" : "[--]").join(" "));
    }
    if (a.length > 1 && n.push(a.join(" ")), "commands" in r && ((e = r.commands) == null ? void 0 : e.length) && n.push(`${r.name} <command>`), n.length > 0)
      return { id: "usage", type: "section", data: { title: "Usage:", body: n.join(`
`) } };
  }
}
function V2(r) {
  var e;
  if (!("commands" in r) || !((e = r.commands) != null && e.length))
    return;
  const t = r.commands.map((a) => [a.options.name, a.options.help ? a.options.help.description : ""]);
  return { id: "commands", type: "section", data: { title: "Commands:", body: { type: "table", data: { tableData: t, tableOptions: [{ width: "content-width", paddingLeft: 2, paddingRight: 8 }] } }, indentBody: 0 } };
}
function J2(r) {
  if (!(!r.flags || Object.keys(r.flags).length === 0))
    return { id: "flags", type: "section", data: { title: "Flags:", body: T3(r.flags), indentBody: 0 } };
}
function M3(r) {
  const { help: e } = r;
  if (!e || !e.examples || e.examples.length === 0)
    return;
  let { examples: t } = e;
  if (Array.isArray(t) && (t = t.join(`
`)), t)
    return { id: "examples", type: "section", data: { title: "Examples:", body: t } };
}
function k2(r) {
  if (!("alias" in r) || !r.alias)
    return;
  const { alias: e } = r, t = Array.isArray(e) ? e.join(", ") : e;
  return { id: "aliases", type: "section", data: { title: "Aliases:", body: t } };
}
var W2 = (r) => [F2, H2, U3, V2, J2, M3, k2].map((e) => e(r)).filter((e) => Boolean(e));
var Z2 = B2.WriteStream.prototype.hasColors();
var z3 = class {
  text(e) {
    return e;
  }
  bold(e) {
    return Z2 ? `\x1B[1m${e}\x1B[22m` : e.toLocaleUpperCase();
  }
  indentText({ text: e, spaces: t }) {
    return e.replace(/^/gm, " ".repeat(t));
  }
  heading(e) {
    return this.bold(e);
  }
  section({ title: e, body: t, indentBody: n = 2 }) {
    return `${(e ? `${this.heading(e)}
` : "") + (t ? this.indentText({ text: this.render(t), spaces: n }) : "")}
`;
  }
  table({ tableData: e, tableOptions: t, tableBreakpoints: n }) {
    return mD(e.map((a) => a.map((i2) => this.render(i2))), n ? wD(n) : t);
  }
  flagParameter(e) {
    return e === Boolean ? "" : e === String ? "<string>" : e === Number ? "<number>" : Array.isArray(e) ? this.flagParameter(e[0]) : "<value>";
  }
  flagOperator(e) {
    return " ";
  }
  flagName(e) {
    const { flag: t, flagFormatted: n, aliasesEnabled: a, aliasFormatted: i2 } = e;
    let s = "";
    if (i2 ? s += `${i2}, ` : a && (s += "    "), s += n, "placeholder" in t && typeof t.placeholder == "string")
      s += `${this.flagOperator(e)}${t.placeholder}`;
    else {
      const l = this.flagParameter("type" in t ? t.type : t);
      l && (s += `${this.flagOperator(e)}${l}`);
    }
    return s;
  }
  flagDefault(e) {
    return JSON.stringify(e);
  }
  flagDescription({ flag: e }) {
    var t;
    let n = "description" in e && (t = e.description) != null ? t : "";
    if ("default" in e) {
      let { default: a } = e;
      typeof a == "function" && (a = a()), a && (n += ` (default: ${this.flagDefault(a)})`);
    }
    return n;
  }
  render(e) {
    if (typeof e == "string")
      return e;
    if (Array.isArray(e))
      return e.map((t) => this.render(t)).join(`
`);
    if ("type" in e && this[e.type]) {
      const t = this[e.type];
      if (typeof t == "function")
        return t.call(this, e.data);
    }
    throw new Error(`Invalid node type: ${JSON.stringify(e)}`);
  }
};
var w2 = /^[\w.-]+$/;
var G3 = Object.defineProperty;
var K3 = Object.defineProperties;
var Q2 = Object.getOwnPropertyDescriptors;
var x3 = Object.getOwnPropertySymbols;
var X2 = Object.prototype.hasOwnProperty;
var Y2 = Object.prototype.propertyIsEnumerable;
var A2 = (r, e, t) => e in r ? G3(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t;
var p2 = (r, e) => {
  for (var t in e || (e = {}))
    X2.call(e, t) && A2(r, t, e[t]);
  if (x3)
    for (var t of x3(e))
      Y2.call(e, t) && A2(r, t, e[t]);
  return r;
};
var v2 = (r, e) => K3(r, Q2(e));
var { stringify: d3 } = JSON;
var ee = /[|\\{}()[\]^$+*?.]/;
function b2(r) {
  const e = [];
  let t, n;
  for (const a of r) {
    if (n)
      throw new Error(`Invalid parameter: Spread parameter ${d3(n)} must be last`);
    const i2 = a[0], s = a[a.length - 1];
    let l;
    if (i2 === "<" && s === ">" && (l = true, t))
      throw new Error(`Invalid parameter: Required parameter ${d3(a)} cannot come after optional parameter ${d3(t)}`);
    if (i2 === "[" && s === "]" && (l = false, t = a), l === void 0)
      throw new Error(`Invalid parameter: ${d3(a)}. Must be wrapped in <> (required parameter) or [] (optional parameter)`);
    let o = a.slice(1, -1);
    const f = o.slice(-3) === "...";
    f && (n = a, o = o.slice(0, -3));
    const u = o.match(ee);
    if (u)
      throw new Error(`Invalid parameter: ${d3(a)}. Invalid character found ${d3(u[0])}`);
    e.push({ name: o, required: l, spread: f });
  }
  return e;
}
function $2(r, e, t, n) {
  for (let a = 0; a < e.length; a += 1) {
    const { name: i2, required: s, spread: l } = e[a], o = D2(i2);
    if (o in r)
      throw new Error(`Invalid parameter: ${d3(i2)} is used more than once.`);
    const f = l ? t.slice(a) : t[a];
    if (l && (a = e.length), s && (!f || l && f.length === 0))
      return console.error(`Error: Missing required parameter ${d3(i2)}
`), n(), process.exit(1);
    r[o] = f;
  }
}
function re(r) {
  return r === void 0 || r !== false;
}
function j3(r, e, t, n) {
  const a = p2({}, e.flags), i2 = e.version;
  i2 && (a.version = { type: Boolean, description: "Show version" });
  const { help: s } = e, l = re(s);
  l && !("help" in a) && (a.help = { type: Boolean, alias: "h", description: "Show help" });
  const o = G(a, n), f = () => {
    console.log(e.version);
  };
  if (i2 && o.flags.version === true)
    return f(), process.exit(0);
  const u = new z3(), N = l && (s == null ? void 0 : s.render) ? s.render : (c2) => u.render(c2), h = (c2) => {
    const m2 = W2(v2(p2(p2({}, e), c2 ? { help: c2 } : {}), { flags: a }));
    console.log(N(m2, u));
  };
  if (l && o.flags.help === true)
    return h(), process.exit(0);
  if (e.parameters) {
    let { parameters: c2 } = e, m2 = o._;
    const y3 = c2.indexOf("--"), O3 = c2.slice(y3 + 1), g2 = /* @__PURE__ */ Object.create(null);
    if (y3 > -1 && O3.length > 0) {
      c2 = c2.slice(0, y3);
      const E2 = o._["--"];
      m2 = m2.slice(0, -E2.length || void 0), $2(g2, b2(c2), m2, h), $2(g2, b2(O3), E2, h);
    } else
      $2(g2, b2(c2), m2, h);
    Object.assign(o._, g2);
  }
  const _3 = v2(p2({}, o), { showVersion: f, showHelp: h });
  return typeof t == "function" && t(_3), p2({ command: r }, _3);
}
function te(r, e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const a = [n.options.name], { alias: i2 } = n.options;
    i2 && (Array.isArray(i2) ? a.push(...i2) : a.push(i2));
    for (const s of a) {
      if (t.has(s))
        throw new Error(`Duplicate command name found: ${d3(s)}`);
      t.set(s, n);
    }
  }
  return t.get(r);
}
function ae(r, e, t = process.argv.slice(2)) {
  if (!r)
    throw new Error("Options is required");
  if ("name" in r && (!r.name || !w2.test(r.name)))
    throw new Error(`Invalid script name: ${d3(r.name)}`);
  const n = t[0];
  if (r.commands && w2.test(n)) {
    const a = te(n, r.commands);
    if (a)
      return j3(a.options.name, v2(p2({}, a.options), { parent: r }), a.callback, t.slice(1));
  }
  return j3(void 0, r, e, t);
}

// src/cli.ts
import { readFileSync } from "fs";
var pkgFile = new URL("../package.json", import.meta.url);
var pkgJson = readFileSync(pkgFile, "utf8");
var pkg = JSON.parse(pkgJson);
var argv = ae({
  name: "runp",
  parameters: [
    "<commands...>"
  ],
  flags: {
    outputLength: {
      alias: "n",
      type: Number,
      description: "Maximum number of lines for each command output",
      default: 10
    },
    keepOutput: {
      alias: "k",
      type: Boolean,
      description: "Keep output of successful commands visible",
      default: false
    },
    forever: {
      alias: "f",
      type: Boolean,
      description: `Task will run forever. It won't display a spinner but a different symbol instead`,
      default: false
    },
    flattenNpmScripts: {
      alias: "m",
      type: Boolean,
      description: "If npm scripts call nested npm scripts which also use runp, flatten them into one task list",
      default: true
    }
  },
  version: pkg.version
});
runp({
  commands: argv._.commands,
  ...argv.flags
}).catch((e) => {
  console.error(e);
});
