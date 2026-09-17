import json

def validate():
    with open('/Users/pratikpotadar/Developer/sih-test/data/demo_set_b.json', 'r') as f:
        data = json.load(f)

    incidents = data['incidents']
    patterns = data['patterns']
    alerts = data['alerts']
    narratives = data['workerNarratives']

    assert len(incidents) == 16
    assert len(patterns) == 8
    assert len(alerts) == 6
    assert len(narratives) == 6

    # check severities of incidents
    sev_counts = {"CRITICAL": 0, "HIGH": 0, "REVIEW": 0, "ROUTINE": 0}
    for inc in incidents:
        sev_counts[inc['severity']] += 1
    assert sev_counts == {"CRITICAL": 4, "HIGH": 4, "REVIEW": 4, "ROUTINE": 4}

    # check locations of incidents
    loc_counts = {}
    for inc in incidents:
        loc_counts[inc['locationName']] = loc_counts.get(inc['locationName'], 0) + 1
    assert all(v == 4 for v in loc_counts.values())

    # base coords
    coords = {
        "Assam / Duliajan Basin": (27.35, 95.32),
        "Rajasthan / Barmer Basin": (25.75, 71.38),
        "Gujarat / Mehsana Basin": (23.60, 72.40),
        "KG Offshore Deepwater Block": (16.50, 82.30)
    }

    for inc in incidents:
        base = coords[inc['locationName']]
        assert abs(inc['lat'] - base[0]) <= 0.051
        assert abs(inc['lng'] - base[1]) <= 0.051

    print('SET B VALIDATION PASSED')

if __name__ == "__main__":
    validate()
