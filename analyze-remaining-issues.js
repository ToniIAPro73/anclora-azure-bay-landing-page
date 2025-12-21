const fs = require('fs');
const data = JSON.parse(fs.readFileSync('playaviva-uniestate.vercel.app-informe-lighthouse.json', 'utf8'));

console.log('=== DETAILED ISSUES FOR RESOLUTION ===\n');

// 1. Check unused JavaScript
const unusedJs = data.audits['unused-javascript'];
if (unusedJs && unusedJs.details && unusedJs.details.items) {
  console.log('UNUSED JAVASCRIPT (11 issues):');
  const realItems = unusedJs.details.items.filter(i => !i.url.includes('chrome-extension'));
  realItems.forEach((item, idx) => {
    const wasted = item.wastedBytes ? (item.wastedBytes / 1024).toFixed(2) : '0';
    console.log(`  ${idx+1}. ${item.url}: ${wasted} KB`);
  });
  console.log();
}

// 2. Check legacy JavaScript
const legacyJs = data.audits['legacy-javascript'];
if (legacyJs && legacyJs.details && legacyJs.details.items) {
  console.log('LEGACY JAVASCRIPT (1 issue):');
  legacyJs.details.items.forEach((item, idx) => {
    console.log(`  ${idx+1}. ${item.url}`);
  });
  console.log();
}

// 3. Check cache policy
const cachePolicy = data.audits['uses-long-cache-ttl'];
if (cachePolicy && cachePolicy.details && cachePolicy.details.items) {
  console.log('CACHE POLICY ISSUES (1 resource):');
  cachePolicy.details.items.forEach((item, idx) => {
    console.log(`  ${idx+1}. ${item.url}`);
    console.log(`     Cache Hit Probability: ${item.cacheHitProbability || 'Unknown'}`);
    console.log(`     Wasted Time: ${(item.wastedMs || 0).toFixed(0)}ms`);
  });
  console.log();
}

// 4. Check render blocking
const renderBlocking = data.audits['render-blocking-resources'];
if (renderBlocking && renderBlocking.details && renderBlocking.details.items) {
  console.log('RENDER BLOCKING RESOURCES:');
  renderBlocking.details.items.forEach((item, idx) => {
    console.log(`  ${idx+1}. ${item.url}`);
  });
  console.log();
}

// 5. Check first input delay
const fid = data.audits['max-potential-fid'];
console.log('PERFORMANCE METRICS:');
console.log(`  Max Potential First Input Delay: ${fid.numericValue.toFixed(2)}ms`);
console.log(`  Score: ${Math.round(fid.score * 100)}/100`);

console.log('\n=== ACTION ITEMS ===\n');
console.log('1. DEPRECATED APIs - CRITICAL');
console.log('   - Issue: Unload event listeners (from HubSpot)');
console.log('   - Status: Already changed to lazyOnload');
console.log('   - Note: Informe may be outdated, needs re-audit\n');

console.log('2. Back/Forward Cache - CRITICAL');
console.log('   - Issue: Page prevents bfcache');
console.log('   - Cause: HubSpot unload listeners');
console.log('   - Status: Should be fixed with lazyOnload\n');

console.log('3. Aria Command Names - HIGH PRIORITY');
console.log('   - Issue: Elements without accessible names');
console.log('   - Status: Already added aria-labels to navigation');
console.log('   - Note: May need deeper investigation\n');

console.log('4. Cache Policy - MEDIUM');
console.log('   - Issue: altcha.min.js without cache headers');
console.log('   - Status: Headers configured in next.config.js\n');

console.log('5. Unused/Legacy JavaScript - MEDIUM');
console.log('   - Issue: Polyfills and unused code');
console.log('   - Status: Turbopack migration should help');
console.log('   - Note: May improve after new deployment\n');
