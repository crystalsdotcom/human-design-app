"""
AI Interpretation Engine for Human Design Charts
Uses Claude API to generate personalized, accurate interpretations.
"""

import anthropic
import os
import json
from .models import ChartResponse

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

HD_SYSTEM_PROMPT = """You are a deeply knowledgeable Human Design analyst with expertise in Ra Uru Hu's original system.

Your interpretations are:
- Grounded in authentic Human Design mechanics (not astrology or generic spirituality)
- Practical and actionable — focused on how someone can live their design
- Warm, clear, and accessible to someone new to Human Design
- Precise about Type strategy, Authority, Profile, and Definition

Human Design fundamentals you always include:
- TYPE: The overall aura and strategy for decision-making
  - Generator/MG: "Wait to Respond" — use gut response
  - Manifestor: "Inform before acting" — follow inner impulse after informing
  - Projector: "Wait for invitation" — wait for recognition and invitation
  - Reflector: "Wait a lunar cycle (29 days)" — sample and reflect

- AUTHORITY: The body's decision-making intelligence
  - Emotional: Sleep on decisions, wait through the wave
  - Sacral: The gut sound — uh-huh (yes) or unh-uh (no)
  - Splenic: In-the-moment intuitive hits, never repeat themselves
  - Ego/Heart: Make commitments from the heart/will
  - Self-Projected: Talk it out with others to hear your own truth
  - Mental: Get outer authority — talk to trusted people
  - Lunar: Sample decisions over the 28-day lunar cycle

- PROFILE: The costume/role you play in life (Line 1-6 combinations)
- DEFINITION: How consistent your energy is (Single = reliable, Split = needs bridges)
- CENTERS: Where your consistent energy lives (defined) vs. where you're open and learn from others

Never invent gates or channels not present in the chart data. Be precise.
Format responses in clean markdown with headers.
"""


def build_chart_context(chart: ChartResponse) -> str:
    """Build a rich text summary of the chart for the AI prompt."""

    personality_activations = []
    for planet, data in chart.personality.items():
        retro = " (R)" if data.retrograde else ""
        personality_activations.append(
            f"  {planet.title()}: Gate {data.gate}.{data.line}{retro}"
        )

    design_activations = []
    for planet, data in chart.design.items():
        retro = " (R)" if data.retrograde else ""
        design_activations.append(
            f"  {planet.title()}: Gate {data.gate}.{data.line}{retro}"
        )

    return f"""
HUMAN DESIGN CHART DATA:

Name: {chart.name or 'Unknown'}
Birth Date: {chart.birth_date}
Design Date: {chart.design_date}

TYPE: {chart.type_}
INNER AUTHORITY: {chart.authority}
PROFILE: {chart.profile[0]}/{chart.profile[1]}
DEFINITION: {chart.definition}

DEFINED CENTERS: {', '.join(chart.defined_centers) if chart.defined_centers else 'None (Reflector)'}
UNDEFINED CENTERS: {', '.join(chart.undefined_centers) if chart.undefined_centers else 'None'}

DEFINED CHANNELS: {', '.join(chart.defined_channels) if chart.defined_channels else 'None'}
DEFINED GATES: {', '.join(str(g) for g in sorted(chart.defined_gates))}

PERSONALITY ACTIVATIONS (Conscious / Black):
{chr(10).join(personality_activations)}

DESIGN ACTIVATIONS (Unconscious / Red):
{chr(10).join(design_activations)}
"""


async def interpret_chart(chart: ChartResponse, question: str | None = None, depth: str = "standard") -> str:
    """
    Generate an AI interpretation of a Human Design chart.

    Args:
        chart: The calculated HD chart
        question: Optional specific question from the user
        depth: "quick" | "standard" | "deep"
    """

    chart_context = build_chart_context(chart)

    depth_instructions = {
        "quick": "Give a concise 3-4 paragraph overview focusing on Type, Authority, and Profile only.",
        "standard": """Provide a thorough interpretation covering:
1. **Your Human Design Type & Strategy** — what this means practically day-to-day
2. **Your Inner Authority** — how to make aligned decisions
3. **Your Profile** — your life theme and role
4. **Your Definition** — your energy consistency
5. **Key Defined Centers** — your reliable energy and gifts
6. **Open/Undefined Centers** — where you amplify others and find wisdom
7. **Signature & Not-Self Theme** — how to know if you're living aligned or not""",
        "deep": """Provide an in-depth, comprehensive interpretation covering:
1. **Type, Strategy & Aura** — full explanation with real-life examples
2. **Inner Authority** — detailed decision-making guidance
3. **Profile Lines** — both lines explained with life themes
4. **Definition & Circuit Analysis** — how your energy flows
5. **Each Defined Center** — gifts, themes, and life expression
6. **Open Centers** — conditioning patterns to watch, wisdom available
7. **Key Defined Channels** — your consistent life themes and gifts
8. **Signature & Not-Self Theme** — alignment indicators
9. **Incarnation Cross** — your life purpose/direction
10. **Practical Living Tips** — specific, actionable advice"""
    }

    user_message = f"""{chart_context}

{depth_instructions.get(depth, depth_instructions['standard'])}

{"" if not question else f"The user's specific question: {question}"}

Please provide a personalized Human Design interpretation for this chart.
"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=HD_SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )

    return response.content[0].text


async def interpret_chart_stream(chart: ChartResponse, question: str | None = None, depth: str = "standard"):
    """
    Stream an AI interpretation — yields text chunks for real-time display.
    """
    chart_context = build_chart_context(chart)

    depth_instructions = {
        "quick": "Write 2 warm paragraphs only: first on their Type and Strategy, second on their Authority. Conversational, no headers, no lists. Under 180 words.",
        "standard": """Write 4 focused sections with headers:
1. **Type & Strategy** — what this means practically day-to-day (3-4 sentences)
2. **Inner Authority** — exactly how to use it for decisions (3-4 sentences)
3. **Profile** — their life theme and role (2-3 sentences)
4. **Energy Landscape** — key gifts from defined centers/channels, and what open centers mean for them (4-5 sentences)
Be warm, specific, and practical. Under 450 words total.""",
        "deep": """Write 6 rich sections with headers:
1. **Type, Strategy & Aura** — full explanation with real-life examples
2. **Inner Authority** — step-by-step decision-making guidance
3. **Profile** — both lines explained with life themes
4. **Defined Centers & Channels** — gifts and consistent life themes
5. **Open Centers** — wisdom and conditioning patterns
6. **Living Your Design** — 3 specific, actionable practices
Under 800 words total."""
    }

    user_message = f"""{chart_context}

{depth_instructions.get(depth, depth_instructions['standard'])}

{"" if not question else f"Specific question to address: {question}"}

Write a personalized Human Design interpretation for this chart."""

    token_limits = {"quick": 350, "standard": 900, "deep": 1400}

    with client.messages.stream(
        model="claude-haiku-4-5",
        max_tokens=token_limits.get(depth, 900),
        system=HD_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    ) as stream:
        for text in stream.text_stream:
            yield text


DECISION_SIMULATOR_SYSTEM = """You are a Human Design decision coach. You help people use their specific inner authority to navigate real decisions.

Your role:
- Speak directly and practically — like a wise coach, not a spiritual teacher
- ALWAYS ground your response in the person's specific Type and Authority
- Do NOT give generic advice. Reference their actual chart mechanics
- Help them access their body's intelligence, not mental analysis
- Be warm, direct, and concrete

Authority-specific guidance you must follow:
- SACRAL (Generators/MGs): The answer lives in the gut. Sacral sounds: uh-huh (yes) / unh-uh (no). Ask them to notice the body's immediate response — before the mind kicks in.
- EMOTIONAL (any type): There is no truth in the now for emotional authority. They must ride the wave — feel this decision on a high, on a low, and in neutral. Sleep on it. Clarity comes over time.
- SPLENIC (any type): The spleen speaks once, in the moment, quietly. It never repeats. Ask: was there a flicker of yes or no in the first instant? That was it.
- EGO/HEART (Manifestors/Projectors): Decisions must align with what they truly WANT, not what they "should" do. Their will must be behind it.
- SELF-PROJECTED (Projectors): They need to talk it out with someone they trust — not to get advice, but to hear their own truth spoken aloud.
- MENTAL/OUTER (Projectors): No internal authority — they need trusted outer voices. Ask: what do the wise people in your life say? What resonates?
- LUNAR (Reflectors): Wait 28 days. Sample the decision at different points in the lunar cycle. Ask: how does it feel at the start of the month vs. the end?

Format:
- Start with a direct acknowledgment of what they're navigating
- Explain EXACTLY what their authority says about this type of decision
- Give them a concrete practice or question to use RIGHT NOW
- End with a grounding reminder about their type's signature (satisfaction/peace/success/surprise)
- Keep it under 400 words — focused, not exhaustive
"""


async def simulate_decision_stream(chart: ChartResponse, decision: str):
    """
    Stream a Decision Simulator response based on the user's chart and a specific decision.
    """
    chart_context = build_chart_context(chart)

    user_message = f"""{chart_context}

THE DECISION OR SITUATION:
{decision}

Help this person navigate this specific decision using their Human Design inner authority ({chart.authority}).
Be concrete, personal, and grounded in their actual chart mechanics."""

    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=DECISION_SIMULATOR_SYSTEM,
        messages=[{"role": "user", "content": user_message}]
    ) as stream:
        for text in stream.text_stream:
            yield text
