# Deposit Incentive

Deposit Incentives also happens when the KPW value is below `0.00999999`. The Incentive percentage increases linearly as KPW value drops and will scale from `0%` to `50%` added to deposit. 

You should see a message above the Deposit input when the Incentive is active.

![Deposit Incentive](assets/howto/assets/deposit_incentive.png)

Percentage is calculated as a decimal so if the incentive is for `25%` boost the calculation is `deposit + deposit * .25`.