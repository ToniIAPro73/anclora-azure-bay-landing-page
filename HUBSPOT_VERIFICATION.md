# HubSpot Verification Report

## Changes Made
- Updated HubSpotScript.tsx: Changed script loading strategy from `afterInteractive` to `lazyOnload`
- This change allows browser to enable Back/Forward cache while HubSpot loads asynchronously

## HubSpot Integration Points

### 1. **Tracking Script** (HubSpotScript.tsx)
- **URL:** `//js-eu1.hs-scripts.com/147219365.js`
- **Portal ID:** 147219365
- **Strategy:** `lazyOnload` (loads after page interaction)
- **Impact:** Deferred loading allows bfcache to work

### 2. **Form Submission** (app/page.tsx)
- **Form ID:** ALTCHA widget used for verification
- **Hidden Field:** hubspotutk (HubSpot cookie)
- **Submission:** Via `/api/submit-lead` endpoint

### 3. **Lead Capture API** (app/api/submit-lead/route.ts)
- **Function:** submitToHubSpot()
- **Endpoint:** https://api.hubapi.com/crm/v3/objects/contacts
- **Payload:** Includes email, firstName, lastName, language, UTM parameters
- **Authentication:** HUBSPOT_FORM_GUID environment variable

### 4. **Meeting Booking** (Email Links)
- **Spanish:** https://meetings-eu1.hubspot.com/toni-ballesteros-alonso
- **English:** https://meetings-eu1.hubspot.com/toni-ballesteros-alonso

## Testing Checklist

### Frontend Tests
- [ ] Page loads without errors
- [ ] HubSpot script is loaded (check Network tab, filter by 'js-eu1.hs-scripts.com')
- [ ] ALTCHA verification challenge appears
- [ ] Language toggle works (ES/EN)
- [ ] Form fields are visible and editable

### Form Submission Tests

#### Test Case 1: Spanish Form Submission
1. Open page in Spanish (default)
2. Scroll to "Dossier de Inversión Exclusivo" section
3. Fill form:
   - Nombre: "Test User"
   - Apellidos: "Verification"
   - Email: "test@example.com"
4. Check ALTCHA checkbox
5. Click "Descargar Dossier Exclusivo"
6. Expected:
   - Loading message "Personalizando dossier..."
   - Success message "Gracias, Test User. Tu dossier personalizado se está enviando a tu bandeja."
   - PDF download should start
   - Email should be received

#### Test Case 2: English Form Submission
1. Toggle language to English
2. Scroll to "Exclusive Investment Dossier" section
3. Fill form:
   - First Name: "Test User"
   - Last Name: "Verification"
   - Email: "test2@example.com"
4. Check ALTCHA checkbox
5. Click "Download Exclusive Dossier"
6. Expected: Same as Test Case 1 but in English

### HubSpot-Specific Verifications

#### Check 1: Contact Created
1. Go to HubSpot Portal (147219365)
2. Navigate to Contacts
3. Search for submitted email addresses
4. Verify contacts appear within 2-3 minutes
5. Expected: Contact should have:
   - First Name
   - Last Name
   - Email
   - Language property (ES or EN)
   - UTM parameters if applicable

#### Check 2: Lead Automation
1. Check automation/workflows in HubSpot
2. Verify form submission triggered workflow:
   - Email sent to user (with PDF link)
   - Internal notification sent
   - Deal created (if applicable)

#### Check 3: Meetings Integration
1. Click "Schedule Meeting" button in email
2. Should redirect to HubSpot Meetings booking page
3. Verify language matches submission language

### Performance Metrics
- [ ] Page Still loads quickly (FCP < 2s)
- [ ] No console errors related to HubSpot
- [ ] bfcache enabled (check DevTools > Performance > Back/Forward cache)
- [ ] Network waterfall shows HubSpot script loading at the end (lazyOnload)

### Potential Issues to Watch

#### Issue 1: Missing hubspotutk Cookie
- **Symptom:** Form submission fails silently
- **Cause:** HubSpot script not loaded yet
- **Solution:** Script loads on interaction, should have cookie by form submission
- **Mitigation:** ALTCHA verification requires user interaction, which triggers HubSpot

#### Issue 2: Form Not Sending to HubSpot
- **Symptom:** Contacts don't appear in HubSpot
- **Cause:** Environment variables missing
- **Check:** Verify HUBSPOT_FORM_GUID is set in production
- **Solution:** Update .env with correct GUID

#### Issue 3: PDF Generation Fails
- **Symptom:** User sees error after form submission
- **Cause:** S3 storage issue or PDF generation error
- **Check:** Monitor server logs for PDF generation errors
- **Fallback:** Local dossier endpoint should work

## Rollback Plan (If Issues Arise)

If HubSpot functionality breaks after lazyOnload change:

```typescript
// Revert to afterInteractive if needed:
<Script
  id="hubspot-script"
  src="//js-eu1.hs-scripts.com/147219365.js"
  strategy="afterInteractive"  // Restore this
  async
  defer
/>
```

However, this will impact bfcache (Lighthouse score will decrease).

## Expected Lighthouse Impact

### Before Changes
- Performance: 99/100
- Best Practices: 81/100 (bfcache blocked)

### After Changes
- Performance: 99-100/100 (slight improvement)
- Best Practices: 85-90/100 (bfcache now enabled)
- **Overall Improvement:** +5-10 points in Best Practices

## Monitoring

### Recommended KPIs to Monitor
1. **Form Submission Success Rate:** Should remain > 95%
2. **Lead Creation in HubSpot:** Should occur within 5 minutes
3. **Page Load Time:** Should not increase
4. **Console Errors:** Should remain at 0 for HubSpot-related issues

### Log Locations
- Server: Check `/api/submit-lead` response logs
- Client: Browser DevTools Console (should see no HubSpot errors)
- HubSpot: Portal Logs (if available in plan)

## Sign-Off

- [ ] All frontend tests passed
- [ ] All form submission tests passed
- [ ] HubSpot contacts appearing correctly
- [ ] No console errors
- [ ] Lighthouse metrics improved or maintained
- [ ] Ready for production deployment

---

**Last Updated:** 2025-12-07
**Status:** Ready for Production Testing
