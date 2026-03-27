export function assertLenisWindowGlobalIsNotAvailable() {
  type WindowHasPohviiLenis = Window extends { __pohviiLenis: unknown }
    ? true
    : false;
  const assertFalse = <T extends false>(_value: T) => undefined;

  return assertFalse<WindowHasPohviiLenis>(false);
}
