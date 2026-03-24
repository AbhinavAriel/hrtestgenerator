import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import type { CSSProperties, HTMLAttributes, RefObject } from "react";

interface UseAssessmentSecurityProps {
  enabled?: boolean;
  submittedRef?: RefObject<boolean>;
  onViolation?: (count: number) => void;
  onAutoSubmit?: () => void;
  maxWarnings?: number;
  warnCooldownMs?: number;
  blockSelection?: boolean;
  blockCopy?: boolean;
  blockContextMenu?: boolean;
  blockDevtoolsShortcuts?: boolean;
  detectTabSwitch?: boolean;
  blockScreenshot?: boolean;
}

interface UseAssessmentSecurityReturn {
  containerProps: HTMLAttributes<HTMLDivElement>;
}

const isDevtoolsShortcut = (e: KeyboardEvent): boolean => {
  const key = (e.key || "").toLowerCase();
  if (e.key === "F12") return true;
  if (e.ctrlKey && e.shiftKey && (key === "i" || key === "j" || key === "c")) return true;
  if (e.ctrlKey && (key === "u" || key === "s" || key === "p")) return true;
  if (e.metaKey && (key === "u" || key === "s" || key === "p")) return true;
  return false;
};

const isScreenshotKey = (e: KeyboardEvent): boolean => {
  // Windows / Linux: PrintScreen, Alt+PrintScreen
  if (e.key === "PrintScreen") return true;
  // macOS: Cmd+Shift+3 (full), Cmd+Shift+4 (area), Cmd+Shift+5 (tool)
  if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) return true;
  return false;
};

export function useAssessmentSecurity({
  enabled = true,
  submittedRef,
  onViolation,
  onAutoSubmit,
  maxWarnings = 10,
  warnCooldownMs = 12000,
  blockSelection = true,
  blockCopy = true,
  blockContextMenu = true,
  blockDevtoolsShortcuts = true,
  detectTabSwitch = true,
  blockScreenshot = true,
}: UseAssessmentSecurityProps): UseAssessmentSecurityReturn {

  const warningCountRef = useRef<number>(0);
  const lastWarnAtRef   = useRef<number>(0);

  const warn = (message: string) => {
    const now = Date.now();
    if (now - lastWarnAtRef.current < warnCooldownMs) return;
    lastWarnAtRef.current = now;
    toast.error(message);
  };

  const registerViolation = (message: string) => {
    if (!enabled) return;
    if (submittedRef?.current) return;

    warningCountRef.current += 1;
    onViolation?.(warningCountRef.current);

    const remaining = maxWarnings - warningCountRef.current;

    if (remaining <= 0) {
      warn("Too many violations. Submitting your test now.");
      onAutoSubmit?.();
      return;
    }

    warn(`${message} (${remaining} warning${remaining === 1 ? "" : "s"} left)`);
  };

  // ── Patch getDisplayMedia to block screen capture / screen share ──────────
  useEffect(() => {
    if (!enabled || !blockScreenshot) return;
    if (!navigator?.mediaDevices?.getDisplayMedia) return;

    const original = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);

    navigator.mediaDevices.getDisplayMedia = async (...args) => {
      registerViolation("Screen capture is not allowed during the test");
      try {
        const stream = await original(...args);
        // Stop all tracks immediately so no frame is actually captured
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // User cancelled or permission denied — still a violation, already registered
      }
      throw new DOMException("Screen capture blocked during assessment.", "NotAllowedError");
    };

    return () => {
      navigator.mediaDevices.getDisplayMedia = original;
    };
  }, [enabled, blockScreenshot]);

  // ── Keyboard + clipboard + visibility listeners ───────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const onCopy = (e: ClipboardEvent) => {
      if (blockCopy) {
        e.preventDefault();
        registerViolation("Copy is disabled during the test");
      }
    };

    const onCut = (e: ClipboardEvent) => {
      if (blockCopy) {
        e.preventDefault();
        registerViolation("Cut is disabled during the test");
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      if (blockCopy) {
        e.preventDefault();
        registerViolation("Paste is disabled during the test");
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      if (blockContextMenu) {
        e.preventDefault();
        registerViolation("Right-click is disabled during the test");
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // ── Screenshot keys ──
      if (blockScreenshot && isScreenshotKey(e)) {
        e.preventDefault();
        e.stopPropagation();
        registerViolation("Screenshots are not allowed during the test");
        return;
      }

      // ── Devtools shortcuts ──
      if (blockDevtoolsShortcuts && isDevtoolsShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
        registerViolation("Developer tools / restricted shortcut detected");
      }

      // ── Copy/paste shortcuts ──
      if (blockCopy) {
        const key = (e.key || "").toLowerCase();
        if ((e.ctrlKey || e.metaKey) && (key === "c" || key === "x" || key === "v")) {
          e.preventDefault();
          e.stopPropagation();
          registerViolation("Copy/paste shortcuts are disabled during the test");
        }
      }
    };

    const onVisibilityChange = () => {
      if (!detectTabSwitch) return;
      if (document.hidden) {
        registerViolation("Tab switching is not allowed during the test");
      }
    };

    const onBlur = () => {
      if (!detectTabSwitch) return;
      registerViolation("Leaving the test window is not allowed");
    };

    const onSelectStart = (e: Event) => {
      if (!blockSelection) return;
      e.preventDefault();
    };

    document.addEventListener("copy",        onCopy);
    document.addEventListener("cut",         onCut);
    document.addEventListener("paste",       onPaste);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown",     onKeyDown, true);

    if (detectTabSwitch) {
      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener("blur", onBlur);
    }

    if (blockSelection) {
      document.addEventListener("selectstart", onSelectStart);
    }

    return () => {
      document.removeEventListener("copy",        onCopy);
      document.removeEventListener("cut",         onCut);
      document.removeEventListener("paste",       onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown",     onKeyDown, true);

      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);

      document.removeEventListener("selectstart", onSelectStart);
    };

  }, [
    enabled,
    submittedRef,
    blockCopy,
    blockContextMenu,
    blockDevtoolsShortcuts,
    detectTabSwitch,
    blockSelection,
    blockScreenshot,
    maxWarnings,
    warnCooldownMs,
  ]);

  const style: CSSProperties | undefined = blockSelection
    ? {
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
      }
    : undefined;

  const containerProps: HTMLAttributes<HTMLDivElement> = style
    ? { style }
    : {};

  return {
    containerProps,
  };
}