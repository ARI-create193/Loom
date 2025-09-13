# User Invitation System

## Overview
This system implements a privacy-focused user invitation system where:
- User data is stored in a backend (simulated with localStorage)
- Users cannot see who has signed up on the website
- Users can search for other users only when sending invitations
- Invitations are sent to registered users only

## Key Features

### 1. Backend User Storage
- **UserStorage** (`src/utils/userStorage.ts`): Handles user registration, authentication, and profile management
- **GlobalUserDatabase** (`src/utils/globalUserDatabase.ts`): Stores all website users for invitation system
- Users are automatically synced between both systems when they register

### 2. Privacy Protection
- Users cannot browse all registered users
- No user suggestions or "people you might know" features
- Only statistics (counts) are shown, not individual user data
- User search is only available when sending invitations

### 3. User Search for Invitations
- **UserSearchForInvitation** component: Provides search functionality for invitations
- Search by name, email, role, or skills
- Results limited to 10 users for privacy
- Real-time search with debouncing
- Only shows active users (excludes current user)

### 4. Invitation System
- **SharedInvitationService**: Manages team invitations
- Validates user existence before sending invitations
- Prevents duplicate invitations
- Tracks invitation status (pending, accepted, declined)
- Cross-tab synchronization

## How It Works

### User Registration
1. User signs up through the registration form
2. User data is stored in both `userStorage` and `globalUserDatabase`
3. User is immediately available for invitations

### Sending Invitations
1. User clicks "Invite Member" in team management
2. Search component appears with user search functionality
3. User types to search for other registered users
4. System validates user exists before sending invitation
5. Invitation is sent and stored in the system

### Privacy Features
- **No User Browsing**: Users cannot see a list of all registered users
- **Search-Only Access**: User data is only accessible through invitation search
- **Limited Results**: Search results are capped at 10 users
- **Statistics Only**: Only aggregate statistics are shown (total users, online count, etc.)

## Components

### UserSearchForInvitation
- Real-time user search with debouncing
- Dropdown results with user avatars and basic info
- Handles user selection and validation
- Privacy-focused (no browsing, search-only)

### TeamManagement
- Updated to use the new search component
- Shows selected user before sending invitation
- Validates user existence through invitation service
- Handles invitation sending and responses

### GlobalUserList
- Shows only statistics, not individual users
- Privacy notice explaining the system
- Instructions on how to invite users

## API Methods

### GlobalUserDatabase
- `searchUsersForInvitation(query, currentUserEmail)`: Search users for invitations
- `checkUserExists(email)`: Validate if user exists
- `getUserForInvitation(email)`: Get minimal user data for invitations
- `getUserStats()`: Get aggregate statistics

### SharedInvitationService
- `validateUserForInvitation(email)`: Validate user before sending invitation
- `sendInvitation(invitationData)`: Send team invitation
- `respondToInvitation(invitationId, userEmail, response)`: Handle invitation responses

## Security & Privacy
- User data is not exposed in public APIs
- Search functionality is limited and controlled
- No user browsing or discovery features
- Invitation system validates user existence
- Cross-tab synchronization for real-time updates

## Usage Example
```typescript
// Search for users to invite
const results = globalUserDatabase.searchUsersForInvitation("john", currentUserEmail);

// Validate user exists before sending invitation
const validation = sharedInvitationService.validateUserForInvitation("user@example.com");

// Send invitation
const result = sharedInvitationService.sendInvitation({
  teamId: "team-123",
  teamName: "My Team",
  inviterId: "inviter@example.com",
  inviterName: "John Doe",
  inviteeEmail: "user@example.com",
  message: "Join our team!"
});
```

This system ensures user privacy while providing necessary functionality for team collaboration and invitations.
