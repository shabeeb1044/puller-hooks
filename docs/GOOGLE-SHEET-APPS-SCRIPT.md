# Google Sheet + form submissions

## 1. Admin “Open Google Sheet” link

In `.env`:

```bash
GOOGLE_SHEET_URL="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
```

(`GOOGLE_SHEET` also works.)

## 2. Auto-append Contact + Dealer submissions

1. Open your spreadsheet → **Extensions → Apps Script**.
2. Paste the script below → **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Copy the `/exec` URL into `.env`:

```bash
GOOGLE_SHEET_WEBHOOK="https://script.google.com/macros/s/XXXX/exec"
```

4. Restart the app (`pm2 restart puller-web`).

### Apps Script

Create two tabs named `Contact` and `Dealer` (or let the script create them).

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var type = data.type === 'dealer' ? 'Dealer' : 'Contact';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(type) || ss.insertSheet(type);

    var fields = data.fields || {};
    var keys = Object.keys(fields);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Submitted At'].concat(keys));
    }

    var row = [data.submittedAt || new Date().toISOString()];
    for (var i = 0; i < keys.length; i++) {
      row.push(fields[keys[i]] == null ? '' : fields[keys[i]]);
    }
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. Email → `sales@pullertackle.com`

```bash
SALES_EMAIL="sales@pullertackle.com"
MAIL_FROM="noreply@pullertackle.com"
SMTP_HOST="127.0.0.1"
SMTP_PORT="25"
```

On the VPS this uses local Postfix so mail lands in the business mailbox.
