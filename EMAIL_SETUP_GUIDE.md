# Email Configuration Setup Guide

## How to set up Gmail for the contact form

To make the contact form work and receive emails, you need to set up Gmail App Password. Follow these steps:

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2-Step Verification if it's not already enabled

### Step 2: Generate App Password

1. After enabling 2-Step Verification, go back to Security settings
2. Under "Signing in to Google", click on "App passwords"
3. You might need to sign in again
4. Under "Select app", choose "Mail"
5. Under "Select device", choose "Other (custom name)"
6. Type "BidBazaar Contact Form" as the name
7. Click "Generate"
8. Google will show you a 16-character password (like: abcd efgh ijkl mnop)

### Step 3: Update .env file

1. Open the `.env` file in your project root
2. Replace the EMAIL_PASS value with the 16-character password you got from step 2 (remove spaces)
3. Make sure EMAIL_USER is set to your Gmail address

Example:

```
EMAIL_USER=bidbazaar00@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Important:** The password should be entered as one continuous string without spaces.

### Step 4: Test the contact form

1. Restart your server: `npm run server`
2. Go to the contact page and submit a test message
3. You should receive an email at bidbazaar00@gmail.com

## Troubleshooting

### Error: "Invalid login"

- Make sure you're using an App Password, not your regular Gmail password
- Ensure 2-Factor Authentication is enabled
- Check that the EMAIL_USER matches the Gmail account you generated the App Password for

### Error: "createTransporter is not a function"

- This has been fixed in the latest code update

### Still not working?

- Try using a different Gmail account
- Make sure the Gmail account doesn't have any security restrictions
- Consider using a different email service like SendGrid or Mailgun for production

5. Replace the contact form with EmailJS integration

## Security Notes

- Never commit your real email password to version control
- The app password is different from your regular Gmail password
- You can revoke app passwords anytime from your Google Account settings
- Consider using environment variables for production deployment

## Troubleshooting

**Error: "Invalid login"**

- Make sure you're using the App Password, not your regular Gmail password
- Ensure 2-Factor Authentication is enabled

**Error: "Less secure app access"**

- This error shouldn't occur with App Passwords
- If it does, try generating a new App Password

**Not receiving emails**

- Check your spam folder
- Verify the EMAIL_USER in .env matches your Gmail address
- Test with a different email service like Outlook or Yahoo

**SMTP Connection errors**

- Make sure your internet connection is stable
- Try restarting the server after updating .env
- Check if your ISP blocks SMTP on port 587
