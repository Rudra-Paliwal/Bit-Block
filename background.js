chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "bb_encrypt_selection",
    title: "Bit-Block: Encrypt selection",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "bb_decrypt_clipboard",
    title: "Bit-Block: Decrypt clipboard",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "bb_encrypt_selection") {
    const text = info.selectionText || "";
    const url = chrome.runtime.getURL(`index.html#prefill=${encodeURIComponent(text)}`);
    chrome.tabs.create({ url });
  }
  if (info.menuItemId === "bb_decrypt_clipboard") {
    const url = chrome.runtime.getURL("index.html#fromClipboard=true");
    chrome.tabs.create({ url });
  }
});
