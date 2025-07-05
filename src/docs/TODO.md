# TLS Development TODO

## Portal Registration Status

### Implement 'abandoned' Registration Status

**Current Status**: `pending` → `completed` flow is complete  
**Missing**: Handle `'abandoned'` registration status for inactive/expired portal registrations

**Implementation Options**:

- **Time-based**: Background job to mark portals as 'abandoned' after 30+ days
- **Manual**: Admin dashboard option to mark as abandoned
- **Inactivity**: Track partial registration attempts

**Priority**: Low
