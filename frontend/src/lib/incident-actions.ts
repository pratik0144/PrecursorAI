/**
 * Action & Mitigation Engine
 * Computes context-aware next steps, safety protocols, and containment actions
 * for any HSSE report across all datasets and user-submitted incidents.
 */

export interface IncidentActionGuidance {
  immediateStep: string;
  protocol: string;
  role: string;
  timeframe: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';
}

export function getIncidentNextSteps(incident: {
  reportText?: string;
  severity?: string;
  energySource?: string;
  barrierStatus?: string;
  asset?: string;
}): IncidentActionGuidance {
  const text = (incident.reportText || '').toLowerCase();
  const energy = (incident.energySource || '').toUpperCase();
  const barrier = (incident.barrierStatus || '').toUpperCase();
  const severity = (incident.severity || '').toUpperCase();

  // 1. Gas / H2S / Toxic / Vapor leak
  if (text.includes('h2s') || text.includes('gas leak') || text.includes('sour') || text.includes('toxic') || text.includes('vapor') || (energy === 'CHEMICAL' && severity === 'CRITICAL')) {
    return {
      immediateStep: 'Evacuate personnel upwind to safe muster point. Verify SCBA breathing apparatus before isolating flange/valve.',
      protocol: 'API RP 55 / H2S Emergency Response & Containment Protocol',
      role: 'On-Scene Incident Commander & Lead Operator',
      timeframe: 'Immediate (< 10m)',
      priority: 'CRITICAL'
    };
  }

  // 2. Blowout / BOP / Annular / Pressure Kick / High Pressure Flowline
  if (text.includes('bop') || text.includes('annular') || text.includes('blowout') || text.includes('pressure loss') || text.includes('wellhead') || text.includes('casing') || energy === 'PRESSURE') {
    if (severity === 'CRITICAL' || barrier === 'FAILED') {
      return {
        immediateStep: 'Issue Stop Work Authority (SWA). Depressurize manifold to flare knockout and verify secondary barrier.',
        protocol: 'API RP 53 / Well Control Systems & Pressure Bleed Standard',
        role: 'Well Intervention Superintendent',
        timeframe: 'Immediate (< 15m)',
        priority: 'CRITICAL'
      };
    }
    return {
      immediateStep: 'Isolate line pressure, install double-block bleed gauge, and conduct 15-min hydrostatic holding test.',
      protocol: 'Standard Piping & Pressure Relief Procedure SOP-204',
      role: 'Production Maintenance Lead',
      timeframe: 'Within 1 hour',
      priority: 'HIGH'
    };
  }

  // 3. Working at Height / Fall Protection / Scaffolding / Monkey board
  if (text.includes('fall') || text.includes('scaffold') || text.includes('monkey board') || text.includes('plank') || text.includes('height') || text.includes('harness')) {
    return {
      immediateStep: 'Halt work at height immediately. Tag out scaffolding/station and enforce 100% dual-lanyard tie-off.',
      protocol: 'OSHA 1926.451 / Working at Heights & Fall Arrest Protocol',
      role: 'Rig Safety Officer & Scaffolding Inspector',
      timeframe: 'Immediate (< 15m)',
      priority: severity === 'CRITICAL' || severity === 'HIGH' ? 'CRITICAL' : 'HIGH'
    };
  }

  // 4. Line of Fire / Heavy Lifting / Crane / Dropped Objects / Rigging
  if (text.includes('line-of-fire') || text.includes('line of fire') || text.includes('lift') || text.includes('crane') || text.includes('rigging') || text.includes('rigger') || text.includes('dropped') || energy === 'GRAVITY') {
    return {
      immediateStep: 'Establish 15m Red Zone perimeter. Lower suspended load to ground and verify certified rigger spotter.',
      protocol: 'IOGP Life-Saving Rules: Line-of-Fire Exclusion & DROPS Standard',
      role: 'Lifting Appointed Person & Rig Superintendent',
      timeframe: 'Immediate (< 20m)',
      priority: severity === 'CRITICAL' || severity === 'HIGH' ? 'CRITICAL' : 'HIGH'
    };
  }

  // 5. Electrical / LOTO / Isolation / Breakers / Switchgear
  if (text.includes('loto') || text.includes('lockout') || text.includes('electrical') || text.includes('breaker') || text.includes('isolation') || energy === 'ELECTRICAL') {
    return {
      immediateStep: 'Enforce positive Lock-Out/Tag-Out (LOTO). Verify zero-energy state with calibrated multimeter before contact.',
      protocol: 'NFPA 70E / OSHA 1910.147 Control of Hazardous Energy',
      role: 'Chief Electrical Technician & HSE Inspector',
      timeframe: 'Immediate (< 20m)',
      priority: 'CRITICAL'
    };
  }

  // 6. Hot Work / Welding / Cutting / Ignition hazard
  if (text.includes('hot work') || text.includes('welding') || text.includes('spark') || text.includes('fire') || energy === 'THERMAL') {
    return {
      immediateStep: 'Suspend welding/cutting. Test atmosphere for LEL < 1% flammable gas and assign dedicated fire watch.',
      protocol: 'NFPA 51B / Hot Work Permit & Fire Prevention Standard',
      role: 'Permit-to-Work Coordinator & Fire Watch Officer',
      timeframe: 'Immediate (< 15m)',
      priority: 'HIGH'
    };
  }

  // 7. Rotating equipment / Pinch points / Motion
  if (text.includes('rotary') || text.includes('kelly') || text.includes('pinch') || text.includes('gear') || energy === 'MOTION') {
    return {
      immediateStep: 'De-energize rotary drive. Install machine perimeter interlock guards and re-brief drill crew.',
      protocol: 'Machine Guarding & Pinch Point Prevention Standard',
      role: 'Drill Floor Toolpusher',
      timeframe: 'Within 30 min',
      priority: 'HIGH'
    };
  }

  // 8. Corrosion / Containment / Leaks / Environmental
  if (text.includes('corrosion') || text.includes('containment') || text.includes('coating') || text.includes('tank') || text.includes('bund')) {
    return {
      immediateStep: 'Deploy secondary containment bunding. Schedule ultrasonic thickness gauge inspection within 24h.',
      protocol: 'API 570 Piping Inspection & Environmental Protection SOP',
      role: 'Asset Integrity Engineer',
      timeframe: 'Within 4 hours',
      priority: 'MEDIUM'
    };
  }

  // 9. Default based on Severity / Barrier Status
  if (severity === 'CRITICAL' || barrier === 'FAILED') {
    return {
      immediateStep: 'Exercise Stop Work Authority (SWA). Inspect failed barrier defense and notify Field Operations Lead.',
      protocol: 'Corporate HSSE Incident Escalation & SWA Guideline',
      role: 'Operations Shift Lead',
      timeframe: 'Immediate (< 15m)',
      priority: 'CRITICAL'
    };
  }

  if (severity === 'HIGH' || barrier === 'BYPASSED' || barrier === 'MISSING') {
    return {
      immediateStep: 'Conduct immediate safety stand-down. Reinstate bypassed safeguard before resuming active operation.',
      protocol: 'Safe Systems of Work (SSOW) Compliance Standard',
      role: 'Area HSE Supervisor',
      timeframe: 'Within 1 hour',
      priority: 'HIGH'
    };
  }

  // Routine / Observation
  return {
    immediateStep: 'Review observation in pre-shift toolbox meeting and log preventive housekeeping work order.',
    protocol: 'Behavior-Based Safety Observation SOP',
    role: 'Area HSE Coordinator',
    timeframe: 'Next Shift Handover',
    priority: 'ROUTINE'
  };
}
