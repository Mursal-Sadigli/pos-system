export function printOrderReceipt(order: any) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
      <head>
        <title>Sifariş #${order.id}</title>
        <style>
          body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h2 { margin: 0 0 5px 0; }
          .header p { margin: 2px 0; font-size: 12px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
          .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; text-align: right; font-size: 16px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Kvantum POS</h2>
          <p>Sifariş #${order.id}</p>
          <p>Tarix: ${order.date} ${order.time}</p>
          <p>Kassir: ${order.cashier}</p>
        </div>
        
        <div class="items">
          ${order.items?.map((item: any) => `
            <div class="item">
              <span>${item.name} x${item.qty}</span>
              <span>AZN ${(item.qty * item.price).toFixed(2)}</span>
            </div>
          `).join('') || ''}
        </div>
        
        <div class="total">
          Cəmi: AZN ${Number(order.amount).toFixed(2)}<br>
          <span style="font-size: 12px; font-weight: normal;">Ödəniş növü: ${order.payment}</span>
        </div>
        
        <div class="footer">
          Bizi seçdiyiniz üçün təşəkkürlər!<br>
          <span style="font-size: 10px;">Müştəri nüsxəsi</span>
        </div>
        
        <script>
          window.onload = function() { 
            setTimeout(() => {
              window.print(); 
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
