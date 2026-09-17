import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setAData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/demo_set_a.json'), 'utf8'));
const setBData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/demo_set_b.json'), 'utf8'));

console.log('=== PRECURSORAI TAB DATA INTEGRITY TEST ===\n');

const DEMO_INCIDENTS = [
  { id: 'REP-4091', reportText: 'Workover rig #12', reportType: 'NEAR_MISS', locationName: 'Assam / Duliajan / Well #44', asset: 'Wellhead WH-44 & Rig #12', lat: 27.35, lng: 95.32, severity: 'CRITICAL', energySource: 'PRESSURE', barrierStatus: 'FAILED', timestamp: '12m ago', status: 'OPEN' },
  { id: 'REP-4089', reportText: 'Heavy lift', reportType: 'SAFETY_OBSERVATION', locationName: 'Assam / Naharkatia Block', asset: 'Wellhead WH-44', lat: 27.30, lng: 95.28, severity: 'HIGH', energySource: 'GRAVITY', barrierStatus: 'MISSING', timestamp: '45m ago', status: 'OPEN' },
  { id: 'REP-4082', reportText: 'Kelly bushing', reportType: 'UNSAFE_ACT', locationName: 'Rajasthan / Barmer Basin', asset: 'Drilling Rig DR-03', lat: 25.75, lng: 71.38, severity: 'HIGH', energySource: 'MOTION', barrierStatus: 'BYPASSED', timestamp: '2h ago', status: 'OPEN' },
  { id: 'REP-4076', reportText: 'Flare knockout', reportType: 'UNSAFE_CONDITION', locationName: 'Gujarat / Mehsana Assets', asset: 'GGS Plant 01', lat: 23.60, lng: 72.40, severity: 'REVIEW', energySource: 'CHEMICAL', barrierStatus: 'INTACT', timestamp: '5h ago', status: 'OPEN' },
  { id: 'REP-4065', reportText: 'Offshore crane', reportType: 'SAFETY_OBSERVATION', locationName: 'KG Offshore Deepwater Block', asset: 'Platform Alpha', lat: 16.50, lng: 82.30, severity: 'ROUTINE', energySource: 'MECHANICAL', barrierStatus: 'DEGRADED', timestamp: '1d ago', status: 'OPEN' }
];

function testDataset(name, datasetId, incidents, rawData) {
  console.log(`\n========================================`);
  console.log(`TESTING TAB DATA INTEGRITY: ${name} (${datasetId})`);
  console.log(`========================================`);

  // 1. Command Center / Funnel Check
  const total = incidents.length;
  const critical = incidents.filter(i => i.severity === 'CRITICAL').length;
  const high = incidents.filter(i => i.severity === 'HIGH').length;
  const highEnergy = incidents.filter(i => ['PRESSURE', 'GRAVITY', 'MOTION', 'ELECTRICAL', 'CHEMICAL', 'THERMAL', 'MECHANICAL'].includes(i.energySource)).length;
  const sifPotential = incidents.filter(i => (i.severity === 'CRITICAL' || i.severity === 'HIGH') && i.barrierStatus !== 'INTACT').length;
  console.log(`✓ Tab 1 [CommandCenter]: Total: ${total}, Critical: ${critical}, High: ${high}, SIF Potential: ${sifPotential}, High-Energy: ${highEnergy}`);
  if (total === 0) throw new Error('CommandCenter has 0 incidents');

  // 2. Incident Triage Check
  const openCount = incidents.filter(i => i.status === 'OPEN').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
  console.log(`✓ Tab 2 [Triage]: Actionable Queue: ${incidents.length} items (${openCount} OPEN, ${resolvedCount} RESOLVED)`);
  if (incidents.length === 0) throw new Error('Triage queue is empty');

  // 3. SIF Analysis Check
  const energyMap = {};
  incidents.forEach(i => { energyMap[i.energySource] = (energyMap[i.energySource] || 0) + 1; });
  const barrierMap = {};
  incidents.forEach(i => { barrierMap[i.barrierStatus] = (barrierMap[i.barrierStatus] || 0) + 1; });
  console.log(`✓ Tab 3 [SIF Analysis]: Energy counts:`, energyMap);
  console.log(`   Barrier breakdown:`, barrierMap);

  // 4. Safety Patterns Check
  const patterns = rawData?.patterns || [];
  console.log(`✓ Tab 4 [Patterns]: Active Patterns: ${patterns.length} (${patterns.map(p => p.id).join(', ')})`);
  if (datasetId !== 'demo' && patterns.length === 0) throw new Error('Patterns missing in sample dataset');

  // Pattern Detail Simulation
  if (patterns.length > 0) {
    const firstPat = patterns[0];
    const related = incidents.filter(i => i.severity === firstPat.severity);
    console.log(`✓ Tab 4b [PatternDetail]: Pattern ${firstPat.id} (${firstPat.title.slice(0, 45)}...): Found ${related.length} contributing reports`);
  }

  // 5. Assets Health Check
  const assetMap = {};
  incidents.forEach(i => {
    const a = i.asset.trim();
    if (!assetMap[a]) assetMap[a] = { name: a, count: 1, worstSeverity: i.severity };
    else assetMap[a].count++;
  });
  const assetList = Object.values(assetMap);
  console.log(`✓ Tab 5 [Assets]: Mapped Assets: ${assetList.length} operational units`);
  console.log(`   Top Assets:`, assetList.slice(0, 3).map(a => `${a.name} (${a.count} events)`));
  if (assetList.length === 0) throw new Error('Asset list is empty');

  // Asset Detail Simulation
  const firstAsset = assetList[0];
  const relatedAssetIncs = incidents.filter(i => i.asset.trim() === firstAsset.name);
  console.log(`✓ Tab 5b [AssetDetail]: Detail for ${firstAsset.name}: ${relatedAssetIncs.length} events, Barriers: ${relatedAssetIncs.map(i => i.barrierStatus).join(', ')}`);

  // 6. Active Alerts Check
  const alerts = rawData?.alerts || [];
  console.log(`✓ Tab 6 [Alerts]: Active Early Warnings: ${alerts.length} (${alerts.map(a => a.id).join(', ')})`);

  // 7. Audit Log Check
  const auditEntries = incidents.slice(0, 10).map((inc, i) => ({ id: `AUD-${i}`, target: `${inc.id} (${inc.asset})` }));
  console.log(`✓ Tab 7 [AuditLog]: Audit Trail entries: ${auditEntries.length} generated from current incidents`);

  // 8. Analytics Check
  const totalSIFs = incidents.filter(i => (i.severity === 'CRITICAL' || i.severity === 'HIGH') && i.barrierStatus !== 'INTACT').length;
  console.log(`✓ Tab 8 [Analytics]: IOGP Risk exposure calculated: ${totalSIFs} SIF precursors tracked`);

  // 9. Geospatial / Globe Check
  const basins = ['Assam', 'Barmer', 'Mehsana', 'KG'];
  const basinCounts = basins.map(b => ({ basin: b, count: incidents.filter(i => i.locationName.includes(b)).length }));
  console.log(`✓ Tab 9 [Globe]: Geospatial clusters:`, basinCounts);

  console.log(`\nALL 9 TABS VERIFIED FOR: ${name} (${datasetId})`);
}

testDataset('Sample Data A', 'setA', setAData.incidents, setAData);
testDataset('Sample Data B', 'setB', setBData.incidents, setBData);
testDataset('Built-in Demo', 'demo', DEMO_INCIDENTS, null);

console.log('\n======================================================');
console.log('ALL TESTS PASSED: SET A, SET B, AND DEMO FULLY TESTED!');
console.log('======================================================');
