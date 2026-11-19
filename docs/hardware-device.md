# QuickBite Partner Hardware & Terminal Guidelines

> [!NOTE]
> **Architecture Update:**
> Proprietary custom POS billing machines, card ingestion slots, and physical dining tokens have been **removed**. QuickBite is a **Dedicated Destination & Trending Food Pre-Booking Platform**. Partner hotels operate using standard, cost-effective commercial off-the-shelf (COTS) devices without proprietary hardware locks.

---

## 1. Streamlined Hardware Deployment

QuickBite requires zero proprietary hardware. All hotel partner operations run seamlessly over the web via Progressive Web Apps (PWAs).

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOTEL PARTNER OPERATIONAL SURFACES                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [FRONT DESK / WELCOME HOST]                 [KITCHEN / PREPARATION AREA]  │
│   • Any 10"–12" iPad or Android Tablet        • Wall-Mounted 15"–24" Tablet │
│   • Runs Hotel Partner Portal (PWA)           • Shows Consolidated 7:00 PM  │
│   • 1-Tap QR Scan / VIP Check-in                Kitchen Batch Prep Sheet    │
│   • Escorts Guests to Reserved Tables         • Exact portion forecast      │
│                                                 (Zero food waste)           │
│                                                                             │
│   [OPTIONAL: STANDARD THERMAL PRINTER]                                      │
│   • Standard 80mm ESC/POS Network/USB Printer (Epson, Sunmi, Xprinter)      │
│   • Auto-prints daily 7:00 PM batch prep manifest for chefs                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Hardware Recommendations

| Station | Recommended Device | Operating System | Purpose |
|---|---|---|---|
| **Welcome Desk / Host Station** | 10.2"–11" iPad (9th/10th Gen) or Samsung Galaxy Tab A9+ | iPadOS / Android | 1-Tap VIP pass QR scanning, table allocation, and guest check-in. |
| **Kitchen Batch Display** | 15.6"–21.5" Android All-in-One Touch Terminal or Wall Monitor | Android / ChromeOS / Windows | Displays real-time Kitchen Batch Prep Sheet, slot arrival schedule, and dish portion counts. |
| **Kitchen Manifest Printer (Optional)** | 80mm Thermal Receipt Printer (Ethernet / Wi-Fi / USB) | ESC/POS Compatible | Automatically prints the 7:00 PM consolidated batch prep sheet for the kitchen team. |

---

## 3. PWA Full-Screen Kiosk Mode Configuration

To prevent host and kitchen staff from navigating away or closing the application:

1. **iPad (iPadOS):**
   - Open Safari $\rightarrow$ Navigate to `https://hotel.quickbite.in` $\rightarrow$ Tap Share $\rightarrow$ **"Add to Home Screen"**.
   - Optional: Enable **Guided Access** in Settings to lock the iPad strictly to the QuickBite app.

2. **Android Tablet:**
   - Open Chrome $\rightarrow$ Navigate to `https://hotel.quickbite.in` $\rightarrow$ Tap 3 dots $\rightarrow$ **"Install App"**.
   - Runs in borderless, full-screen standalone mode with Screen Wake Lock enabled (`navigator.wakeLock.request('screen')`) so screens never dim during service hours.
