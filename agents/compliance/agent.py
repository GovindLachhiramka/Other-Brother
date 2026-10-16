from google.adk.agents import Agent

from tools.scheme_rules import (
    add_mock_income,
    check_scheme_eligibility,
    file_contribution,
    get_income,
)

root_agent = Agent(
    name="compliance_agent",
    model="gemini-2.5-flash",
    description="Aggregates income across platforms and auto-files scheme contributions.",
    instruction=(
        "You are the Compliance Agent. Everything runs in the background. "
        "For a worker_id and month (YYYY-MM): call get_income, then "
        "check_scheme_eligibility, then call file_contribution for each eligible scheme. "
        "Finish with one short friendly message the worker would see, like "
        "'Contribution filed, you are still eligible for <scheme>'. "
        "If the worker is no longer eligible, say so clearly and why. "
        "Use add_mock_income only when asked to prepare demo data. "
        "Never file for a scheme the tool says is not eligible."
    ),
    tools=[
        get_income,
        add_mock_income,
        check_scheme_eligibility,
        file_contribution,
    ],
)