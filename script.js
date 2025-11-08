const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = {
  to: buf => btoa(String.fromCharCode(...new Uint8Array(buf))),
  from: str => Uint8Array.from(atob(str), c => c.charCodeAt(0)).buffer
};

function randBytes(len) {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return a;
}

async function deriveKey(pass, salt, iters) {
  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(pass), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iters },
    keyMat,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptBytes(bytes, pass, iters) {
  const salt = randBytes(16);
  const iv = randBytes(12);
  const key = await deriveKey(pass, salt, iters);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
  return { v: 1, alg: 'AES-GCM', iters, salt: b64.to(salt), iv: b64.to(iv), ct: b64.to(ct) };
}

async function decryptToBytes(pkg, pass) {
  const salt = b64.from(pkg.salt);
  const iv = b64.from(pkg.iv);
  let iters = pkg.iters | 0;
  if (iters > 10000000) {
    iters = 10000000;
    flash('Warning: Iteration count in file was too high, capped at 10,000,000.', 'info');
  }
  const key = await deriveKey(pass, new Uint8Array(salt), iters);
  const ct = b64.from(pkg.ct);
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, key, ct);
    return pt;
  } catch (e) {
    throw new Error('Decryption failed. Wrong passphrase or corrupted data.');
  }
}

const $ = sel => document.querySelector(sel);
const passEl = $('#pass');
const itersEl = $('#iters');
const showPass = $('#showPass');
const plainEl = $('#plain');
const outEl = $('#out');
const btnEncText = $('#btnEncText');
const btnDecText = $('#btnDecText');
const btnClear = $('#btnClear');
const btnCopy = $('#btnCopy');
const btnCopyPlain = $('#btnCopyPlain');
const btnDownloadJson = $('#btnDownloadJson');

if (btnEncText) {
  const textButtons = [btnEncText, btnDecText, btnClear, btnCopy, btnCopyPlain, btnDownloadJson];
  showPass.addEventListener('change', () => {
    passEl.type = showPass.checked ? 'text' : 'password';
  });
  btnClear.onclick = () => {
    plainEl.value = '';
    outEl.textContent = '';
  };
  function getValidIterations(el) {
    let iters = parseInt(el.value) || 250000;
    if (iters < 10000) iters = 10000;
    if (iters > 10000000) {
      iters = 10000000;
      flash('Iterations capped at 10,000,000.', 'info');
    }
    el.value = iters;
    return iters;
  }
  btnEncText.onclick = async () => {
    const pass = passEl.value;
    const iters = getValidIterations(itersEl);
    const text = plainEl.value || '';
    if (!pass) {
      flash('Enter a passphrase.', 'error');
      return;
    }
    setBusy(true, textButtons, 'Encrypting…');
    try {
      const pkg = await encryptBytes(enc.encode(text), pass, iters);
      outEl.textContent = JSON.stringify(pkg, null, 2);
      flash('Encryption successful!', 'success');
    } catch (e) {
      flash(e.message, 'error');
    } finally {
      setBusy(false, textButtons);
    }
  };
btnDecText.onclick = async () => {
  const pass = passEl.value;
  if (!pass) {
    flash('Enter a passphrase.', 'error');
    return;
  }
  let pkg;
  try {
    pkg = JSON.parse(outEl.textContent.trim());
  } catch (e) {
    flash('Output is not valid JSON package.', 'error');
    return;
  }
  setBusy(true, textButtons, 'Decrypting…');
  try {
    const pt = await decryptToBytes(pkg, pass);
    plainEl.value = '';
    outEl.textContent = dec.decode(pt);
    flash('Decryption successful!', 'success');
  } catch (e) {
    flash(e.message, 'error');
  } finally {
    setBusy(false, textButtons);
  }
};
  btnCopy.onclick = async () => {
    if (!outEl.textContent) return;
    await navigator.clipboard.writeText(outEl.textContent);
    flash('Copied output to clipboard', 'success');
  };
  btnCopyPlain.onclick = async () => {
    if (!plainEl.value) return;
    await navigator.clipboard.writeText(plainEl.value);
    flash('Copied plaintext to clipboard', 'success');
  };
  btnDownloadJson.onclick = () => {
    if (!outEl.textContent) return;
    const blob = new Blob([outEl.textContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encrypted.secure.json';
    a.click();
    URL.revokeObjectURL(url);
  };
}

const fileEl = $('#file');
const fpassEl = $('#fpass');
const fitersEl = $('#fiters');
const fstatus = $('#fstatus');
const btnEncFile = $('#btnEncFile');
const btnDecFile = $('#btnDecFile');

if (btnEncFile) {
  const fileButtons = [btnEncFile, btnDecFile];
  const fShowPass = $('#showPass');
  if (fShowPass) {
    fShowPass.addEventListener('change', () => {
      fpassEl.type = fShowPass.checked ? 'text' : 'password';
    });
  }
  function getValidFileIterations(el) {
    let iters = parseInt(el.value) || 250000;
    if (iters < 10000) iters = 10000;
    if (iters > 10000000) {
      iters = 10000000;
      flash('Iterations capped at 10,000,000.', 'info');
    }
    el.value = iters;
    return iters;
  }
  btnEncFile.onclick = async () => {
    const f = fileEl.files?.[0];
    if (!f) {
      flash('Choose a file first.', 'error');
      return;
    }
    const pass = fpassEl.value;
    if (!pass) {
      flash('Enter a passphrase.', 'error');
      return;
    }
    const iters = getValidFileIterations(fitersEl);
    setBusy(true, fileButtons, 'Encrypting…');
    fstatus.textContent = 'Reading file…';
    try {
      const buf = await f.arrayBuffer();
      fstatus.textContent = 'Encrypting… (this may take a moment)';
      const pkg = await encryptBytes(buf, pass, iters);
      const json = JSON.stringify({ filename: f.name, ...pkg }, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = f.name + '.secure.json';
      a.click();
      URL.revokeObjectURL(url);
      fstatus.textContent = 'Done. Saved ' + a.download;
      flash('File encryption successful!', 'success');
    } catch (e) {
      flash(e.message, 'error');
      fstatus.textContent = 'Encryption failed.';
    } finally {
      setBusy(false, fileButtons);
    }
  };
  btnDecFile.onclick = async () => {
    const f = fileEl.files?.[0];
    if (!f) {
      flash('Select the .secure.json file produced earlier.', 'error');
      return;
    }
    const pass = fpassEl.value;
    if (!pass) {
      flash('Enter a passphrase.', 'error');
      return;
    }
    setBusy(true, fileButtons, 'Decrypting…');
    fstatus.textContent = 'Reading file…';
    try {
      const text = await f.text();
      const pkg = JSON.parse(text);
      if (pkg.alg !== 'AES-GCM') {
        throw new Error('Unsupported package type.');
      }
      fstatus.textContent = 'Decrypting… (this may take a moment)';
      const pt = await decryptToBytes(pkg, pass);
      const outName = (pkg.filename || 'decrypted.bin');
      const blob = new Blob([pt]);
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = outName.replace(/\.secure\.json$/i, '');
      a.click();
      URL.revokeObjectURL(url);
      fstatus.textContent = 'Done. Saved ' + a.download;
      flash('File decryption successful!', 'success');
    } catch (e) {
      console.error(e);
      flash(e.message || 'Failed to decrypt', 'error');
      fstatus.textContent = 'Decryption failed.';
    } finally {
      setBusy(false, fileButtons);
    }
  };
}

function flash(msg, type = 'info') {
  const d = document.createElement('div');
  d.textContent = msg;
  d.className = `flash ${type}`;
  document.body.appendChild(d);
  requestAnimationFrame(() => {
    d.classList.add('show');
  });
  setTimeout(() => {
    d.classList.remove('show');
    setTimeout(() => d.remove(), 250);
  }, 2000);
}

function setBusy(isBusy, btns, workingText = 'Working…') {
  btns.forEach(btn => {
    if (!btn) return;
    btn.disabled = isBusy;
    if (isBusy) {
      btn.classList.add('working');
      btn.dataset.oldText = btn.textContent;
      btn.textContent = workingText;
    } else {
      btn.classList.remove('working');
      if (btn.dataset.oldText) {
        btn.textContent = btn.dataset.oldText;
      }
    }
  });
}
