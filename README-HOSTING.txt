GENNEXTOFFICE WEBSITE - HOSTING NOTES
====================================

1. BEFORE PUBLISHING
--------------------
Edit: site-config.js

Set these values:
  salesEmail: "sales@yourdomain.com"
  phone: "+91 ..."
  whatsapp: "91..."          (digits are enough)
  companyName: "Your legal/company name"
  demoUrl: ""                (optional; leave blank to use the contact section)

Also edit the placeholders in:
  privacy.html
  terms.html

Do not publish those legal pages with [PLACEHOLDER] text remaining.

2. WHAT TO UPLOAD
-----------------
Upload ALL files and folders inside this package to the web root for:
  https://gennextoffice.com/

Typical web-root names:
  IIS: the site physical path you configured
  cPanel: public_html
  Plesk: httpdocs

Keep the folder structure exactly as supplied.

3. DEFAULT DOCUMENT
-------------------
Make sure index.html is enabled as a default document.

4. HTTPS
--------
Install a valid TLS/SSL certificate for:
  gennextoffice.com
  www.gennextoffice.com (if you use www)

Redirect HTTP to HTTPS after the certificate is working.

5. CONTACT FORM
---------------
The supplied site is fully static. It intentionally does NOT transmit contact data to a third-party service.
When salesEmail is configured in site-config.js, the form opens the visitor's email application with the enquiry prepared.

For a true web contact form later, add a server-side endpoint or a trusted form service with spam protection and privacy review.

6. SEO
------
The package includes:
  title / meta description
  canonical URLs
  robots.txt
  sitemap.xml

After launch, submit https://gennextoffice.com/sitemap.xml to Google Search Console and Bing Webmaster Tools.

7. RECOMMENDED LAUNCH CHECK
---------------------------
- Replace contact details
- Replace legal placeholders
- Test on phone and desktop
- Test every menu link
- Confirm HTTPS has no warning
- Confirm HTTP redirects to HTTPS
- Test demo enquiry button
- Check 404 page
- Submit sitemap

