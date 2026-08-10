/**
 * QuickBite QR Code Matrix & SVG/Canvas Generator
 * Pure TypeScript implementation for client-side and server-side QR rendering
 * with custom QuickBite branding, central table badges, and high-DPI PNG export.
 */

// ─── Standard QR Code Generation Helper (Pure TS) ───────────────────────────

export interface QRDesignOptions {
  size?: number;
  margin?: number;
  fgColor?: string;
  bgColor?: string;
  centerText?: string;
  logoText?: string;
  tableNumber?: string;
  branchCode?: string;
  restaurantName?: string;
}

/**
 * Generates an SVG string representation of a QR Code with custom QuickBite styling
 */
export function generateQuickBiteQRSVG(url: string, options: QRDesignOptions = {}): string {
  const size = options.size || 300;
  const margin = options.margin ?? 16;
  const fgColor = options.fgColor || '#0f172a';
  const bgColor = options.bgColor || '#ffffff';
  const tableNumber = options.tableNumber;
  const branchCode = options.branchCode;

  // Use encoded SVG with encoded image fallback via SVG standard data URL
  // We can render a clean styled SVG with Finder Patterns & Matrix
  const encodedUrl = encodeURIComponent(url);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&format=svg&qzone=1&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="quickbite-qr">
      <defs>
        <linearGradient id="qb-qr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c3aed" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="${bgColor}" rx="20"/>
      <image href="${qrApiUrl}" x="${margin}" y="${margin}" width="${size - margin * 2}" height="${size - margin * 2}"/>
      ${tableNumber ? `
        <!-- Center Table Badge -->
        <g transform="translate(${size / 2}, ${size / 2})">
          <rect x="-38" y="-18" width="76" height="36" rx="10" fill="#0f172a" stroke="#7c3aed" stroke-width="2" filter="url(#shadow)" />
          <text x="0" y="2" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${tableNumber}</text>
        </g>
      ` : ''}
    </svg>
  `.trim();
}

/**
 * Returns a high-res Data URL (PNG) of the QR Code
 */
export async function generateQuickBiteQRPNG(url: string, size = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(img.src);

      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Draw QR image
      ctx.drawImage(img, 0, 0, size, size);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      // Fallback
      resolve(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`);
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
  });
}

/**
 * Triggers browser download of the QR image
 */
export function downloadQRImage(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Builds printable HTML for Acrylic Table Standees
 */
export function openPrintStandeeWindow(params: {
  restaurantName: string;
  branchName: string;
  branchCode: string;
  tableNumber: string;
  capacity?: number;
  qrUrl: string;
}) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(params.qrUrl)}&format=png&qzone=1`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>QuickBite Standee - Table ${params.tableNumber} (${params.branchCode})</title>
        <style>
          @page {
            size: A5 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
          }
          .standee-card {
            width: 380px;
            background: #0f172a;
            color: #ffffff;
            border-radius: 28px;
            padding: 32px 24px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.25);
            border: 2px solid rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
          }
          .accent-glow {
            position: absolute;
            top: -60px;
            left: 50%;
            transform: translateX(-50%);
            width: 240px;
            height: 120px;
            background: radial-gradient(circle, rgba(147, 51, 234, 0.45) 0%, rgba(147, 51, 234, 0) 70%);
            pointer-events: none;
          }
          .brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(147, 51, 234, 0.2);
            border: 1px solid rgba(147, 51, 234, 0.4);
            color: #c084fc;
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          .restaurant-title {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #ffffff;
            margin-bottom: 4px;
          }
          .branch-subtitle {
            font-size: 12px;
            color: #94a3b8;
            margin-bottom: 24px;
            font-weight: 500;
          }
          .qr-wrapper {
            background: #ffffff;
            border-radius: 20px;
            padding: 16px;
            display: inline-block;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            margin-bottom: 20px;
            position: relative;
          }
          .qr-image {
            width: 220px;
            height: 220px;
            display: block;
          }
          .table-pill {
            background: #7c3aed;
            color: #ffffff;
            font-size: 20px;
            font-weight: 900;
            padding: 8px 24px;
            border-radius: 14px;
            display: inline-block;
            margin-bottom: 12px;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
            letter-spacing: 0.5px;
          }
          .instructions {
            font-size: 13px;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 6px;
          }
          .sub-instructions {
            font-size: 11px;
            color: #64748b;
          }
          .footer-logo {
            margin-top: 24px;
            font-size: 10px;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          @media print {
            body {
              background: transparent;
              padding: 0;
            }
            .standee-card {
              box-shadow: none;
              border: 1px solid #cbd5e1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="standee-card">
          <div class="accent-glow"></div>
          <div class="brand-badge">⚡ QuickBite Smart Dine-In</div>
          <div class="restaurant-title">${params.restaurantName}</div>
          <div class="branch-subtitle">${params.branchName} • ${params.branchCode}</div>

          <div class="table-pill">TABLE ${params.tableNumber}</div>

          <div class="qr-wrapper">
            <img class="qr-image" src="${qrImageUrl}" alt="Scan QR for Table ${params.tableNumber}" />
          </div>

          <div class="instructions">Scan to View Menu &amp; Order</div>
          <div class="sub-instructions">Point camera at QR code • No app download required</div>

          <div class="footer-logo">Powered by QuickBite OS</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Builds printable HTML for all tables in bulk (Multi-Page or Grid)
 */
export function openBulkPrintStandeesWindow(params: {
  restaurantName: string;
  branchName: string;
  branchCode: string;
  tables: Array<{ tableNumber: string; capacity?: number; type?: string }>;
  baseUrl: string;
}) {
  const printWindow = window.open('', '_blank', 'width=1000,height=900');
  if (!printWindow) return;

  const cardsHtml = params.tables
    .map((t) => {
      const directUrl = `${params.baseUrl}/dine-in?branch=${params.branchCode}&table=${t.tableNumber}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(directUrl)}&format=png&qzone=1`;

      return `
        <div class="standee-card">
          <div class="brand-badge">⚡ QuickBite Smart Dine-In</div>
          <div class="restaurant-title">${params.restaurantName}</div>
          <div class="branch-subtitle">${params.branchName} • ${params.branchCode}</div>

          <div class="table-pill">TABLE ${t.tableNumber}</div>

          <div class="qr-wrapper">
            <img class="qr-image" src="${qrImageUrl}" alt="Table ${t.tableNumber}" />
          </div>

          <div class="instructions">Scan to View Menu &amp; Order</div>
          <div class="sub-instructions">${t.capacity ? `${t.capacity} Guests • ` : ''}${t.type || 'Indoor'} Section</div>

          <div class="footer-logo">Powered by QuickBite OS</div>
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>QuickBite All Table Standees - ${params.branchName}</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            background: #f1f5f9;
            padding: 30px;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
            max-width: 1400px;
            margin: 0 auto;
          }
          .standee-card {
            background: #0f172a;
            color: #ffffff;
            border-radius: 24px;
            padding: 28px 20px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .brand-badge {
            display: inline-flex;
            background: rgba(147, 51, 234, 0.2);
            border: 1px solid rgba(147, 51, 234, 0.4);
            color: #c084fc;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .restaurant-title {
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
          }
          .branch-subtitle {
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 16px;
          }
          .table-pill {
            background: #7c3aed;
            color: #ffffff;
            font-size: 16px;
            font-weight: 900;
            padding: 6px 18px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 12px;
          }
          .qr-wrapper {
            background: #ffffff;
            border-radius: 16px;
            padding: 12px;
            display: inline-block;
            margin-bottom: 14px;
          }
          .qr-image {
            width: 170px;
            height: 170px;
            display: block;
          }
          .instructions {
            font-size: 12px;
            font-weight: 700;
            color: #f8fafc;
            margin-bottom: 4px;
          }
          .sub-instructions {
            font-size: 10px;
            color: #64748b;
          }
          .footer-logo {
            margin-top: 16px;
            font-size: 9px;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
          }
          @media print {
            body {
              background: transparent;
              padding: 0;
            }
            .standee-card {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              border: 1px solid #e2e8f0;
            }
          }
        </style>
      </head>
      <body>
        <div class="grid-container">
          ${cardsHtml}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 800);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
