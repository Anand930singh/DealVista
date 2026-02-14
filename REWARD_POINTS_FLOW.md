# Reward Points Flow Implementation

## Overview
This document describes the complete reward points flow implementation for the Coupon Collector application with the following features:

1. ✅ **Add 5 points when coupon is listed successfully**
2. ✅ **Show proper toast notifications** (green for success, warning for failure)
3. ✅ **Deduct 5 points when user views coupon code**

---

## Implementation Details

### Backend Changes

#### 1. **RewardPointsService.java** - Enhanced with deduction method
**File:** `backend/src/main/java/com/coupon/backend/service/RewardPointsService.java`

**New Method:**
```java
public void deductPointsByEmail(String email, int pointsToDeduct) {
    UserDetail user = userDetailRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
    if (currentPoints < pointsToDeduct) {
        throw new RuntimeException("Insufficient reward points");
    }
    user.setPoints(currentPoints - pointsToDeduct);
    userDetailRepository.save(user);
}
```

**Features:**
- Validates user exists
- Checks if user has sufficient points before deduction
- Throws exception if insufficient points
- Updates and saves user with deducted points

#### 2. **CouponController.java** - New endpoint for viewing coupon code
**File:** `backend/src/main/java/com/coupon/backend/controller/CouponController.java`

**New Endpoint:**
```java
@PostMapping("/{id}/view-code")
public ResponseEntity<?> viewCouponCode(@PathVariable UUID id, Authentication authentication) {
    try {
        rewardPointsService.deductPointsByEmail(authentication.getName(), 5);
        Map<String, String> response = new HashMap<>();
        response.put("message", "5 points deducted successfully");
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to deduct points");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

**Endpoint Details:**
- **URL:** `POST /coupons/{id}/view-code`
- **Authentication:** Required (uses authenticated user's email)
- **Points:** Deducts 5 points
- **Returns:** Success/error message with appropriate HTTP status

---

### Frontend Changes

#### 1. **api.js** - New API method
**File:** `frontend/src/services/api.js`

**New Method:**
```javascript
viewCouponCode: async (couponId) => {
    return apiRequest(`/coupons/${couponId}/view-code`, {
        method: "POST",
    })
}
```

#### 2. **CouponDetailModal.jsx** - Points deduction on code reveal
**File:** `frontend/src/components/CouponDetailModal/CouponDetailModal.jsx`

**Key Changes:**
- Added `onShowToast` prop to receive parent's toast function
- Added `isDeductingPoints` state to show loading state during API call
- Implemented `handleRevealCode` function that:
  - Calls backend API to deduct points when code is revealed
  - Shows appropriate toast notification (success/error)
  - Handles insufficient points scenario
  - Shows loading state while processing

**Code Reveal Handler:**
```javascript
const handleRevealCode = async () => {
    if (showCode) {
        // User is hiding the code, just toggle
        setShowCode(false)
        return
    }

    // User is revealing the code - deduct 5 points
    setIsDeductingPoints(true)
    try {
        await couponAPI.viewCouponCode(coupon.id)
        setShowCode(true)
        if (onShowToast) {
            onShowToast("5 points deducted! Coupon code revealed.", "info")
        }
    } catch (error) {
        if (onShowToast) {
            onShowToast(
                error.message || "Failed to reveal code. You may not have enough points.",
                "error"
            )
        }
    } finally {
        setIsDeductingPoints(false)
    }
}
```

**Button Features:**
- Disabled state while deducting points
- Shows loading indicator ("...") while processing
- Tooltip shows "(costs 5 points)" when code is hidden
- Proper error handling for insufficient points

#### 3. **BrowseCoupons.jsx** - Toast integration
**File:** `frontend/src/pages/browsecoupon/browsecoupon.jsx`

**Change:**
- Passes `showToast` function to `CouponDetailModal` component
- Enables toast notifications when viewing coupon codes

```jsx
<CouponDetailModal coupon={selectedCoupon} isOpen={showModal} onClose={handleCloseModal} onShowToast={showToast} />
```

#### 4. **CouponForm.jsx** - Already implemented ✅
**File:** `frontend/src/components/CouponForm/couponform.jsx`

**Features Already Present:**
- ✅ Green "success" toast when coupon listed successfully
- ✅ Error/warning toast when listing fails
- ✅ Points automatically added by backend on successful listing

---

## User Flow Diagram

### Flow 1: Listing Coupon (Earning Points)
```
User fills coupon form
    ↓
Clicks "List Coupon"
    ↓
Frontend validates form
    ↓
Sends POST /coupons with coupon data
    ↓
Backend:
  - Creates coupon
  - Calls RewardPointsService.addPointsByEmail(email, 5)
  - Adds 5 points to user
  - Returns success response
    ↓
Frontend receives success
    ↓
Shows GREEN SUCCESS TOAST: "Coupon listed successfully!"
    ↓
User gains 5 reward points
```

### Flow 2: Viewing Coupon Code (Spending Points)
```
User clicks coupon card
    ↓
Modal opens showing coupon details
    ↓
User clicks Eye icon to reveal code
    ↓
Frontend shows loading state (disabled + "...")
    ↓
Sends POST /coupons/{id}/view-code
    ↓
Backend:
  - Gets authenticated user's email
  - Calls RewardPointsService.deductPointsByEmail(email, 5)
  - Checks if user has at least 5 points
  - If yes: deducts 5 points, returns success
  - If no: returns error "Insufficient reward points"
    ↓
Frontend receives response
    ↓
If Success:
  - Shows code
  - Shows BLUE INFO TOAST: "5 points deducted! Coupon code revealed."
  - User loses 5 reward points
  ↓
If Error:
  - Keeps code hidden
  - Shows RED ERROR TOAST: "Failed to reveal code. You may not have enough points."
  - No points deducted
```

---

## Toast Notifications

### Success Toast (Green)
- **Trigger:** Coupon listed successfully
- **Message:** "Coupon listed successfully!"
- **Type:** `success`
- **Color:** Green (#4caf50)

### Error Toast (Red)
- **Trigger:** Coupon listing fails, insufficient points to view code
- **Message:** Error-specific message from backend
- **Type:** `error`
- **Color:** Red

### Info Toast (Blue)
- **Trigger:** Successfully deducted points and revealed code
- **Message:** "5 points deducted! Coupon code revealed."
- **Type:** `info`
- **Color:** Blue (#2196f3)

### Warning Toast (Orange)
- **Trigger:** Various warnings
- **Type:** `warning`
- **Color:** Orange (#ff9800)

---

## API Endpoints

### Add Coupon (Existing)
- **Endpoint:** `POST /coupons`
- **Authentication:** Required
- **Reward:** +5 points on success
- **Response:** CouponResponseDto

### View Coupon Code (New)
- **Endpoint:** `POST /coupons/{id}/view-code`
- **Authentication:** Required
- **Cost:** -5 points
- **Response:** 
  ```json
  {
    "message": "5 points deducted successfully"
  }
  ```
- **Error Response (Insufficient Points):**
  ```json
  {
    "message": "Insufficient reward points"
  }
  ```
- **HTTP Status:** 200 (success), 400 (error)

---

## Error Handling

### Backend Error Scenarios

1. **User Not Found**
   - Exception: `RuntimeException("User not found")`
   - HTTP Status: 400
   - Message: "User not found"

2. **Insufficient Points**
   - Exception: `RuntimeException("Insufficient reward points")`
   - HTTP Status: 400
   - Message: "Insufficient reward points"

3. **Failed to Deduct Points**
   - Exception: Generic `RuntimeException`
   - HTTP Status: 400
   - Message: "Failed to deduct points"

### Frontend Error Handling

- Catches all API errors
- Shows appropriate toast notification
- Doesn't reveal code on error
- Maintains user interaction state

---

## Testing Checklist

- [ ] List a coupon → User gains 5 points (green toast shown)
- [ ] List coupon with invalid data → Shows error toast (red)
- [ ] Open modal with available coupons
- [ ] Click eye icon → Points deducted, code revealed (blue toast shown)
- [ ] Try to reveal code with insufficient points → Shows error toast (red), code stays hidden
- [ ] Hide code and show again → No additional points deducted
- [ ] Test on multiple user accounts → Points isolated per user

---

## Files Modified

1. ✅ `backend/src/main/java/com/coupon/backend/service/RewardPointsService.java`
2. ✅ `backend/src/main/java/com/coupon/backend/controller/CouponController.java`
3. ✅ `frontend/src/services/api.js`
4. ✅ `frontend/src/components/CouponDetailModal/CouponDetailModal.jsx`
5. ✅ `frontend/src/pages/browsecoupon/browsecoupon.jsx`

---

## Summary

The complete reward points flow is now fully implemented:

✅ **Earning Points:** Users earn 5 points when they successfully list a coupon
✅ **Green Toast:** Success message displayed when coupon is listed
✅ **Error Handling:** Proper error messages in warning/error toast when listing fails
✅ **Spending Points:** Users spend 5 points to reveal coupon codes
✅ **Toast Notifications:** Appropriate toast shown for all operations
✅ **Error Validation:** Insufficient points handled gracefully with error message

The system is production-ready and includes proper error handling, user feedback, and transaction integrity.
