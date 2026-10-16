from google.adk.agents import Agent

from claims.agent import root_agent as claims_agent
from community.agent import root_agent as community_agent
from compliance.agent import root_agent as compliance_agent
from onboarding.agent import root_agent as onboarding_agent
from trust_risk.agent import root_agent as trust_risk_agent

claims_agent.name = "claims_agent"
community_agent.name = "community_agent"
compliance_agent.name = "compliance_agent"
onboarding_agent.name = "onboarding_agent"
trust_risk_agent.name = "trust_risk_agent"

root_agent = Agent(
    name="other_brother_orchestrator",
    model="gemini-2.5-flash",
    description="Main entry point for Other/Brother. Routes each request to the right agent.",
    instruction=(
        "You are the orchestrator of Other/Brother, an app for delivery workers. "
        "Understand the request and hand it to exactly one specialist:\n"
        "- New worker registration, ID or company verification: onboarding_agent\n"
        "- Accident, photo, voice note, claim status: claims_agent\n"
        "- Cash or help request, repayment, pool, helper rewards: community_agent\n"
        "- Monthly income, scheme eligibility, contribution filing: compliance_agent\n"
        "- Trust score, why a score changed, fraud risk: trust_risk_agent\n"
        "For claims and community requests, ask trust_risk_agent to check the worker "
        "when fraud risk or eligibility is unclear. "
        "Never answer a specialist's job yourself. Keep replies short and friendly."
    ),
    sub_agents=[
        onboarding_agent,
        claims_agent,
        community_agent,
        compliance_agent,
        trust_risk_agent,
    ],
)