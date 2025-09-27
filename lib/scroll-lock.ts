let scrollLockCount = 0;
let originalBodyOverflow: string | null = null;
let originalHtmlOverflow: string | null = null;

const setOverflowHidden = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (originalBodyOverflow === null) {
    originalBodyOverflow = document.body.style.overflow;
  }

  if (originalHtmlOverflow === null) {
    originalHtmlOverflow = document.documentElement.style.overflow;
  }

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
};

const restoreOverflow = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (originalBodyOverflow !== null) {
    document.body.style.overflow = originalBodyOverflow;
    originalBodyOverflow = null;
  }

  if (originalHtmlOverflow !== null) {
    document.documentElement.style.overflow = originalHtmlOverflow;
    originalHtmlOverflow = null;
  }
};

export const acquireScrollLock = () => {
  if (typeof document === "undefined") {
    return () => {};
  }

  if (scrollLockCount === 0) {
    setOverflowHidden();
  }

  scrollLockCount += 1;

  return () => {
    if (scrollLockCount <= 0) {
      return;
    }

    scrollLockCount -= 1;

    if (scrollLockCount === 0) {
      restoreOverflow();
    }
  };
};
