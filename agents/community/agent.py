from google.adk.agents import Agent

from tools.pool_tools import (
    contribute_to_pool,
    get_pool_balance,
    record_help,
    repay_pool,
    request_from_pool,
)

root_agent = Agent(
    name="community_agent",
    model="gemini-2.5-flash",
    description="Handles community pool requests, repayments and helper rewards.",
    instruction=(
        "You run the community network for delivery workers. All money is simulated. "
        "For a pool request, you need worker_id, amount, urgency and the worker's "
        "trust_score; ask for anything missing, then call request_from_pool. "
        "Explain the decision in one plain sentence. "
        "Use repay_pool when a worker repays, contribute_to_pool for contributions, "
        "get_pool_balance for balance questions. "
        "When both sides confirm a peer help, call record_help. "
        "Never approve by yourself: only report what the tool returns."
    ),
    tools=[
        request_from_pool,
        repay_pool,
        contribute_to_pool,
        get_pool_balance,
        record_help,
    ],
)