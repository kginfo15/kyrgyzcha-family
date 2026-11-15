"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DICTS, JA, type Dict } from "@/lib/i18n";
import type { UiLang } from "@/lib/types";

type I18n = { d: Dict; uiLang: UiLang; ja: boolean };

const Ctx = createContext<I18n>({ d: DICTS.ky, uiLang: "ky", ja: false });

export function I18nProvider({ uiLang, ja, children }: { uiLang: UiLang; ja: boolean; children: ReactNode }) {
  return <Ctx.Provider value={{ d: DICTS[uiLang], uiLang, ja }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  return useContext(Ctx);
}

/**
 * 画面の文言（キルギス語 / ロシア語）。日本語補助がオンなら、下に日本語を小さく添える。
 */
export function Tx({ k }: { k: keyof Dict }) {
  const { d, ja } = useI18n();
  return (
    <span className="tx">
      {d[k]}
      {ja && <JaGloss>{JA[k]}</JaGloss>}
    </span>
  );
}

/** 日本語補助の小さな注記（オフのときは何も出さない） */
export function JaGloss({ children, force = false }: { children: ReactNode; force?: boolean }) {
  const { ja } = useI18n();
  if (!ja && !force) return null;
  if (children == null || children === "") return null;
  return (
    <span className="ja-gloss" lang="ja">
      {children}
    </span>
  );
}
