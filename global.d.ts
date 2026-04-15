import type en from "./messages/en.json";

type Messages = typeof en;

declare global {
  // Use type safe message keys with `next-intl`
  // oxlint-disable-next-line typescript/no-empty-object-type
  interface IntlMessages extends Messages {}
}
