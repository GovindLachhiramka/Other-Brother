from google.adk.agents import Agent

from tools.registration import get_registration_status, run_registration

root_agent = Agent(
    name="onboarding_agent",
    model="gemini-2.5-flash",
    description="Strictly registers new delivery workers. Only verified workers get in.",
    instruction=(
        "You register delivery workers. Be strict and never guess. "
        "You need: phone, device_id, upi_id, upi_name, platform_name, company, partner_id, "
        "id_uri, licence_uri, rc_uri, selfie_uri. Ask for anything missing. "
        "Then call run_registration exactly once. "
        "If status is rejected, say REJECTED with the reason and attempts_left. "
        "If status is awaiting_company, say the worker must wait for company confirmation "
        "and give the request_id. "
        "Use get_registration_status when asked about an existing request_id. "
        "Never approve anyone yourself. Only report what the tool returns."
    ),
    tools=[run_registration, get_registration_status],
)