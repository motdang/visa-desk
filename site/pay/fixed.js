// fixed.js — a PromptPay QR for one fixed price.
//
//   <div data-payfixed data-payee="0988239210" data-amount="2000" data-ref="CMVD-EST"><div class="qr"></div></div>
//   <script type="module" src="/pay/fixed.js"></script>
import { promptPayPayload } from './promptpay.js'
import { qrToSvg } from './qr.js'

for (const el of document.querySelectorAll('[data-payfixed]')) {
  const baht = parseInt(el.dataset.amount, 10)
  const box = el.querySelector('.qr')
  if (!baht || !box) continue
  box.innerHTML = qrToSvg(promptPayPayload({ payeeId: el.dataset.payee, satang: baht * 100, merchantName: 'NaNoBotCo', ref: el.dataset.ref || 'PAY' }),
    { ecl: 'M', border: 4, scale: 6, dark: '#000', light: '#fff', title: `PromptPay ${baht} THB` })
}
