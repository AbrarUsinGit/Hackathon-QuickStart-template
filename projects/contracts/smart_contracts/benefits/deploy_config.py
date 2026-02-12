import logging
from algokit_utils import (
    Account,
    AlgorandClient,
    AssetCreateParams,
)
from algokit_utils.beta.algorand_client import PayParams, AssetTransferParams

logger = logging.getLogger(__name__)

def deploy(
    algorand: AlgorandClient,
    deployer: Account,
) -> None:
    from smart_contracts.artifacts.benefits.client import BenefitsClient

    # 1. Create the Benefit Token (ASA)
    # In a real scenario, this might already exist. We create it here for the demo.
    sent_txn = algorand.send.asset_create(
        AssetCreateParams(
            sender=deployer.address,
            total=1_000_000_000,
            decimals=2,
            default_frozen=False,
            unit_name="BNFT",
            asset_name="Government Benefit Token",
            manager=deployer.address,
            reserve=deployer.address,
            freeze=deployer.address,
            clawback=deployer.address, # Vital for fraud recovery
        )
    )
    asset_id = sent_txn.confirmation.asset_index
    logger.info(f"Created Benefit Token with Asset ID: {asset_id}")

    # 2. Deploy the Benefits Smart Contract
    app_client = BenefitsClient(
        algorand.client.algod,
        creator=deployer,
        indexer_client=algorand.client.indexer,
    )

    app_client.deploy(
        on_schema_break="append",
        on_update="append",
        create_args={"asset_id": asset_id},
    )
    logger.info(f"Deployed Benefits Contract with App ID: {app_client.app_id}")
    
    # 3. Fund Contract for MBR (Minimum Balance Requirement)
    # The contract needs to opt-in to the asset, which requires funding.
    
    app_addr = app_client.app_address
    
    # Check if already opted in
    try:
        account_info = algorand.client.algod.account_info(app_addr)
        assets = account_info.get("assets", [])
        is_opted_in = any(a["asset-id"] == asset_id for a in assets)
    except Exception:
        is_opted_in = False
        
    if not is_opted_in:
        logger.info("Funding and opting in contract to asset...")
        
        # Funding calculation: 0.1 (min balance) + 0.1 (ASA opt-in) + fees
        mbr_amount = 200_000 # 0.2 ALGO
        
        payment_txn = algorand.create_transaction.payment(
            PayParams(
                sender=deployer.address,
                receiver=app_addr,
                amount=mbr_amount
            )
        )
        
        # We need to construct the payment transaction to pass to the method
        # But app_client methods usually take SignerTransaction, which algokit-utils handles.
        # However, specifically passing a transaction as an argument to an app call:
        
        # Using composer for atomic group: 1. Payment, 2. App Call (opt_in)
        # Note: The contract method 'opt_in_to_asset' expects a payment transaction as argument.
        
        sp = algorand.client.algod.suggested_params()
        # Explicitly sign and send via app client
        app_client.opt_in_to_asset(mbr_pay=payment_txn)
        logger.info("Contract successfully opted in to Benefit Token")
    
    # 4. Fund the contract with some Benefit Tokens so it can dispense them
    # Transfer 500,000 BNFT to the contract
    
    logger.info("Transferring initial supply of Benefits to contract...")
    algorand.send.asset_transfer(
        AssetTransferParams(
            sender=deployer.address,
            receiver=app_addr,
            asset_id=asset_id,
            amount=500_000
        )
    )
    logger.info("Contract funded with Benefit Tokens")
