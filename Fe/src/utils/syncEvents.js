// Utility for real-time synchronization between Admin and Shop / Client pages
// Supports both in-tab component communication and cross-tab/window updates

const SYNC_CHANNEL_NAME = "stationery_sync_channel";
const STORAGE_KEY = "stationery:product_last_updated";

let broadcastChannel = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (e) {
  // BroadcastChannel not available
}

/**
 * Call this when products or categories are added, edited, toggled, or deleted in Admin.
 */
export const notifyProductChange = () => {
  if (typeof window === "undefined") return;
  const timestamp = Date.now().toString();

  // 1. In-tab custom event
  window.dispatchEvent(
    new CustomEvent("stationery:product_changed", { detail: { timestamp } })
  );

  // 2. Cross-tab BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: "PRODUCT_CHANGED", timestamp });
    } catch (e) {
      // ignore
    }
  }

  // 3. Cross-tab localStorage event
  try {
    localStorage.setItem(STORAGE_KEY, timestamp);
  } catch (e) {
    // ignore
  }
};

/**
 * Listen for product / category updates to reload data without pressing F5.
 * @param {Function} callback Function to trigger data re-fetch.
 * @returns {Function} Unsubscribe function to clean up listeners.
 */
export const onProductChange = (callback) => {
  if (typeof window === "undefined" || typeof callback !== "function") {
    return () => {};
  }

  const handleEvent = () => {
    callback();
  };

  // 1. In-tab custom event
  window.addEventListener("stationery:product_changed", handleEvent);

  // 2. BroadcastChannel
  let bc = null;
  try {
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      bc.onmessage = (msg) => {
        if (msg.data?.type === "PRODUCT_CHANGED") {
          callback();
        }
      };
    }
  } catch (e) {}

  // 3. LocalStorage storage event across browser tabs
  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);

  // 4. Focus event when user switches back to this tab
  const handleFocus = () => {
    callback();
  };
  window.addEventListener("focus", handleFocus);

  // Cleanup
  return () => {
    window.removeEventListener("stationery:product_changed", handleEvent);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("focus", handleFocus);
    if (bc) {
      bc.close();
    }
  };
};
