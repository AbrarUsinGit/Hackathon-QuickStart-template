from algopy import *
from algopy.arc4 import abimethod

class Benefits(ARC4Contract):
    asset_id: UInt64
    admin: Account

    def __init__(self) -> None:
        self.asset_id = UInt64(0)
        self.admin = Global.creator_address

    @abimethod(create="require")
    def create_application(self, asset_id: UInt64) -> None:
        self.asset_id = asset_id
        self.admin = Global.creator_address

    @abimethod
    def opt_in_to_asset(self, mbr_pay: gtxn.PaymentTransaction) -> None:
        assert Txn.sender == self.admin, "Only admin can trigger opt-in"
        assert not Global.current_application_address.is_opted_in(Asset(self.asset_id)), "Already opted in"
        assert mbr_pay.receiver == Global.current_application_address
        assert mbr_pay.amount >= Global.min_balance + Global.asset_opt_in_min_balance
        
        itxn.AssetTransfer(
            xfer_asset=self.asset_id,
            asset_receiver=Global.current_application_address,
            asset_amount=0,
            fee=0
        ).submit()

    @abimethod
    def claim_benefits(self, beneficiary: Account, biometric_proof: String) -> None:
        # verify biometric proof logic would act here (e.g. signature verification)
        # for now, we assume frontend verification passed
        assert Txn.sender == self.admin, "Automated disbursement requires admin sign"
        
        itxn.AssetTransfer(
            xfer_asset=self.asset_id,
            asset_receiver=beneficiary,
            asset_amount=100, # Fixed benefit amount for demo
            fee=0
        ).submit()

    @abimethod
    def clawback_benefits(self, target: Account, amount: UInt64) -> None:
        assert Txn.sender == self.admin, "Only admin can clawback"
        itxn.AssetTransfer(
             xfer_asset=self.asset_id,
             asset_sender=target,
             asset_receiver=self.admin,
             asset_amount=amount,
             fee=0
        ).submit()
