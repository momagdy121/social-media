# Social Media App

A robust backend for a social media application, built using Node.js, Express, and MongoDB. This system supports user authentication, profile management, and interactions with posts, comments, likes and much more !, It provides endpoints for creating, editing, deleting, and retrieving user-generated content, ensuring a dynamic and interactive experience.

## project structure

```

├─ .gitignore
├─ config
│  ├─ cloudinary.js
│  ├─ DB.js
│  └─ server.js
├─ controllers
│  ├─ authController.js
│  ├─ commentController.js
│  ├─ likeController.js
│  ├─ pageController.js
│  ├─ postController.js
│  └─ userController.js
├─ index.js
├─ middlewares
│  ├─ allowRoutes.js
│  ├─ authValidation
│  │  ├─ auth.js
│  │  ├─ verifyAccessToken.js
│  │  └─ verifyRefreshToken.js
│  ├─ globalErrorHandler.js
│  ├─ globalValidation
│  │  ├─ checkBodyFieldsExistence.js
│  │  ├─ isDocumentExists.js
│  │  ├─ isDocumentYours.js
│  │  └─ validateObjectID.js
│  ├─ multer.js
│  ├─ pageValidation
│  │  ├─ isOwner.js
│  │  ├─ isPageAdmin.js
│  │  └─ isUserInPendingAdminRequests.js
│  └─ uploadImage.js
├─ models
│  ├─ commentModel.js
│  ├─ follower.js
│  ├─ likeModel.js
│  ├─ pageModel.js
│  ├─ postModel.js
│  └─ userModel.js
├─ package-lock.json
├─ package.json
├─ Pipelines
│  ├─ followersPipeLines.js
│  ├─ pagePipelines.js
│  └─ PostPipelines.js
├─ README.md
├─ routers
│  ├─ authRouter.js
│  ├─ commentRouter.js
│  ├─ likeRouter.js
│  ├─ pageRouter.js
│  ├─ postRouter.js
│  └─ userRouter.js
├─ services
│  ├─ mailService
│  │  ├─ generateOTP.js
│  │  ├─ mailForm.js
│  │  ├─ resetPassMail.js
│  │  └─ verificationMail.js
│  └─ token_management
│     ├─ checkTokenDate.js
│     ├─ createToken.js
│     ├─ generateTokensFullProcess.js
│     └─ handleTokenRefresh.js
└─ Utils
   ├─ apiError.js
   ├─ catchAsync.js
   ├─ factoryHandler.js
   ├─ queryProcesses.js
   ├─ rules.js
   └─ sendResponse.js

```

## API Endpoints

1. Auth Routes (/api/auth)
   POST /signup: Register a new user.
   POST /resend-otp: Resend the OTP for account verification.
   PATCH /verify: Verify user account using OTP.
   POST /login: Log in with email and password.
   POST /logout: Log out the user.
   POST /forgot-password/code: Send a code to reset the password.
   POST /forgot-password/verify: Verify the code for resetting the password.
   PATCH /forgot-password/reset: Reset the password using the verification code.
   POST /token: Refresh the access token.
2. User Routes (/api/users)
   GET /profile: Get the current user's profile.
   PATCH /profile: Edit the current user's profile.
   GET /username/check: Check if a username is available.
   GET /search: Search for users.
   PATCH /password/change: Change the current user's password.
   GET /pending-requests: Get pending friend requests.
   GET /friends: Get the user's friends.
   POST /:userId/request: Send a friend request.
   PATCH /:userId/request/reject: Reject a friend request.
   PATCH /:userId/request/accept: Accept a friend request.
3. Post Routes (/api/posts)
   GET /feed: Get posts for the user's feed.
   GET /: Get posts by user or page.
   POST /: Create a new post.
   GET /:postId: Get a single post.
   PATCH /:postId: Update a post.
   DELETE /:postId: Delete a post.
4. Comment Routes (/api/posts/:postId/comments)
   GET /: Get all comments for a post.
   POST /: Add a comment to a post.
   GET /:commentId: Get a specific comment.
   PATCH /:commentId: Update a specific comment.
   DELETE /:commentId: Delete a specific comment.
5. Like Routes (/api/posts/:postId/likes)
   POST /: Like or unlike a post.
   GET /: Get all likes for a post.
6. Page Routes (/api/pages)
   GET /: Get pages.
   POST /: Create a page.
   GET /:pageId: Get a specific page.
   PATCH /:pageId: Update a specific page.
   DELETE /:pageId: Delete a specific page.
   Middleware Overview
   Authentication and Authorization: Ensures routes are protected and verifies user roles and permissions.
   Validation: Validates request data and ensures integrity.
   Error Handling: Provides centralized error handling across the application.
   File Upload: Handles image uploads for user avatars and posts using multer.
   Contributing
   Contributions are welcome! Please fork the repository and submit a pull request for any feature or improvement.

License
This project is licensed under the MIT License.
