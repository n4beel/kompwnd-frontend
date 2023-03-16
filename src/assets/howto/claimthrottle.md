# Claim Throttle

Claim throttling occurs when KPW value dips below `0.00999999` and continues until increase throttling all the way down to `0.00000001`, but with this system, this should hopefully never happen.

When throttling is active you will see a warning above the claim button:

![Claim Throttling](assets/howto/assets/claim_throttle.png)

That percent is subtracted from your claim amount `claim - claim * percent`. This throttling does not affect match rewards if your buddy claims them outside of the network throttling claims.