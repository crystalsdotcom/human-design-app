"""
Human Design API — FastAPI Backend
"""

import os
import stripe
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

from .ephemeris import calculate_hd_chart
from .interpreter import interpret_chart, interpret_chart_stream, simulate_decision_stream
from .models import ChartRequest, ChartResponse, InterpretRequest, PlanetData, SimulationRequest

app = FastAPI(
    title="Human Design API",
    description="Accurate Human Design chart calculation with AI interpretation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "human-design-api"}


@app.post("/api/chart", response_model=ChartResponse)
def calculate_chart(req: ChartRequest):
    """Calculate a Human Design chart from birth data."""
    try:
        chart = calculate_hd_chart(
            year=req.year,
            month=req.month,
            day=req.day,
            hour=req.hour,
            minute=req.minute,
            latitude=req.latitude,
            longitude_geo=req.longitude,
            timezone_offset=req.timezone_offset
        )

        personality = {k: PlanetData(**v) for k, v in chart["personality"].items()}
        design = {k: PlanetData(**v) for k, v in chart["design"].items()}

        return ChartResponse(
            name=req.name,
            type_=chart["type_"],
            authority=chart["authority"],
            profile=list(chart["profile"]),
            definition=chart["definition"],
            defined_centers=chart["defined_centers"],
            undefined_centers=chart["undefined_centers"],
            defined_channels=chart["defined_channels"],
            defined_gates=chart["defined_gates"],
            personality=personality,
            design=design,
            birth_date=chart["birth_dt"].isoformat(),
            design_date=chart["design_dt"].isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/interpret")
async def get_interpretation(req: InterpretRequest):
    """Get AI interpretation of a Human Design chart."""
    try:
        interpretation = await interpret_chart(
            chart=req.chart,
            question=req.question,
            depth=req.depth
        )
        return {"interpretation": interpretation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/interpret/stream")
async def stream_interpretation(req: InterpretRequest):
    """Stream AI interpretation in real-time."""
    async def generate():
        async for chunk in interpret_chart_stream(
            chart=req.chart,
            question=req.question,
            depth=req.depth
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# ── Stripe Checkout ────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    user_id: str
    email: str

@app.post("/api/checkout")
async def create_checkout(req: CheckoutRequest):
    """Create a Stripe Checkout session for the $29/mo plan."""
    if not stripe.api_key or stripe.api_key == "":
        raise HTTPException(status_code=503, detail="Stripe not configured")
    price_id = os.getenv("STRIPE_PRICE_ID_MONTHLY", "")
    if not price_id:
        raise HTTPException(status_code=503, detail="Stripe price not configured")
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            customer_email=req.email,
            line_items=[{"price": price_id, "quantity": 1}],
            metadata={"user_id": req.user_id},
            success_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "?subscribed=true",
            cancel_url=os.getenv("FRONTEND_URL", "http://localhost:3000"),
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class WebhookRequest(BaseModel):
    pass

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks — update Supabase on subscription changes."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig, webhook_secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] in ("checkout.session.completed", "customer.subscription.created"):
        data = event["data"]["object"]
        user_id = data.get("metadata", {}).get("user_id")
        customer_id = data.get("customer")
        if user_id:
            try:
                from supabase import create_client
                sb = create_client(
                    os.getenv("SUPABASE_URL", ""),
                    os.getenv("SUPABASE_SERVICE_KEY", "")
                )
                sb.table("profiles").upsert({
                    "id": user_id,
                    "is_subscribed": True,
                    "stripe_customer_id": customer_id,
                }).execute()
            except Exception:
                pass  # Log in production

    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.paused"):
        data = event["data"]["object"]
        customer_id = data.get("customer")
        if customer_id:
            try:
                from supabase import create_client
                sb = create_client(
                    os.getenv("SUPABASE_URL", ""),
                    os.getenv("SUPABASE_SERVICE_KEY", "")
                )
                sb.table("profiles").update({"is_subscribed": False}).eq(
                    "stripe_customer_id", customer_id
                ).execute()
            except Exception:
                pass

    return {"received": True}


@app.post("/api/simulate/stream")
async def stream_simulation(req: SimulationRequest):
    """Stream a Decision Simulator response using the user's inner authority."""
    async def generate():
        async for chunk in simulate_decision_stream(
            chart=req.chart,
            decision=req.decision
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
