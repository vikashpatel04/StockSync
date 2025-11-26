# StockSync 🔄

> **Real-time Inventory Synchronization Watchdog for Retail-to-Marketplace Integration**

StockSync bridges the gap between offline Point-of-Sale (POS) systems and online marketplace listings by monitoring in-store sales and alerting users to update their online inventory, preventing overselling and marketplace penalties.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

When physical retail items sell in-store through a POS system, online marketplace listings (Meesho, Flipkart, Amazon) remain active. This creates:

- **Overselling Risk**: Customers order unavailable items
- **Marketplace Penalties**: Failed fulfillment impacts seller ratings
- **Manual Sync Burden**: Constantly checking POS vs. online inventory

**StockSync Solution**: Real-time monitoring + instant alerts + streamlined manual updates = Zero overselling.

---

## ✨ Features

### Core Functionality
- 🔍 **Real-time Monitoring**: Polls SQL Server POS database for new sales
- 🚨 **Instant Alerts**: Dashboard notifications with product details
- 📋 **One-Click Copy**: Copy SKU to clipboard for quick marketplace updates
- 📊 **History Tracking**: Complete log of synced items with timestamps
- ⚙️ **Configuration Wizard**: 3-step setup for database connection and mapping

### Alert Priority System
- 🔴 **Critical** (< 1 hour): Urgent attention required
- 🟡 **Standard** (1-4 hours): Normal processing
- ⚪ **Aging** (> 4 hours): Requires review

### Developer Features
- 🧪 **Mock Mode**: Test alerts without database connection
- 🔐 **Read-Only Access**: No write operations to POS database
- 💾 **Hardcode Fallback**: Commented configuration block for quick testing
- 🔄 **Auto-Refresh**: Dashboard polls every 10 seconds

---

## 🏗️ Architecture

### System Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Offline POS │─────▶│  SQL Server  │─────▶│  StockSync   │
│   Terminal   │      │   Database   │      │   Backend    │
└──────────────┘      └──────────────┘      └──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │  React UI    │
                                            │  Dashboard   │
                                            └──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │ User Updates │
                                            │ Marketplace  │
                                            └──────────────┘
```

### Tech Stack

**Backend**
- Node.js + Express.js
- `mssql` - SQL Server client
- `node-cron` - Task scheduling
- `cors` - Cross-origin support

**Frontend**
- React 18 + Vite
- Ant Design 5 - UI components
- Axios - HTTP client
- React Router - Navigation

**Database**
- Microsoft SQL Server (2012+)
- Read-only connection required
- TCP/IP on port 1433 (configurable)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **SQL Server** (Optional - use Mock Mode for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stocksync.git
   cd stocksync
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

**Start Backend Server** (Terminal 1)
```bash
cd server
npm run dev
```
✅ Server runs on: `http://localhost:5000`

**Start Frontend Dev Server** (Terminal 2)
```bash
cd client
npm run dev
```
✅ Frontend runs on: `http://localhost:5173`

### Quick Test with Mock Mode

1. Open `http://localhost:5173`
2. Navigate to **Settings** page
3. Click through to the **Preferences** step
4. Toggle **Mock Mode** ON
5. Click **Save Configuration**
6. Go to **Dashboard**
7. Wait 30-60 seconds for mock alerts to appear

---

## ⚙️ Configuration

### Option 1: Using the UI Wizard (Recommended)

Navigate to **Settings** page in the application:

**Step 1: Database Connection**
- Server Address (e.g., `localhost` or `192.168.1.100`)
- Database Name (e.g., `BNEEDS_POS`)
- Username (SQL Server authentication)
- Password
- Click **Test Connection** to verify

**Step 2: Table & Column Mapping**
- Select your sales transaction table from dropdown
- Map columns:
  - **Barcode/SKU Column**: Product identifier
  - **Product Name Column**: Display name
  - **Timestamp Column**: Transaction datetime

**Step 3: Preferences**
- **Polling Interval**: How often to check for new sales (1-60 minutes)
- **Mock Mode**: Toggle for testing without database

### Option 2: Hardcoded Configuration (Development)

Edit `server/config/db.js` and uncomment this block:

```javascript
// --- HARDCODE FALLBACK ---
dbConfig = {
    user: 'sa',
    password: 'yourStrong(!)Password',
    server: 'localhost',
    database: 'BNEEDS_POS',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
// -------------------------
```

### Environment Variables (Optional)

Create `server/.env`:
```env
PORT=5000
DB_SERVER=localhost
DB_NAME=BNEEDS_POS
DB_USER=sa
DB_PASSWORD=yourPassword
POLLING_INTERVAL=5
```

---

## 📖 Usage

### Daily Workflow Example

**Scenario**: Yellow Floral Kurti (SKU: 10055) sold in-store at 6:00 PM

1. **6:00 PM** - Customer purchases item at POS
   - POS records transaction in SQL database
   
2. **6:05 PM** - StockSync detects sale
   - Alert appears on Dashboard with red "Critical" badge
   - Desktop notification (if enabled)
   
3. **6:10 PM** - User sees alert
   - Clicks **"Copy SKU"** button
   - Opens Meesho/Flipkart seller panel
   - Pastes SKU and sets quantity to 0
   
4. **6:12 PM** - User marks complete
   - Clicks **"Done"** button
   - Alert moves to History tab
   - Marketplace updated ✅

### Dashboard Features

- **Real-time Updates**: Auto-refresh every 10 seconds
- **Manual Refresh**: Click refresh icon
- **SKU Copy**: One-click clipboard copy with confirmation
- **Alert Dismissal**: Mark items as synced

### History Log

- View all completed syncs
- Sort by date, SKU, or product name
- Export to CSV (future feature)

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### **GET** `/alerts`
Get all pending alerts

**Response:**
```json
[
  {
    "id": 1732625700000,
    "sku": "10055",
    "productName": "Yellow Floral Kurti",
    "soldTime": "2024-11-26T12:30:00.000Z",
    "status": "pending"
  }
]
```

#### **POST** `/alerts/:id/dismiss`
Mark alert as synced

**Response:**
```json
{
  "success": true
}
```

#### **GET** `/history`
Get sync history

**Response:**
```json
[
  {
    "id": 1732625700000,
    "sku": "10055",
    "productName": "Yellow Floral Kurti",
    "soldTime": "2024-11-26T12:30:00.000Z",
    "syncedTime": "2024-11-26T12:45:00.000Z",
    "status": "synced"
  }
]
```

#### **GET** `/settings`
Get current configuration

#### **POST** `/settings`
Update configuration

**Body:**
```json
{
  "dbConfig": {
    "server": "localhost",
    "database": "BNEEDS_POS",
    "user": "sa",
    "password": "password"
  },
  "mockMode": false,
  "pollingInterval": 5
}
```

#### **POST** `/db/test`
Test database connection

#### **GET** `/db/tables`
List available tables

#### **GET** `/db/columns/:table`
Get columns for specific table

---

## 🐛 Troubleshooting

### Browser Shows Workbox/PWA Errors

**Cause**: Cached service workers from previous sessions

**Fix:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **"Clear site data"**
4. Hard reload: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Dashboard Shows No Alerts

**Check:**
- ✅ Backend server is running on port 5000
- ✅ Mock Mode is enabled in Settings (for testing)
- ✅ Database connection is configured correctly
- ✅ Browser console shows no errors

### Database Connection Failed

**Common Issues:**
- SQL Server not accepting remote connections
- Firewall blocking port 1433
- Windows Authentication vs. SQL Server Authentication mismatch
- Incorrect credentials

**Solutions:**
- Enable TCP/IP in SQL Server Configuration Manager
- Add firewall exception for port 1433
- Verify credentials with SQL Server Management Studio

### Polling Not Working

**Check:**
- `node-cron` dependency installed
- Polling service started (check server logs)
- Polling interval set correctly in Settings

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- **Backend**: Follow Node.js best practices
- **Frontend**: Use React hooks and functional components
- **Comments**: Document complex logic
- **Naming**: Use descriptive variable names

### Testing

Before submitting:
- [ ] Test with Mock Mode
- [ ] Test with real database connection
- [ ] Verify all CRUD operations
- [ ] Check browser console for errors
- [ ] Ensure mobile responsiveness

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 StockSync

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Ant Design** - Beautiful React UI components
- **Vite** - Lightning-fast build tool
- **Express.js** - Minimalist web framework
- **node-mssql** - SQL Server client for Node.js

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/vikashpatel04/stocksync/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vikashpatel04/stocksync/discussions)
- **Email**: vikashpatel.d0414@gmail.com

---

## 🗺️ Roadmap

### Phase 2 (Planned)
- [ ] Multi-marketplace support (Flipkart, Amazon)
- [ ] Auto-sync via marketplace APIs
- [ ] Returns handling (re-stock alerts)
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

### Phase 3 (Future)
- [ ] Predictive stock alerts
- [ ] Shipping partner integration
- [ ] Multi-store support
- [ ] Webhooks for external integrations

---

**Made with ❤️ for retail businesses**

*StockSync - Never oversell again.*
