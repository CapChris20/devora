Markdown · ENGINEERING_STANDARDS.md

# Chris Shina's Engineering Standards

**A personal code standard for building software that I own, understand, and can defend.**

Version 1.0 | Created October 5, 2026

---

## Philosophy

Good code is not clever code. Good code is code you understand 6 months later without asking what a line means.

Every file you write should pass this test: **Could you explain it in an interview without notes?**

If the answer is no, the code isn't ready.

This standard exists so that every project you ship reads like YOU built it — not like an AI did, not like a framework generated it, not like you copied it from somewhere else. It's yours. You own every line.

---

## Core Principle: Write Like a Junior Developer

A junior dev writes straightforwardly because they don't know tricks yet. They spell everything out. No patterns. No hidden logic. No "elegant" solutions.

**That's the goal.**

Not because junior code is objectively better. Because junior code is READABLE. And readable code is code YOU can maintain, debug, and explain.

A senior engineer can write simple code. A junior engineer tries to write clever code. You want to BE the senior engineer.

---

## Rule 1: Named Constants (No Magic Numbers)

Every hardcoded number, string, or value gets its own constant at the top of the file in UPPER_SNAKE_CASE.

**Why:** Magic numbers hide intent. `5000` means nothing. `PAYMENT_TIMEOUT_MS` means everything.

### ❌ Before

```javascript
const checkPayment = async (amount) => {
  if (amount > 10000) return false;
  const response = await fetch(paymentUrl, { timeout: 5000 });
  if (response.status === 429) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return response.ok;
};
```

### ✅ After

```javascript
const MAXIMUM_PAYMENT_AMOUNT = 10000;
const PAYMENT_API_TIMEOUT_MS = 5000;
const RATE_LIMIT_HTTP_STATUS = 429;
const RATE_LIMIT_RETRY_DELAY_MS = 2000;

const checkPayment = async (amount) => {
  if (amount > MAXIMUM_PAYMENT_AMOUNT) return false;
  
  const response = await fetch(paymentUrl, { timeout: PAYMENT_API_TIMEOUT_MS });
  
  if (response.status === RATE_LIMIT_HTTP_STATUS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_RETRY_DELAY_MS));
  }
  
  return response.ok;
};
```

---

## Rule 2: Explicit Variable Names (No Abbreviations)

Every variable should be a complete English phrase. No `s`, `u`, `temp`, `data`, `resp`, `h`, `r`, `g`, `conv`, `msg`.

**Allowed abbreviations only:** `id`, `url`, `api`, `db`, `req`, `res`, `msg`, `uid`, `doc`, `fn`

**Why:** Three days from now, you won't remember what `s` meant. `currentUser` is unambiguous forever.

### ❌ Before

```javascript
const processUser = (u, h) => {
  const s = u.status;
  const t = new Date();
  const a = u.auth;
  const p = { ...u };
  
  if (a && s === 'active') {
    p.lastChecked = t;
    return p;
  }
  
  return null;
};
```

### ✅ After

```javascript
const processUser = (user, history) => {
  const userStatus = user.status;
  const currentTimestamp = new Date();
  const isAuthenticated = user.auth;
  const updatedUserProfile = { ...user };
  
  if (isAuthenticated && userStatus === 'active') {
    updatedUserProfile.lastChecked = currentTimestamp;
    return updatedUserProfile;
  }
  
  return null;
};
```

---

## Rule 3: Boolean Names Start With is/has/can/should/does

Every boolean variable must start with one of these prefixes.

**Why:** You know immediately that this is a true/false value. No guessing.

### ❌ Before

```javascript
const user = { active: true, verified: false, loading: true };

if (user.active && user.verified) { ... }
if (user.loading) { ... }
```

### ✅ After

```javascript
const user = { isActive: true, isVerified: false, isLoadingData: true };

if (user.isActive && user.isVerified) { ... }
if (user.isLoadingData) { ... }
```

---

## Rule 4: Function Names Describe What They Do

Functions are named for their action or output, never `run`, `load`, `process`, `handle`, or `onPress`.

**Why:** `saveUserProfile()` is clear. `handleUpdate()` could mean anything.

### ❌ Before

```javascript
const run = (user) => { ... };
const load = async (id) => { ... };
const process = (data) => { ... };
const handle = () => { ... };
const onPress = () => { ... };
```

### ✅ After

```javascript
const validateUserPaymentEligibility = (user) => { ... };
const fetchTrainerClientsFromDatabase = async (id) => { ... };
const transformRawUserDataToAppFormat = (data) => { ... };
const handleUserLogout = () => { ... };
const handlePaymentButtonPress = () => { ... };
```

---

## Rule 5: One Function = One Job (Max 30 Lines)

Every function does exactly one thing. If it's over 30 lines, it's doing too much — break it into smaller functions.

**Why:** A function that does one thing is testable, reusable, and understandable.

### ❌ Before

```javascript
const saveWorkout = async (workoutData) => {
  const isValid = validateWorkout(workoutData);
  if (!isValid) return false;
  
  const userId = await getCurrentUserId();
  const userRef = db.collection('users').doc(userId);
  const workoutRef = userRef.collection('workouts').doc();
  
  await workoutRef.set({
    ...workoutData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  const updatedWorkoutCount = (userData.workoutCount || 0) + 1;
  
  await userRef.update({
    workoutCount: updatedWorkoutCount,
    lastWorkoutDate: new Date(),
  });
  
  const notificationRef = userRef.collection('notifications').doc();
  await notificationRef.set({
    message: `Workout saved: ${workoutData.name}`,
    timestamp: new Date(),
  });
  
  return true;
};
```

### ✅ After

```javascript
const validateWorkoutData = (workoutData) => {
  return workoutData && workoutData.name && workoutData.duration;
};

const saveWorkoutToDatabase = async (userId, workoutData) => {
  const userRef = db.collection('users').doc(userId);
  const workoutRef = userRef.collection('workouts').doc();
  
  await workoutRef.set({
    ...workoutData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

const incrementUserWorkoutCount = async (userId) => {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  const updatedWorkoutCount = (userData.workoutCount || 0) + 1;
  
  await userRef.update({
    workoutCount: updatedWorkoutCount,
    lastWorkoutDate: new Date(),
  });
};

const createWorkoutNotification = async (userId, workoutName) => {
  const userRef = db.collection('users').doc(userId);
  const notificationRef = userRef.collection('notifications').doc();
  
  await notificationRef.set({
    message: `Workout saved: ${workoutName}`,
    timestamp: new Date(),
  });
};

const saveWorkout = async (workoutData) => {
  const isValid = validateWorkoutData(workoutData);
  if (!isValid) return false;
  
  const userId = await getCurrentUserId();
  
  await saveWorkoutToDatabase(userId, workoutData);
  await incrementUserWorkoutCount(userId);
  await createWorkoutNotification(userId, workoutData.name);
  
  return true;
};
```

---

## Rule 6: Flatten Nested Logic (Max 2 Levels Deep)

No if statements nested more than 2 levels deep. Extract complex conditions into named functions.

**Why:** Nested logic is unreadable. Extract it into a named function and the code reads like a checklist.

### ❌ Before

```javascript
const processPayment = (user, trainer, amount) => {
  if (user) {
    if (user.isVerified) {
      if (user.hasPaymentMethod) {
        if (trainer) {
          if (trainer.isActive) {
            if (amount > 0) {
              // Actually process payment
              return chargeCard(user, amount);
            }
          }
        }
      }
    }
  }
};
```

### ✅ After

```javascript
const isUserReadyForPayment = (user) => {
  return user && user.isVerified && user.hasPaymentMethod;
};

const isTrainerReadyToReceivePayment = (trainer) => {
  return trainer && trainer.isActive;
};

const isAmountValid = (amount) => {
  return amount > 0;
};

const processPayment = (user, trainer, amount) => {
  const canUserPay = isUserReadyForPayment(user);
  const canTrainerReceive = isTrainerReadyToReceivePayment(trainer);
  const isAmountOkay = isAmountValid(amount);
  
  if (canUserPay && canTrainerReceive && isAmountOkay) {
    return chargeCard(user, amount);
  }
  
  return null;
};
```

---

## Rule 7: Section Headers (File Organization)

Every file has three clear sections:

```javascript
// ===== NAMED CONSTANTS =====
// [All constants at the top]

// ===== HELPER FUNCTIONS =====
// [Private functions that main functions use]

// ===== MAIN FUNCTION(S) =====
// [Exported functions the rest of the app uses]
```

**Why:** You know where to look. Top = settings. Middle = helpers. Bottom = entry points.

### ✅ Example

```javascript
// ===== NAMED CONSTANTS =====

const PAYMENT_API_TIMEOUT_MS = 5000;
const RATE_LIMIT_RETRY_DELAY_MS = 2000;
const MAX_RETRY_ATTEMPTS = 3;

// ===== HELPER FUNCTIONS =====

/**
 * Check if user has valid payment method.
 */
const isUserPaymentEligible = (user) => {
  return user && user.isVerified && user.hasPaymentMethod;
};

/**
 * Retry payment after rate limit.
 */
const retryPaymentAfterRateLimit = async (user, amount) => {
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_RETRY_DELAY_MS));
  return processPayment(user, amount);
};

// ===== MAIN FUNCTION =====

/**
 * Process a payment charge for a user.
 * Handles retries on rate limit.
 * Returns true if successful, false otherwise.
 */
export const processPayment = async (user, amount) => {
  if (!isUserPaymentEligible(user)) {
    return false;
  }
  
  let attemptCount = 0;
  
  while (attemptCount < MAX_RETRY_ATTEMPTS) {
    try {
      const response = await chargeCard(user, amount);
      return response.success;
    } catch (error) {
      if (error.status === 429) {
        attemptCount++;
        await retryPaymentAfterRateLimit(user, amount);
      } else {
        throw error;
      }
    }
  }
  
  return false;
};
```

---

## Rule 8: JSDoc on Everything Exported

Every function exported from a file gets JSDoc. Every parameter. Every return value.

**Why:** Future-you will read this and know exactly what to pass in and what you'll get back.

### ❌ Before

```javascript
export const fetchUserData = (userId) => { ... };
export const validateWorkout = (data) => { ... };
export const saveToDatabase = async (ref, doc) => { ... };
```

### ✅ After

```javascript
/**
 * Fetch user data from Firestore.
 * @param {string} userId - The user's unique ID
 * @returns {Promise<Object>} User object with profile, preferences, and metadata
 */
export const fetchUserData = (userId) => { ... };

/**
 * Validate that a workout object has all required fields.
 * @param {Object} data - The workout data to validate
 * @param {string} data.name - Workout name (required)
 * @param {number} data.duration - Duration in minutes (required)
 * @returns {boolean} True if valid, false otherwise
 */
export const validateWorkout = (data) => { ... };

/**
 * Save a document to Firestore.
 * @param {Object} ref - Firestore collection reference
 * @param {Object} doc - The document data to save
 * @returns {Promise<void>} Resolves when save is complete
 */
export const saveToDatabase = async (ref, doc) => { ... };
```

---

## Rule 9: Comments Explain WHY, Not WHAT

Code shows WHAT it does. Comments explain WHY it does it.

**Why:** Someone reading the code can see the WHAT. They need the WHY to understand the DECISION.

### ❌ Before

```javascript
// increment counter
counter++;

// check if user is active
if (user.isActive) { ... }

// loop through workouts
for (const workout of workouts) { ... }
```

### ✅ After

```javascript
// Increment counter to track number of payment attempts
counter++;

// Only process payment for active users (inactive = account suspended)
if (user.isActive) { ... }

// Loop through workouts in reverse order for most recent first
// (List API returns oldest first, so we reverse)
for (const workout of [...workouts].reverse()) { ... }
```

---

## Rule 10: No Vague Function Names

Functions should not be named `run`, `handle`, `process`, `load`, `save`, `get`, `set`, `onPress`, `onChange`.

These are okay only when context makes it clear:

- `handleUserLogout()` ✅ (logout is clear)
- `handlePaymentButtonPress()` ✅ (payment button press is clear)
- `handleClick()` ❌ (click what?)
- `loadData()` ❌ (what data?)
- `saveToDatabase()` ❌ (save what?)

**Good function names:**

- `fetchTrainerClientsFromDatabase()`
- `validateUserPaymentEligibility()`
- `calculateTotalWorkoutDuration()`
- `transformRawApiResponseToUserProfile()`
- `retryPaymentAfterNetworkTimeout()`

---

## File Structure Example (React Component)

```javascript
// ===== IMPORTS =====

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fetchUserWorkouts } from '../api/workoutApi';
import WorkoutCard from '../components/WorkoutCard';

// ===== NAMED CONSTANTS =====

const WORKOUTS_REFRESH_INTERVAL_MS = 30000;
const EMPTY_WORKOUTS_MESSAGE = 'No workouts yet. Create one to get started.';
const LOADING_MESSAGE = 'Loading your workouts...';
const ERROR_MESSAGE = 'Failed to load workouts. Please try again.';

// ===== HELPER FUNCTIONS =====

/**
 * Group workouts by date.
 */
const groupWorkoutsByDate = (workouts) => {
  const grouped = {};
  
  workouts.forEach(workout => {
    const date = new Date(workout.createdAt).toLocaleDateString();
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    
    grouped[date].push(workout);
  });
  
  return grouped;
};

/**
 * Sort workouts from most recent to oldest.
 */
const sortWorkoutsByNewestFirst = (workouts) => {
  return [...workouts].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

// ===== MAIN COMPONENT =====

/**
 * Display all workouts for the current user.
 * Fetches on mount and refreshes every 30 seconds.
 */
const WorkoutListScreen = ({ userId }) => {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fetch workouts on component mount
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setIsLoading(true);
        const fetchedWorkouts = await fetchUserWorkouts(userId);
        const sortedWorkouts = sortWorkoutsByNewestFirst(fetchedWorkouts);
        setWorkouts(sortedWorkouts);
        setHasError(false);
      } catch (error) {
        console.error('Failed to load workouts:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();

    // Refresh every 30 seconds
    const refreshInterval = setInterval(loadWorkouts, WORKOUTS_REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshInterval);
  }, [userId]);

  // Render loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{LOADING_MESSAGE}</Text>
      </View>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{ERROR_MESSAGE}</Text>
      </View>
    );
  }

  // Render empty state
  if (workouts.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{EMPTY_WORKOUTS_MESSAGE}</Text>
      </View>
    );
  }

  // Render workouts
  const groupedWorkouts = groupWorkoutsByDate(workouts);

  return (
    <View style={{ flex: 1 }}>
      {Object.entries(groupedWorkouts).map(([date, dayWorkouts]) => (
        <View key={date}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{date}</Text>
          {dayWorkouts.map(workout => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </View>
      ))}
    </View>
  );
};

export default WorkoutListScreen;
```

---

## How to Apply This to New Projects

1. **Read this file** before you start building
2. **Create a folder** in your project: `.engineering-standards/`
3. **Copy this file** into that folder as `CODING_STANDARD.md`
4. **Reference it** whenever you're uncertain about how to write something
5. **Adapt it** if you learn better ways — update it as you grow

---

## When to Break These Rules (And How)

These rules apply 95% of the time. The 5% is when performance or library constraints force it.

**Breaking rules is allowed if:**

1. You document WHY in a comment
2. You have a good reason (performance, library limitation, etc.)
3. You're not alone in the codebase — you've confirmed with your team

### Example of a justified break:

```javascript
// Using single-letter variable because this is performance-critical math (O(n^2))
// and needs minimal memory. Renamed for clarity in surrounding comments.
const calculateDistanceMatrix = (points) => {
  const n = points.length;
  const d = Array(n).fill(0).map(() => Array(n).fill(0));
  
  // d[i][j] = distance from point i to point j
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      d[i][j] = Math.hypot(
        points[i].x - points[j].x,
        points[i].y - points[j].y
      );
      d[j][i] = d[i][j];
    }
  }
  
  return d;
};
```

---

## The Test: Can You Explain It?

Before you commit code, ask yourself: **Could I explain this in an interview without notes?**

If no → refactor it.

If yes → you own it.

---

## Summary

| Rule | Why | Example |
| --- | --- | --- |
| Named constants | Magic numbers hide intent | `const MAX_RETRIES = 3;` not `3` |
| Explicit names | Clarity lasts years | `currentUser` not `u` |
| Boolean prefixes | Know it's a boolean immediately | `isActive` not `active` |
| Descriptive functions | Know what it does | `fetchTrainerClients()` not `load()` |
| One job per function | Readable, testable | Max 30 lines |
| Flat nesting | Linear thinking | Max 2 levels, extract the rest |
| Section headers | Know where to look | Constants → Helpers → Main |
| JSDoc | Future-you will thank you | Every export documented |
| Comments = WHY | Code shows WHAT | Explain the decision |
| No vague names | Specificity is key | `handlePaymentButtonPress` not `handle` |

---

**Your code is your signature. Make it one you're proud of.**

**Written by Chris Shina**\
**Updated October 5, 2026**\
**Valid for all projects, all languages, all time.**