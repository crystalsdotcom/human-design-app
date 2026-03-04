"""
Ephemeris Calculator for Human Design
Uses Skyfield + JPL ephemeris for accurate planetary positions.
No C compiler required — pure Python.

Human Design requires:
- Birth chart positions (conscious/personality - black)
- Design chart positions 88 degrees of Sun BEFORE birth (unconscious - red)
"""

from skyfield.api import load
from datetime import datetime, timezone, timedelta

# Load ephemeris data (downloads automatically on first run, ~16MB)
_ts = None
_eph = None

def get_ephemeris():
    global _ts, _eph
    if _eph is None:
        _ts = load.timescale()
        _eph = load('de421.bsp')
    return _ts, _eph


PLANET_BODIES = {
    "sun":        "sun",
    "moon":       "moon",
    "mercury":    "mercury",
    "venus":      "venus",
    "mars":       "mars barycenter",
    "jupiter":    "jupiter barycenter",
    "saturn":     "saturn barycenter",
    "uranus":     "uranus barycenter",
    "neptune":    "neptune barycenter",
    "pluto":      "pluto barycenter",
}

# I Ching gate sequence on the Human Design Mandala wheel
WHEEL_GATES = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36,
    25, 17, 21, 51, 42, 3, 27, 24, 2, 23,
    8, 20, 16, 35, 45, 12, 15, 52, 39, 53,
    62, 56, 31, 33, 7, 4, 29, 59, 40, 64,
    47, 6, 46, 18, 48, 57, 32, 50, 28, 44,
    1, 43, 14, 34, 9, 5, 26, 11, 10, 58,
    38, 54, 61, 60
]

GATE_SPAN = 360.0 / 64  # 5.625 degrees per gate


def longitude_to_gate_line(longitude: float) -> tuple:
    # The HD mandala begins at 0° Aquarius = 300° tropical ecliptic longitude.
    # Without this offset every gate is shifted by ~10 positions and all charts are wrong.
    lon = (longitude - 300.0) % 360.0
    gate_index = min(int(lon / GATE_SPAN), 63)
    gate = WHEEL_GATES[gate_index]
    pos_in_gate = lon - (gate_index * GATE_SPAN)

    line_span = GATE_SPAN / 6
    line = min(int(pos_in_gate / line_span) + 1, 6)

    pos_in_line = pos_in_gate - (line - 1) * line_span
    color_span = line_span / 6
    color = min(int(pos_in_line / color_span) + 1, 6)

    pos_in_color = pos_in_line - (color - 1) * color_span
    tone_span = color_span / 6
    tone = min(int(pos_in_color / tone_span) + 1, 6)

    pos_in_tone = pos_in_color - (tone - 1) * tone_span
    base_span = tone_span / 5
    base = min(int(pos_in_tone / base_span) + 1, 5)

    return gate, line, color, tone, base


def get_ecliptic_longitude(body_name: str, t) -> tuple:
    ts, eph = get_ephemeris()
    earth = eph['earth']
    body = eph[body_name]

    astrometric = earth.at(t).observe(body).apparent()
    lat, lon, distance = astrometric.ecliptic_latlon()
    longitude = lon.degrees % 360.0

    t2 = ts.tt_jd(t.tt + 0.5)
    astrometric2 = earth.at(t2).observe(body).apparent()
    _, lon2, _ = astrometric2.ecliptic_latlon()
    lon2_deg = lon2.degrees % 360.0

    diff = lon2_deg - longitude
    if diff > 180: diff -= 360
    if diff < -180: diff += 360
    retrograde = diff < 0

    return longitude, retrograde


def get_north_node_longitude(t) -> float:
    # Mean ascending node (accurate to ~0.1 degree)
    jd = t.tt
    T = (jd - 2451545.0) / 36525.0
    omega = 125.04452 - 1934.136261 * T + 0.0020708 * T**2 + T**3 / 450000.0
    omega = omega % 360.0
    if omega < 0:
        omega += 360.0
    return omega


def get_all_positions(dt_utc: datetime) -> dict:
    ts, eph = get_ephemeris()
    t = ts.from_datetime(dt_utc)
    positions = {}

    for name, body in PLANET_BODIES.items():
        longitude, retrograde = get_ecliptic_longitude(body, t)
        gate, line, color, tone, base = longitude_to_gate_line(longitude)
        positions[name] = {
            "planet": name,
            "longitude": longitude,
            "gate": gate,
            "line": line,
            "color": color,
            "tone": tone,
            "base": base,
            "retrograde": retrograde,
        }

    nn_lon = get_north_node_longitude(t)
    gate, line, color, tone, base = longitude_to_gate_line(nn_lon)
    positions["north_node"] = {
        "planet": "north_node",
        "longitude": nn_lon,
        "gate": gate,
        "line": line,
        "color": color,
        "tone": tone,
        "base": base,
        "retrograde": False,
    }

    sn_lon = (nn_lon + 180) % 360
    gate, line, color, tone, base = longitude_to_gate_line(sn_lon)
    positions["south_node"] = {
        "planet": "south_node",
        "longitude": sn_lon,
        "gate": gate,
        "line": line,
        "color": color,
        "tone": tone,
        "base": base,
        "retrograde": False,
    }

    return positions


def find_design_datetime(birth_dt_utc: datetime) -> datetime:
    ts, eph = get_ephemeris()
    birth_t = ts.from_datetime(birth_dt_utc)
    earth = eph['earth']
    sun = eph['sun']

    birth_sun = earth.at(birth_t).observe(sun).apparent()
    _, birth_lon, _ = birth_sun.ecliptic_latlon()
    birth_sun_lon = birth_lon.degrees % 360.0
    target_lon = (birth_sun_lon - 88.0) % 360.0

    low_dt = birth_dt_utc - timedelta(days=93)
    high_dt = birth_dt_utc - timedelta(days=83)
    mid_dt = low_dt

    for _ in range(50):
        mid_dt = low_dt + (high_dt - low_dt) / 2
        mid_t = ts.from_datetime(mid_dt)
        mid_sun = earth.at(mid_t).observe(sun).apparent()
        _, mid_lon, _ = mid_sun.ecliptic_latlon()
        mid_lon_deg = mid_lon.degrees % 360.0

        diff = (mid_lon_deg - target_lon + 180) % 360 - 180
        if abs(diff) < 0.00001:
            break
        elif diff > 0:
            high_dt = mid_dt
        else:
            low_dt = mid_dt

    return mid_dt


def calculate_hd_chart(
    year: int, month: int, day: int,
    hour: int, minute: int,
    latitude: float, longitude_geo: float,
    timezone_offset: float = 0.0
) -> dict:
    local_dt = datetime(year, month, day, hour, minute, tzinfo=timezone.utc)
    utc_dt = local_dt - timedelta(hours=timezone_offset)

    design_dt = find_design_datetime(utc_dt)

    personality = get_all_positions(utc_dt)
    design = get_all_positions(design_dt)

    defined_gates = list(set(
        [p["gate"] for p in personality.values()] +
        [p["gate"] for p in design.values()]
    ))

    defined_centers, defined_channels = calculate_centers_and_channels(defined_gates)
    hd_type = determine_type(defined_centers, defined_channels)
    authority = determine_authority(defined_centers)
    # Profile = Personality (conscious) Sun line / Design (unconscious) Sun line
    profile = (personality["sun"]["line"], design["sun"]["line"])
    definition = determine_definition(defined_centers, defined_channels)

    all_centers = ["head", "ajna", "throat", "g", "heart", "sacral", "solar_plexus", "spleen", "root"]
    undefined_centers = [c for c in all_centers if c not in defined_centers]

    return {
        "birth_dt": local_dt,
        "design_dt": design_dt,
        "personality": personality,
        "design": design,
        "type_": hd_type,
        "authority": authority,
        "profile": profile,
        "definition": definition,
        "defined_centers": defined_centers,
        "undefined_centers": undefined_centers,
        "defined_channels": defined_channels,
        "defined_gates": defined_gates,
    }


# ── Body Graph Logic ──────────────────────────────────────────────────────────

CHANNELS = [
    (64, 47, "head", "ajna", "Abstraction"),
    (61, 24, "head", "ajna", "Awareness"),
    (63, 4,  "head", "ajna", "Logic"),
    (17, 62, "ajna", "throat", "Acceptance"),
    (43, 23, "ajna", "throat", "Structuring"),
    (11, 56, "ajna", "throat", "Curiosity"),
    (16, 48, "throat", "spleen", "The Wavelength"),
    (20, 57, "throat", "spleen", "The Brain Wave"),
    (31, 7,  "throat", "g", "The Alpha"),
    (33, 13, "throat", "g", "The Prodigal"),
    (45, 21, "throat", "heart", "The Money Line"),
    (35, 36, "throat", "solar_plexus", "Transitoriness"),
    (12, 22, "throat", "solar_plexus", "Openness"),
    (8, 1,   "throat", "g", "Inspiration"),
    (20, 34, "throat", "sacral", "Charisma"),
    (10, 20, "g", "throat", "Awakening"),
    (10, 57, "g", "spleen", "Perfected Form"),
    (25, 51, "g", "heart", "Initiation"),
    (46, 29, "g", "sacral", "Discovery"),
    (15, 5,  "g", "sacral", "Rhythm"),
    (2, 14,  "g", "sacral", "The Beat"),
    (26, 44, "heart", "spleen", "Surrender"),
    (21, 45, "heart", "throat", "The Money Line"),
    (40, 37, "heart", "solar_plexus", "Community"),
    (51, 25, "heart", "g", "Initiation"),
    (54, 32, "root", "spleen", "Transformation"),
    (58, 18, "root", "spleen", "Judgment"),
    (38, 28, "root", "spleen", "Struggle"),
    (39, 55, "root", "solar_plexus", "Emoting"),
    (19, 49, "root", "solar_plexus", "Synthesis"),
    (41, 30, "root", "solar_plexus", "Recognition"),
    (53, 42, "root", "sacral", "Maturation"),
    (60, 3,  "root", "sacral", "Mutation"),
    (52, 9,  "root", "sacral", "Concentration"),
    (34, 57, "sacral", "spleen", "Power"),
    (34, 10, "sacral", "g", "Exploration"),
    (34, 20, "sacral", "throat", "Charisma"),
    (27, 50, "sacral", "spleen", "Preservation"),
    (59, 6,  "sacral", "solar_plexus", "Mating"),
    (5, 15,  "sacral", "g", "Rhythm"),
    (14, 2,  "sacral", "g", "The Beat"),
    (29, 46, "sacral", "g", "Discovery"),
    (9, 52,  "sacral", "root", "Concentration"),
    (3, 60,  "sacral", "root", "Mutation"),
    (42, 53, "sacral", "root", "Maturation"),
    (50, 27, "spleen", "sacral", "Preservation"),
    (57, 34, "spleen", "sacral", "Power"),
    (57, 20, "spleen", "throat", "The Brain Wave"),
    (57, 10, "spleen", "g", "Perfected Form"),
    (44, 26, "spleen", "heart", "Surrender"),
    (18, 58, "spleen", "root", "Judgment"),
    (28, 38, "spleen", "root", "Struggle"),
    (32, 54, "spleen", "root", "Transformation"),
    (48, 16, "spleen", "throat", "The Wavelength"),
    (36, 35, "solar_plexus", "throat", "Transitoriness"),
    (22, 12, "solar_plexus", "throat", "Openness"),
    (37, 40, "solar_plexus", "heart", "Community"),
    (49, 19, "solar_plexus", "root", "Synthesis"),
    (55, 39, "solar_plexus", "root", "Emoting"),
    (30, 41, "solar_plexus", "root", "Recognition"),
    (6, 59,  "solar_plexus", "sacral", "Mating"),
]


def calculate_centers_and_channels(defined_gates: list) -> tuple:
    gate_set = set(defined_gates)
    active_channels = []
    active_centers = set()
    seen = set()

    for gate_a, gate_b, center_a, center_b, name in CHANNELS:
        if gate_a in gate_set and gate_b in gate_set and name not in seen:
            active_channels.append(name)
            active_centers.add(center_a)
            active_centers.add(center_b)
            seen.add(name)

    return sorted(list(active_centers)), active_channels


def _build_center_graph(defined_centers: list, defined_channels: list) -> dict:
    """Build adjacency graph: which defined centers are connected by active channels."""
    defined_center_set = set(defined_centers)
    active_channel_set = set(defined_channels)
    graph = {c: set() for c in defined_centers}
    for gate_a, gate_b, center_a, center_b, name in CHANNELS:
        if name in active_channel_set and center_a in defined_center_set and center_b in defined_center_set:
            graph[center_a].add(center_b)
            graph[center_b].add(center_a)
    return graph


def _can_reach(start: str, target: str, graph: dict) -> bool:
    """DFS: can we reach `target` center from `start` through defined channels?"""
    visited, stack = set(), [start]
    while stack:
        node = stack.pop()
        if node == target:
            return True
        if node in visited:
            continue
        visited.add(node)
        stack.extend(graph.get(node, set()) - visited)
    return False


def determine_type(defined_centers: list, defined_channels: list) -> str:
    if not defined_centers:
        return "Reflector"

    defined_center_set = set(defined_centers)
    has_sacral = "sacral" in defined_center_set

    # Build connectivity graph to detect indirect motor→throat paths
    graph = _build_center_graph(defined_centers, defined_channels)

    # Motors in HD: Sacral, Solar Plexus, Heart/Will, Root
    motors = {"sacral", "solar_plexus", "heart", "root"} & defined_center_set
    has_motor_to_throat = any(_can_reach(m, "throat", graph) for m in motors)

    if has_sacral:
        return "Manifesting Generator" if has_motor_to_throat else "Generator"
    else:
        return "Manifestor" if has_motor_to_throat else "Projector"


def determine_authority(defined_centers: list) -> str:
    priority = ["solar_plexus", "sacral", "spleen", "heart", "g"]
    for center in priority:
        if center in defined_centers:
            return {
                "solar_plexus": "Emotional",
                "sacral": "Sacral",
                "spleen": "Splenic",
                "heart": "Ego",
                "g": "Self-Projected",
            }[center]
    if "ajna" in defined_centers or "head" in defined_centers:
        return "Mental"
    return "Lunar"


def determine_definition(defined_centers: list, defined_channels: list) -> str:
    """
    Definition is determined by how many separate CONNECTED CIRCUITS of
    defined centers exist — NOT by the count of defined centers.
    """
    if not defined_centers:
        return "No Definition"

    graph = _build_center_graph(defined_centers, defined_channels)

    visited, num_components = set(), 0
    for center in defined_centers:
        if center not in visited:
            num_components += 1
            stack = [center]
            while stack:
                node = stack.pop()
                if node in visited:
                    continue
                visited.add(node)
                stack.extend(graph.get(node, set()) - visited)

    if num_components == 1:
        return "Single Definition"
    elif num_components == 2:
        return "Split Definition"
    elif num_components == 3:
        return "Triple Split"
    else:
        return "Quadruple Split"
