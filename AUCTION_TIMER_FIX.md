# Auction Timer Fix - Admin Approval Trigger

## Problem

Previously, the auction timer started immediately when a vendor listed a product, even while it was in "pending" status waiting for admin approval. This meant time was being consumed before the product was even visible to buyers.

## Solution

Modified the product controller to start the auction timer **only after admin approval**.

## Changes Made

### 1. **createProduct Function** (`productController.js`)

- When a vendor creates a product, it now sets placeholder `startTime` and `endTime` values
- Product is created with status "pending" (default)
- Response message clarifies: "Product submitted for admin review. Auction will start after approval."

### 2. **reviewProduct Function** (`productController.js`)

- When admin approves a product (changes status to "active"):
  - `startTime` is set to current time
  - `endTime` is recalculated based on the duration from the approval time
- This ensures the auction timer only starts when the product goes live

### 3. **relistProduct Function** (`productController.js`)

- Fixed time calculation bug (was using hours instead of minutes)
- Relisted products now also go through the same approval process
- Placeholder times are set, will be recalculated on admin approval

## Workflow

### Before Fix:

1. Vendor lists product → Timer starts immediately
2. Product sits in "pending" for admin review → Timer running
3. Admin approves → Product goes "active" but timer already started
4. Result: Less time available for actual bidding

### After Fix:

1. Vendor lists product → Placeholder times set, status "pending"
2. Product sits in "pending" for admin review → No timer running
3. Admin approves → Status changes to "active", timer starts NOW
4. Result: Full auction duration available for bidding

## Testing Checklist

- [ ] Create a new product as vendor
- [ ] Verify product status is "pending"
- [ ] Wait a few minutes
- [ ] Approve product as admin
- [ ] Verify `startTime` is set to approval time (not creation time)
- [ ] Verify `endTime` is correct (startTime + duration in minutes)
- [ ] Verify auction countdown shows full duration
- [ ] Test relisting unsold products
- [ ] Verify relisted products also wait for approval

## Database Note

Existing products in the database will keep their original times. Only newly created or relisted products after this fix will have the corrected behavior.
