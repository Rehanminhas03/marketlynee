# Zoho SMTP Setup Guide — Marketlyn Website

This guide explains how to generate the SMTP password needed for the Marketlyn website to send emails from `support@marketlyn.com`.

---

## Step 1: Log into Zoho

1. Go to **https://mail.zoho.com**
2. Sign in with the **support@marketlyn.com** account

---

## Step 2: Generate an App-Specific Password

> **Why?** The website needs a special password to send emails on behalf of your Zoho account. This is safer than using your regular login password.

1. Go to **https://accounts.zoho.com**
2. Click **Security** in the left sidebar
3. Scroll down to **App Passwords** (under "Application-Specific Passwords")
4. Click **Generate New Password**
5. Enter the app name: `Marketlyn Website`
6. Click **Generate**
7. **Copy the password** that appears — you will only see it once!

> **Note:** If you don't see "App Passwords", it means Two-Factor Authentication (2FA) is not enabled. In that case, you can use your regular Zoho login password instead. However, we recommend enabling 2FA for better security.

---

## Step 3: Send Us the Password

Once you have the password, please share it with us securely. We will update the website configuration.

**Do NOT share passwords over email.** Use a secure method like:
- A phone call
- A secure messaging app (WhatsApp, Signal, etc.)
- A password sharing tool (1Password, LastPass sharing, etc.)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "App Passwords" option is missing | Enable 2FA first: Zoho Account → Security → Two-Factor Authentication |
| "Authentication failed" error | Make sure you copied the full password with no extra spaces |
| Emails not being delivered | Check if your Zoho plan supports SMTP (free Zoho Mail does, with a ~50/day limit) |
| Using Zoho Workplace (paid)? | Let us know — we may need to use `smtppro.zoho.com` instead of `smtp.zoho.com` |

---

## What This Password Is Used For

- Sending contact form confirmation emails to clients
- Sending onboarding welcome emails to new clients
- Sending admin notification emails to support@marketlyn.com

All emails will be sent **from** `support@marketlyn.com` — your official business email.
