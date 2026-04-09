---
type: overview
---

# get-to-canvas — Project Overview

## Problem

Freehand artists often want to transfer a reference photo to paper at a specific scale. Knowing where a point in a photo corresponds to on a physical sheet of paper requires manual calculation that is error-prone.

## Solution

An app that lets the user:
1. Load a reference photo
2. Define the target paper sheet dimensions
3. Place points on the photo
4. Instantly see where each point falls on the paper sheet (in real-world units)

## Users

Artists who draw freehand from photo references.

## Out of Scope (v1)

- Printing or exporting the result
- Storing sessions between app launches
- Multi-photo support

## Key Constraints

- Must work on a mobile device (the user places the phone next to the paper)
- Core coordinate-mapping logic must be testable independently of the UI
