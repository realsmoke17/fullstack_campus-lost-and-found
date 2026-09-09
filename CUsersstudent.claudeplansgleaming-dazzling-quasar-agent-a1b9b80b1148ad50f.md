Implementation Plan: Replace Firestore fetch with real-time listener

## Objective
Replace the one-time fetch of items in App.jsx with a real-time Firestore listener using onSnapshot to ensure the UI updates automatically when data changes.

## Analysis
- Current: App.jsx calls fetchItems() in useEffect on mount. Adding or updating items requires manual re-fetching or manual state updates.
- Target: App.jsx will establish a subscription to the 'items' collection. Any change in Firestore will automatically trigger a state update in the UI.

## Implementation Strategy

### 1. Update Firebase Layer (src/firebase/firestore.js)
- Import onSnapshot from 'firebase/firestore'.
- Create a new function subscribeToItems(callback).
- This function will:
    - Use the same query as fetchItems (orderBy 'date' desc).
    - Establish an onSnapshot listener.
    - Map the resulting documents to a plain JS array.
    - Pass the array to the provided callback.
    - Return the unsubscribe function.

### 2. Update UI Layer (src/App.jsx)
- Replace the one-time loadItems call in useEffect with the subscribeToItems listener.
- Ensure the unsubscribe function is returned from useEffect for proper cleanup.
- Remove the loadItems helper function.
- Remove manual state updates in handleMarkResolved and re-fetching in handlePostItem, as the real-time listener handles these automatically.

## Detailed Steps

### Step 1: Modify src/firebase/firestore.js
- [ ] Import onSnapshot.
- [ ] Implement subscribeToItems(callback):
    - Define query q = query(itemsCollection, orderBy('date', 'desc')).
    - Return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(items);
      });

### Step 2: Modify src/App.jsx
- [ ] Replace import { fetchItems, ... } with { subscribeToItems, ... }.
- [ ] Remove the loadItems function.
- [ ] Update useEffect:
    - Call subscribeToItems((data) => { setItems(data); setLoading(false); }).
    - Return the unsubscribe function.
- [ ] Update handlePostItem: remove the call to loadItems().
- [ ] Update handleMarkResolved: remove manual setItems and setSelectedItem updates.

## Critical Files
- src/firebase/firestore.js
- src/App.jsx
