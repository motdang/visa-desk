// fixed.js — a PromptPay QR for one fixed price, and the slip check behind it.
//
//   <div data-payfixed data-payee="0988239210" data-amount="2000" data-ref="CMVD-EST"
//        data-verify="https://api.chiangmaivisadesk.com/pay/fixed" data-item="plan" data-into="#f-notes">
//     <div class="qr"></div><p>… <span class="later">the reply asks for the slip.</span></p></div>
//   <script type="module" src="/pay/fixed.js"></script>
//
// With data-verify, the box asks the server whether the slip check is on; if it is,
// the payer uploads the slip and SlipOK confirms it. The server checks its own price
// for data-item, not data-amount. On a paid slip the reference goes into data-into.
import { promptPayPayload } from './promptpay.js'
import { qrToSvg } from './qr.js'

const ERR = { nofile: 'Choose the slip picture first.', unread: 'That picture is not a readable bank slip.',
  amount: 'The slip shows a different amount.', receiver: 'The slip shows a different receiver.',
  used: 'That slip has paid already.', late: 'That slip is too old to check.',
  service: 'The slip check is not answering. Try again in a minute.' }

function slipBox(el) {
  const verify = el.dataset.verify, item = el.dataset.item
  if (!verify || !item) return
  fetch(verify).then((r) => r.json()).then((j) => {
    if (!j.on) return
    el.querySelectorAll('.later').forEach((s) => { s.hidden = true })
    const f = document.createElement('form')
    f.className = 'slipf'
    f.innerHTML = `<label>After paying, upload the slip from your banking app:
 <input type="file" name="slip" accept="image/*" required></label>
<button class="btn" type="submit" style="margin-top:.5rem">Check my payment</button>
<p class="msg" role="status" aria-live="polite"></p>`
    el.appendChild(f)
    f.addEventListener('submit', async (e) => {
      e.preventDefault()
      const msg = f.querySelector('.msg'), file = f.slip.files[0]
      if (!file) { msg.textContent = ERR.nofile; return }
      msg.textContent = 'Checking…'
      const fd = new FormData(); fd.append('slip', file); fd.append('item', item)
      try {
        const r = await (await fetch(verify, { method: 'POST', body: fd })).json()
        if (!r.ok) { msg.textContent = ERR[r.why] || ERR.unread; return }
        msg.textContent = `Paid. Your reference is ${r.ref}. It is added to the form; send the form now.`
        f.querySelector('button').disabled = true
        const into = el.dataset.into && document.querySelector(el.dataset.into)
        if (into) into.value = `Paid ฿${Number(r.amount).toLocaleString('en-US')}, reference ${r.ref}.\n` + into.value
      } catch { msg.textContent = ERR.service }
    })
  }).catch(() => {})
}

for (const el of document.querySelectorAll('[data-payfixed]')) {
  const baht = parseInt(el.dataset.amount, 10)
  const box = el.querySelector('.qr')
  if (!baht || !box) continue
  box.innerHTML = qrToSvg(promptPayPayload({ payeeId: el.dataset.payee, satang: baht * 100, merchantName: 'NaNoBotCo', ref: el.dataset.ref || 'PAY' }),
    { ecl: 'M', border: 4, scale: 6, dark: '#000', light: '#fff', title: `PromptPay ${baht} THB` })
  slipBox(el)
}
